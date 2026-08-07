import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status as fastapi_status, Query, Body

from app.invoice.services.invoice_service import invoice_service
from app.invoice.services.extraction_service import extraction_service
from app.invoice.schemas.invoice import InvoiceResponse, InvoiceUpdate
from app.invoice.utils.invoice_utils import InvoiceUtils
from app.events.notification_service import notification_service
from app.events.activity_service import activity_service
from app.events.event_types import EventType
from app.verification.services.gst_verification import gst_verification_service

logger = logging.getLogger("InvoiceRoutes")

router = APIRouter(prefix="/v1/invoices", tags=["Invoices"])


@router.post("/extract", status_code=fastapi_status.HTTP_200_OK)
async def extract_invoice_fields(
    file: UploadFile = File(..., description="PDF invoice to extract fields from"),
):
    """
    Stage-1 of the upload pipeline: extract invoice fields from a PDF without
    persisting anything to the database.  Returns extracted fields with per-field
    confidence scores so the UI can highlight uncertain values.

    This endpoint is fully OCR-agnostic — swap extraction_service.use_extractor()
    in extraction_service.py to upgrade from regex parsing to any OCR backend
    without touching this route.
    """
    filename = file.filename or "invoice.pdf"
    if not (filename.lower().endswith(".pdf") or file.content_type == "application/pdf"):
        raise HTTPException(
            status_code=fastapi_status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents are accepted for extraction.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(
            status_code=fastapi_status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds 20 MB maximum.",
        )

    try:
        result = extraction_service.extract_from_bytes(file_bytes, filename)
        return result.to_dict()
    except Exception as exc:
        logger.exception("Extraction endpoint error: %s", exc)
        raise HTTPException(
            status_code=fastapi_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Extraction failed: {exc}",
        )

@router.post("/upload", response_model=InvoiceResponse, status_code=fastapi_status.HTTP_201_CREATED)
async def upload_invoice(
    file: UploadFile = File(..., description="Raw PDF invoice document"),
    irn: str = Form("", description="Invoice Reference Number"),
    invoiceNumber: str = Form(..., description="Invoice unique number"),
    invoiceDate: str = Form(..., description="Invoice date in YYYY-MM-DD format"),
    dueDate: str = Form(..., description="Payment due date in YYYY-MM-DD format"),
    invoiceAmount: float = Form(..., description="Total invoice amount"),
    currency: str = Form("INR", description="Three-letter currency code"),
    sellerName: str = Form(..., description="Seller corporate legal name"),
    sellerGST: str = Form(..., description="Seller 15-character GSTIN"),
    buyerName: str = Form(..., description="Buyer corporate legal name"),
    buyerGST: str = Form(..., description="Buyer 15-character GSTIN"),
    buyerCompany: str = Form("", description="Buyer company name"),
    industry: str = Form("RETAIL", description="Sector classification (e.g. TEXTILES, RETAIL)"),
    createdBy: str = Form(..., description="UID of the user creating the invoice")
):
    """
    Exposes invoice upload pipeline.
    Accepts invoice PDF file (max 20MB) and core metadata.
    Validates PDF format, dates, amount, and GSTIN formats, uploads PDF, and stores in database.
    """
    # 1. Validate file extension/mime type is PDF
    filename = file.filename or "invoice.pdf"
    if not (filename.lower().endswith(".pdf") or file.content_type == "application/pdf"):
        raise HTTPException(
            status_code=fastapi_status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF documents are accepted."
        )

    # 2. Validate maximum file size (20 MB)
    # Read file into memory (FastAPI uses SpooledTemporaryFile)
    file_bytes = await file.read()
    max_size_bytes = 20 * 1024 * 1024 # 20MB
    if len(file_bytes) > max_size_bytes:
        raise HTTPException(
            status_code=fastapi_status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum limit of 20 Megabytes (MB)."
        )

    # 3. Validate Invoice Amount
    if not InvoiceUtils.validate_amount(invoiceAmount):
        raise HTTPException(
            status_code=fastapi_status.HTTP_400_BAD_REQUEST,
            detail="Invoice amount must be positive and greater than zero."
        )

    # 4. Validate GST Formats
    if not InvoiceUtils.validate_gst(sellerGST):
        raise HTTPException(
            status_code=fastapi_status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Seller GSTIN format: '{sellerGST}'. Must be a valid 15-character Indian GSTIN."
        )
    if not InvoiceUtils.validate_gst(buyerGST):
        raise HTTPException(
            status_code=fastapi_status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Buyer GSTIN format: '{buyerGST}'. Must be a valid 15-character Indian GSTIN."
        )

    # 5. Validate Dates
    if not InvoiceUtils.validate_dates(invoiceDate, dueDate):
        raise HTTPException(
            status_code=fastapi_status.HTTP_400_BAD_REQUEST,
            detail="Due date must be on or after the invoice date. Formats must be YYYY-MM-DD."
        )

    # 6. Mock GST IRN Validation
    verification_result = gst_verification_service.verify_irn(
        irn=irn,
        buyer_gstin=buyerGST,
        seller_gstin=sellerGST,
        amount=invoiceAmount,
        date=invoiceDate
    )
    if not verification_result["verified"]:
        raise HTTPException(
            status_code=fastapi_status.HTTP_400_BAD_REQUEST,
            detail=verification_result["reason"]
        )

    # 7. On-chain Hash Duplicate Check
    from app.services.blockchain.polygon_service import polygon_service
    invoice_hash = polygon_service.compute_invoice_hash(
        irn=irn,
        buyer_gstin=buyerGST,
        amount=invoiceAmount,
        due_date=dueDate
    )
    existing_token = polygon_service.check_duplicate_hash_onchain(invoice_hash)
    if existing_token is not None:
        raise HTTPException(
            status_code=fastapi_status.HTTP_409_CONFLICT,
            detail=f"Duplicate invoice detected on-chain! This invoice hash is already registered to Token ID: {existing_token}"
        )

    try:
        # Call Service Layer
        invoice = invoice_service.process_invoice_upload(
            irn=irn,
            file_bytes=file_bytes,
            filename=filename,
            invoice_number=invoiceNumber,
            invoice_date=invoiceDate,
            due_date=dueDate,
            invoice_amount=invoiceAmount,
            currency=currency,
            seller_name=sellerName,
            seller_gst=sellerGST,
            buyer_name=buyerName,
            buyer_gst=buyerGST,
            buyer_company=buyerCompany or buyerName,
            industry=industry,
            created_by=createdBy
        )

        # Fire notification + activity log
        _desc = f"Invoice {invoiceNumber} submitted by {sellerName} (Buyer: {buyerName}) — Amount: {currency} {invoiceAmount:,.0f}."
        notification_service.create(
            user_id=createdBy, event_type=EventType.INVOICE_UPLOADED,
            title=f"Invoice {invoiceNumber} Uploaded", desc=_desc,
            invoice_id=invoice.get("invoiceId")
        )
        activity_service.log(
            user_id=createdBy, event_type=EventType.INVOICE_UPLOADED,
            title=f"New Invoice Uploaded — {invoiceNumber}", desc=_desc,
            status="Completed", invoice_id=invoice.get("invoiceId"),
            invoice_num=invoiceNumber, actor=sellerName
        )

        return invoice
    except ValueError as ve:
        # Business validation duplicate error
        raise HTTPException(
            status_code=fastapi_status.HTTP_409_CONFLICT,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error processing invoice upload: {e}")
        raise HTTPException(
            status_code=fastapi_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )

@router.get("", response_model=List[InvoiceResponse])
async def list_invoices(
    createdBy: Optional[str] = Query(None, description="Filter invoices by creator UID"),
    status: Optional[str] = Query(None, description="Filter invoices by invoiceStatus"),
    limit: int = Query(50, ge=1, le=100, description="Page limit size")
):
    """
    Lists invoices with optional search filters.
    """
    try:
        return invoice_service.list_invoices(creator_id=createdBy, status=status, limit=limit)
    except Exception as e:
        logger.error(f"Error listing invoices: {e}")
        raise HTTPException(
            status_code=fastapi_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )

@router.get("/{id}", response_model=InvoiceResponse)
async def get_invoice_by_id(id: str):
    """
    Retrieves a single invoice by its unique document ID.
    """
    invoice = invoice_service.get_invoice(id)
    if not invoice:
        raise HTTPException(
            status_code=fastapi_status.HTTP_404_NOT_FOUND,
            detail=f"Invoice document with ID '{id}' was not found."
        )
    return invoice

@router.put("/{id}", response_model=InvoiceResponse)
async def update_invoice(id: str, fields: InvoiceUpdate = Body(...)):
    """
    Updates specific invoice metadata fields.
    """
    try:
        # Validate updated dates if both are provided
        if fields.invoiceDate and fields.dueDate:
            if not InvoiceUtils.validate_dates(fields.invoiceDate, fields.dueDate):
                raise HTTPException(
                    status_code=fastapi_status.HTTP_400_BAD_REQUEST,
                    detail="Due date must be on or after the invoice date."
                )
        
        # Validate GST fields if provided
        if fields.sellerGST and not InvoiceUtils.validate_gst(fields.sellerGST):
            raise HTTPException(
                status_code=fastapi_status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid Seller GSTIN format: '{fields.sellerGST}'"
            )
        if fields.buyerGST and not InvoiceUtils.validate_gst(fields.buyerGST):
            raise HTTPException(
                status_code=fastapi_status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid Buyer GSTIN format: '{fields.buyerGST}'"
            )

        update_dict = fields.model_dump(exclude_unset=True)
        updated_invoice = invoice_service.update_invoice(id, update_dict)
        if not updated_invoice:
            raise HTTPException(
                status_code=fastapi_status.HTTP_404_NOT_FOUND,
                detail=f"Invoice document with ID '{id}' was not found."
            )
        return updated_invoice
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating invoice {id}: {e}")
        raise HTTPException(
            status_code=fastapi_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )

@router.delete("/{id}", status_code=fastapi_status.HTTP_200_OK)
async def delete_invoice(id: str):
    """
    Removes an invoice document from the database.
    """
    deleted = invoice_service.delete_invoice(id)
    if not deleted:
        raise HTTPException(
            status_code=fastapi_status.HTTP_404_NOT_FOUND,
            detail=f"Invoice document with ID '{id}' was not found or could not be deleted."
        )
    return {"status": "success", "message": f"Successfully deleted invoice '{id}'."}

@router.post("/{id}/mint", status_code=fastapi_status.HTTP_200_OK)
async def mint_invoice_nft(id: str):
    """
    Mints an ERC-721 NFT on the Polygon Amoy blockchain for a verified invoice.
    Signs the transaction with CONTRACT_OWNER_PRIVATE_KEY and updates Firestore.
    """
    from app.services.blockchain.polygon_service import polygon_service
    from datetime import datetime
    import logging
    logger = logging.getLogger("InvoiceRoutes")

    # 1. Fetch invoice
    invoice = invoice_service.get_invoice(id)
    if not invoice:
        raise HTTPException(
            status_code=fastapi_status.HTTP_404_NOT_FOUND,
            detail=f"Invoice '{id}' not found."
        )

    # 2. Guard: already minted?
    if invoice.get("blockchainStatus") and invoice.get("blockchainStatus") != "UNMINTED":
        return {
            "status": "already_minted",
            "blockchainStatus": invoice["blockchainStatus"],
            "message": f"Invoice is already minted: {invoice['blockchainStatus']}"
        }

    # 3. Guard: must be compliance verified AND approved by Corporate Buyer
    is_buyer_approved = invoice.get("buyerApproved") is True or invoice.get("verificationStatus") == "BUYER_APPROVED"
    if not is_buyer_approved:
        raise HTTPException(
            status_code=fastapi_status.HTTP_400_BAD_REQUEST,
            detail="Invoice must be acknowledged and approved by the assigned Corporate Buyer before NFT minting."
        )

    is_eligible = invoice.get("marketplaceStatus") == "ELIGIBLE"
    if not is_eligible:
        raise HTTPException(
            status_code=fastapi_status.HTTP_400_BAD_REQUEST,
            detail=f"Invoice must be compliance-verified before NFT minting. Current status: {invoice.get('verificationStatus')}"
        )

    invoice_hash_hex = invoice.get("invoiceHash", "")
    if not invoice_hash_hex:
        raise HTTPException(
            status_code=fastapi_status.HTTP_400_BAD_REQUEST,
            detail="Invoice content hash is missing — cannot mint."
        )

    # 4. Check if already registered on-chain (re-sync if previously minted on Polygon Amoy)
    try:
        hash_bytes = bytes.fromhex(invoice_hash_hex.replace('0x', ''))
        existing_token_id = polygon_service.check_duplicate_hash_onchain(hash_bytes)
        if existing_token_id is not None and existing_token_id > 0:
            logger.info(f"Invoice hash already registered on-chain with Token ID {existing_token_id}. Syncing Firestore.")
            update_payload = {
                "blockchainStatus": "MINTED",
                "nftTokenId": existing_token_id,
                "updatedAt": datetime.utcnow().isoformat() + "Z"
            }
            invoice_service.update_invoice(id, update_payload)
            return {
                "status": "minted",
                "tokenId": existing_token_id,
                "blockchainStatus": "MINTED",
                "message": f"Invoice verified & registered on Polygon Amoy with Token ID: #{existing_token_id}."
            }
    except Exception as check_err:
        logger.warning(f"On-chain duplicate pre-check failed: {check_err}")

    # 5. Unique token ID from timestamp
    token_id = int(datetime.utcnow().timestamp()) % (10 ** 9)

    # 6. Mint NFT on Polygon Amoy
    try:
        owner_account = polygon_service.w3.eth.account.from_key(polygon_service.private_key)
        mint_result = polygon_service.mint_invoice_nft(
            to_address=owner_account.address,
            token_id=token_id,
            invoice_hash_hex=invoice_hash_hex
        )
    except Exception as mint_err:
        logger.error(f"NFT mint failed for invoice {id}: {mint_err}")
        raise HTTPException(
            status_code=fastapi_status.HTTP_502_BAD_GATEWAY,
            detail=f"Blockchain mint failed: {str(mint_err)}"
        )

    # 7. Persist mint data to Firestore
    update_payload = {
        "blockchainStatus": "MINTED",
        "nftTokenId": mint_result["tokenId"],
        "nftTxHash": mint_result["txHash"],
        "nftBlockNumber": mint_result["blockNumber"],
        "updatedAt": datetime.utcnow().isoformat() + "Z"
    }
    invoice_service.update_invoice(id, update_payload)

    logger.info(f"Invoice {id} minted — Token: {token_id}, Tx: {mint_result['txHash']}")
    return {
        "status": "minted",
        "tokenId": mint_result["tokenId"],
        "txHash": mint_result["txHash"],
        "blockNumber": mint_result["blockNumber"],
        "blockchainStatus": "MINTED",
        "invoiceId": id,
        "polygonScanUrl": f"https://amoy.polygonscan.com/tx/{mint_result['txHash']}",
        "message": f"NFT successfully minted on Polygon Amoy. Token ID: #{mint_result['tokenId']}"
    }
