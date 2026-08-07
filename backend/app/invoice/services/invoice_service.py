import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from app.invoice.repositories.invoice_repository import invoice_repository
from app.invoice.utils.invoice_utils import InvoiceUtils
from app.services.cloudinary_service import CloudinaryService

class InvoiceService:
    def __init__(self):
        pass

    def process_invoice_upload(
        self,
        irn: str,
        file_bytes: bytes,
        filename: str,
        invoice_number: str,
        invoice_date: str,
        due_date: str,
        invoice_amount: float,
        currency: str,
        seller_name: str,
        seller_gst: str,
        buyer_name: str,
        buyer_gst: str,
        buyer_company: str,
        industry: str,
        created_by: str
    ) -> Dict[str, Any]:
        """
        Implements the complete upload pipeline:
        1. Calculate SHA-256 hash.
        2. Reject if hash duplicate or (invoiceNumber + sellerGST) exists.
        3. Upload PDF to Cloudinary.
        4. Save final metadata to Firestore.
        """
        # Calculate file hash
        invoice_hash = InvoiceUtils.calculate_sha256(file_bytes)

        # 1. Check duplicate by Hash
        hash_dup = invoice_repository.get_by_hash(invoice_hash)
        if hash_dup:
            raise ValueError(f"Duplicate Invoice: Document with matching content hash already exists. ID: {hash_dup['invoiceId']}")

        # 2. Check duplicate by InvoiceNumber + SellerGST
        number_dup = invoice_repository.check_duplicate_by_number_and_seller(invoice_number, seller_gst)
        if number_dup:
            raise ValueError(f"Duplicate Invoice: Invoice number {invoice_number} already registered for seller {seller_gst}.")

        # Upload file to Cloudinary
        invoice_pdf_url = CloudinaryService.upload_file(file_bytes, filename)
        if not invoice_pdf_url:
            import os
            if os.getenv("CLOUDINARY_CLOUD_NAME"):
                raise RuntimeError("Failed to upload invoice document to Cloudinary storage.")
            # Fallback if Cloudinary is not configured
            invoice_pdf_url = "https://dummyimage.com/600x800/000/fff&text=Invoice+PDF+Placeholder"

        # Create complete structured metadata ready for AI / Blockchain modules
        invoice_id = str(uuid.uuid4())
        now_iso = datetime.utcnow().isoformat() + "Z"

        invoice_data = {
            "invoiceId": invoice_id,
            "irn": irn,
            "invoiceNumber": invoice_number,
            "invoiceDate": invoice_date,
            "dueDate": due_date,
            "invoiceAmount": invoice_amount,
            "currency": currency,
            "sellerName": seller_name,
            "sellerGST": seller_gst.upper(),
            "buyerName": buyer_name,
            "buyerGST": buyer_gst.upper(),
            "buyerCompany": buyer_company,
            "invoiceStatus": "PENDING",
            "industry": industry.upper(),
            "invoicePDFUrl": invoice_pdf_url,
            "invoiceHash": invoice_hash,
            "riskScore": 0.0,
            "verificationStatus": "PENDING",
            "duplicateStatus": "CLEAN",
            "marketplaceStatus": "UNLISTED",
            "blockchainStatus": "UNMINTED",
            "createdBy": created_by,
            "createdAt": now_iso,
            "updatedAt": now_iso
        }

        # Save to database repository
        return invoice_repository.save(invoice_data)

    def get_invoice(self, invoice_id: str) -> Optional[Dict[str, Any]]:
        return invoice_repository.get_by_id(invoice_id)

    def list_invoices(self, creator_id: Optional[str] = None, status: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        return invoice_repository.list_all(creator_id=creator_id, status=status, limit=limit)

    def update_invoice(self, invoice_id: str, update_fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        update_fields["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        return invoice_repository.update(invoice_id, update_fields)

    def delete_invoice(self, invoice_id: str) -> bool:
        return invoice_repository.delete(invoice_id)

invoice_service = InvoiceService()
