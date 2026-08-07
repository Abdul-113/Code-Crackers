import os
import logging
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, status as http_status

from app.services.firebase.firebase_service import firebase_service
from app.services.blockchain.polygon_service import polygon_service
from app.invoice.repositories.invoice_repository import invoice_repository
from app.listing.services.listing_service import listing_service
from app.events.notification_service import notification_service
from app.events.activity_service import activity_service
from app.events.event_types import EventType

logger = logging.getLogger("AdminRoutes")

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Operations"])

# Full ABI for InvoiceRegistry (mint + view functions)
INVOICE_REGISTRY_ABI = [
    {
        "inputs": [
            {"internalType": "address",  "name": "to",          "type": "address"},
            {"internalType": "uint256",  "name": "tokenId",     "type": "uint256"},
            {"internalType": "bytes32",  "name": "invoiceHash", "type": "bytes32"}
        ],
        "name": "mintInvoice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "invoiceHash", "type": "bytes32"}],
        "name": "isHashRegistered",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# Full ABI for EscrowFactory (createEscrow)
ESCROW_FACTORY_ABI = [
    {
        "inputs": [
            {"internalType": "address",  "name": "msme",          "type": "address"},
            {"internalType": "address",  "name": "buyer",         "type": "address"},
            {"internalType": "uint256",  "name": "tokenId",       "type": "uint256"},
            {"internalType": "uint256",  "name": "invoiceAmount", "type": "uint256"},
            {"internalType": "uint256",  "name": "dueDate",       "type": "uint256"}
        ],
        "name": "createEscrow",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
        "name": "getEscrow",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True,  "internalType": "uint256",  "name": "tokenId",       "type": "uint256"},
            {"indexed": True,  "internalType": "address",  "name": "escrowAddress", "type": "address"},
            {"indexed": True,  "internalType": "address",  "name": "msme",          "type": "address"},
            {"indexed": False, "internalType": "uint256",  "name": "invoiceAmount", "type": "uint256"},
            {"indexed": False, "internalType": "uint256",  "name": "dueDate",       "type": "uint256"}
        ],
        "name": "EscrowCreated",
        "type": "event"
    }
]


def find_registered_buyer_wallet(buyer_gst: str, buyer_name: str) -> str | None:
    """Finds a registered Corporate Buyer user profile in Firestore matching GST or Name."""
    try:
        db = firebase_service.db
        if not db:
            return None
        users_stream = db.collection("users").where("role", "==", "buyer").stream()
        for doc_item in users_stream:
            u_data = doc_item.to_dict()
            prof = u_data.get("profile", {})
            wallet = u_data.get("walletAddress") or prof.get("walletAddress")
            
            u_gst = (prof.get("gst") or u_data.get("gst") or "").strip().upper()
            u_name = (prof.get("businessName") or u_data.get("displayName") or "").strip().lower()
            
            if (buyer_gst and u_gst and buyer_gst.strip().upper() == u_gst) or \
               (buyer_name and u_name and buyer_name.strip().lower() in u_name):
                if wallet and wallet.startswith("0x"):
                    logger.info(f"Matched corporate buyer '{u_name}' (GST: {u_gst}) with wallet {wallet}")
                    return wallet
    except Exception as err:
        logger.warning(f"Error querying registered buyer wallet: {err}")
    return None


@router.post(
    "/approve/{invoiceId}",
    status_code=http_status.HTTP_200_OK,
    summary="Admin: Approve Invoice → Mint NFT → Create Escrow → List on Marketplace",
    description=(
        "Human-in-the-loop approval gate. Signs and broadcasts two blockchain "
        "transactions (NFT mint + Escrow creation) and then lists the invoice on "
        "the marketplace. Updates Firestore with tokenId, txHashes and status machine."
    )
)
async def admin_approve_invoice(invoiceId: str):
    """
    State machine transition:
    PENDING → AI_VERIFIED → GST_VERIFIED → TOKENIZED → ESCROWED → LISTED
    """
    # ─── 1. Fetch Invoice ───────────────────────────────────────────────────
    invoice = invoice_repository.get_by_id(invoiceId)
    if not invoice:
        raise HTTPException(status_code=404, detail=f"Invoice {invoiceId} not found.")

    if invoice.get("blockchainStatus") not in ("UNMINTED", "PENDING", None):
        raise HTTPException(
            status_code=http_status.HTTP_409_CONFLICT,
            detail=f"Invoice already processed. blockchainStatus={invoice.get('blockchainStatus')}"
        )

    now_iso = datetime.utcnow().isoformat() + "Z"

    # ─── 2. Determine if Blockchain is available ─────────────────────────────
    w3 = polygon_service.w3
    nft_addr = os.getenv("NFT_CONTRACT_ADDRESS", "").strip()
    escrow_addr = os.getenv("ESCROW_CONTRACT_ADDRESS", "").strip()
    pk = os.getenv("CONTRACT_OWNER_PRIVATE_KEY", "").strip()
    blockchain_live = (
        polygon_service.is_connected()
        and nft_addr and nft_addr != "0x..."
        and escrow_addr and escrow_addr != "0x..."
        and pk and pk != "0x..."
    )

    token_id = None
    nft_tx_hash = None
    escrow_address = None
    escrow_tx_hash = None

    if blockchain_live:
        # ─── 3. Compute on-chain invoice hash ───────────────────────────────
        irn = invoice.get("irn", "")
        buyer_gst = invoice.get("buyerGST", "")
        amount = float(invoice.get("invoiceAmount", 0))
        due_date = invoice.get("dueDate", "")
        on_chain_hash = polygon_service.compute_invoice_hash(irn, buyer_gst, amount, due_date)

        # ─── 4. Derive a deterministic tokenId from invoiceId ───────────────
        token_id = int(invoice.get("invoiceId", "0").replace("-", "")[:15], 16) % (2**256)

        try:
            account = w3.eth.account.from_key(pk)
            owner_address = account.address

            # ─── 5. Mint NFT ────────────────────────────────────────────────
            logger.info(f"Minting NFT tokenId={token_id} for invoice {invoiceId}")
            nft_contract = w3.eth.contract(address=w3.to_checksum_address(nft_addr), abi=INVOICE_REGISTRY_ABI)
            nonce = w3.eth.get_transaction_count(owner_address)

            # Use msme address from createdBy or fall back to owner wallet
            msme_address = invoice.get("msmeWalletAddress") or owner_address

            mint_txn = nft_contract.functions.mintInvoice(
                w3.to_checksum_address(msme_address),
                token_id,
                on_chain_hash
            ).build_transaction({
                "from":     owner_address,
                "nonce":    nonce,
                "gas":      300000,
                "gasPrice": w3.eth.gas_price,
                "chainId":  80002  # Polygon Amoy
            })
            signed_mint = account.sign_transaction(mint_txn)
            nft_tx_hash = w3.eth.send_raw_transaction(signed_mint.raw_transaction).hex()
            logger.info(f"Mint tx submitted: {nft_tx_hash}")
            w3.eth.wait_for_transaction_receipt(nft_tx_hash, timeout=120)
            logger.info(f"Mint tx confirmed: {nft_tx_hash}")

            # Update status: TOKENIZED
            invoice_repository.update(invoiceId, {
                "blockchainStatus": "TOKENIZED",
                "tokenId": str(token_id),
                "nftTxHash": nft_tx_hash,
                "invoiceStatus": "TOKENIZED",
                "updatedAt": now_iso
            })

            # ─── 6. Create Escrow ────────────────────────────────────────────
            logger.info(f"Creating escrow for tokenId={token_id}")
            escrow_factory_contract = w3.eth.contract(
                address=w3.to_checksum_address(escrow_addr),
                abi=ESCROW_FACTORY_ABI
            )
            # Convert due date to unix timestamp
            try:
                due_ts = int(datetime.strptime(due_date[:10], "%Y-%m-%d").timestamp())
            except Exception:
                due_ts = int(datetime.utcnow().timestamp()) + 30 * 86400

            # Use invoice amount in wei (1 INR ≈ scaled to minimal MATIC for demo)
            amount_wei = w3.to_wei(0.001, "ether")  # Nominal demo amount

            # Auto-resolve registered corporate buyer wallet by GST/Name, fallback to owner wallet
            buyer_address = (
                invoice.get("buyerWalletAddress") or
                find_registered_buyer_wallet(buyer_gst, invoice.get("buyerName", "")) or
                owner_address
            )
            nonce2 = w3.eth.get_transaction_count(owner_address)
            escrow_txn = escrow_factory_contract.functions.createEscrow(
                w3.to_checksum_address(msme_address),
                w3.to_checksum_address(buyer_address),
                token_id,
                amount_wei,
                due_ts
            ).build_transaction({
                "from":     owner_address,
                "nonce":    nonce2,
                "gas":      500000,
                "gasPrice": w3.eth.gas_price,
                "chainId":  80002
            })
            signed_escrow = account.sign_transaction(escrow_txn)
            escrow_tx_hash = w3.eth.send_raw_transaction(signed_escrow.raw_transaction).hex()
            logger.info(f"Escrow tx submitted: {escrow_tx_hash}")
            receipt = w3.eth.wait_for_transaction_receipt(escrow_tx_hash, timeout=120)

            # Parse EscrowCreated event to get deployed escrow address
            try:
                escrow_factory_obj = w3.eth.contract(
                    address=w3.to_checksum_address(escrow_addr), abi=ESCROW_FACTORY_ABI
                )
                logs = escrow_factory_obj.events.EscrowCreated().process_receipt(receipt)
                if logs:
                    escrow_address = logs[0]["args"]["escrowAddress"]
            except Exception as e:
                logger.warning(f"Could not parse EscrowCreated event: {e}")
                escrow_address = escrow_factory_contract.functions.getEscrow(token_id).call()

            logger.info(f"Escrow confirmed at: {escrow_address}")

            # Update status: ESCROWED
            invoice_repository.update(invoiceId, {
                "blockchainStatus": "ESCROWED",
                "escrowAddress": escrow_address,
                "escrowTxHash": escrow_tx_hash,
                "invoiceStatus": "ESCROWED",
                "updatedAt": now_iso
            })

        except Exception as e:
            logger.error(f"Blockchain transaction failed for invoice {invoiceId}: {e}")
            raise HTTPException(status_code=500, detail=f"Blockchain transaction failed: {str(e)}")

    else:
        # Blockchain not configured — mark as APPROVED (demo mode)
        logger.warning(f"Blockchain not configured — approving {invoiceId} in demo mode.")
        token_id = 0
        invoice_repository.update(invoiceId, {
            "blockchainStatus": "DEMO_APPROVED",
            "invoiceStatus": "APPROVED",
            "updatedAt": now_iso
        })

    # ─── 7. Auto-list on Marketplace ─────────────────────────────────────────
    try:
        listing = listing_service.list_invoice_on_marketplace(invoiceId)
    except ValueError as ve:
        logger.warning(f"Marketplace listing skipped: {ve}")
        listing = None
    except Exception as e:
        logger.error(f"Marketplace listing error: {e}")
        listing = None

    # Final status update
    invoice_repository.update(invoiceId, {
        "invoiceStatus": "LISTED",
        "marketplaceStatus": "LISTED",
        "updatedAt": now_iso
    })

    # ─── 8. Emit notifications ────────────────────────────────────────────────
    try:
        owner_uid = invoice.get("createdBy", "")
        inv_num   = invoice.get("invoiceNumber", invoiceId)
        desc = (
            f"Invoice {inv_num} has been approved by admin and is now live on the marketplace."
            + (f" NFT Token ID: {token_id}." if token_id else "")
        )
        notification_service.create(
            user_id=owner_uid, event_type=EventType.LISTED_ON_MARKETPLACE,
            title=f"Invoice {inv_num} Approved & Listed",
            desc=desc, invoice_id=invoiceId
        )
        activity_service.log(
            user_id=owner_uid, event_type=EventType.LISTED_ON_MARKETPLACE,
            title=f"Admin Approved — {inv_num}", desc=desc,
            status="Active", invoice_id=invoiceId,
            invoice_num=inv_num, actor="Platform Admin"
        )
    except Exception as e:
        logger.warning(f"Could not emit approval notification: {e}")

    return {
        "success": True,
        "invoiceId": invoiceId,
        "tokenId": str(token_id),
        "nftTxHash": nft_tx_hash,
        "escrowAddress": escrow_address,
        "escrowTxHash": escrow_tx_hash,
        "blockchainLive": blockchain_live,
        "polygonscanNft": f"https://amoy.polygonscan.com/tx/{nft_tx_hash}" if nft_tx_hash else None,
        "polygonscanEscrow": f"https://amoy.polygonscan.com/tx/{escrow_tx_hash}" if escrow_tx_hash else None,
        "marketplaceListing": listing
    }


@router.post(
    "/users/{uid}/verify",
    status_code=http_status.HTTP_200_OK,
    summary="Admin: Verify User KYC Status",
    description="Marks a user as KYC-verified and sets their status to Active in Firestore."
)
async def admin_verify_user(uid: str):
    db = firebase_service.db
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not initialized")

    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail=f"User '{uid}' not found.")

    now_iso = datetime.utcnow().isoformat() + "Z"
    user_ref.update({
        "kycStatus": "Approved",
        "verified": True,
        "status": "Active",
        "updatedAt": now_iso
    })

    logger.info(f"Admin verified user {uid}")
    return {"success": True, "uid": uid, "kycStatus": "Approved", "status": "Active"}


@router.post(
    "/users/{uid}/suspend",
    status_code=http_status.HTTP_200_OK,
    summary="Admin: Suspend or Reactivate User",
    description="Toggles a user's status between Suspended and Active in Firestore."
)
async def admin_suspend_user(uid: str):
    db = firebase_service.db
    if not db:
        raise HTTPException(status_code=503, detail="Firestore not initialized")

    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail=f"User '{uid}' not found.")

    current_status = user_doc.to_dict().get("status", "Active")
    new_status = "Active" if current_status == "Suspended" else "Suspended"
    now_iso = datetime.utcnow().isoformat() + "Z"

    user_ref.update({
        "status": new_status,
        "updatedAt": now_iso
    })

    logger.info(f"Admin toggled user {uid} status to {new_status}")
    return {"success": True, "uid": uid, "status": new_status}

