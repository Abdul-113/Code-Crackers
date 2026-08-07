import asyncio
import logging
import os
from datetime import datetime

logger = logging.getLogger("BlockchainListener")

# Minimal ABIs for event parsing
REGISTRY_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True,  "internalType": "bytes32", "name": "hash",    "type": "bytes32"},
            {"indexed": True,  "internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"indexed": True,  "internalType": "address", "name": "msme",    "type": "address"}
        ],
        "name": "InvoiceHashRegistered",
        "type": "event"
    }
]

ESCROW_FACTORY_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True,  "internalType": "uint256", "name": "tokenId",       "type": "uint256"},
            {"indexed": True,  "internalType": "address", "name": "escrowAddress", "type": "address"},
            {"indexed": True,  "internalType": "address", "name": "msme",          "type": "address"},
            {"indexed": False, "internalType": "uint256", "name": "invoiceAmount", "type": "uint256"},
            {"indexed": False, "internalType": "uint256", "name": "dueDate",       "type": "uint256"}
        ],
        "name": "EscrowCreated",
        "type": "event"
    }
]

POLL_INTERVAL_SECONDS = 30
last_processed_block: dict = {"registry": None, "escrow": None}


async def _sync_registry_events(w3, db, nft_addr: str):
    """Listens for InvoiceHashRegistered events and syncs Firestore."""
    global last_processed_block
    try:
        from_block = last_processed_block["registry"] or (w3.eth.block_number - 5)
        to_block = w3.eth.block_number

        if from_block >= to_block:
            return

        contract = w3.eth.contract(address=w3.to_checksum_address(nft_addr), abi=REGISTRY_ABI)
        events = contract.events.InvoiceHashRegistered.get_logs(from_block=from_block, to_block=to_block)

        for event in events:
            token_id = event["args"]["tokenId"]
            msme_addr = event["args"]["msme"]
            tx_hash = event["transactionHash"].hex()
            logger.info(f"[Listener] InvoiceHashRegistered: tokenId={token_id}, msme={msme_addr}, tx={tx_hash}")

            # Find invoice by tokenId and sync status
            try:
                docs = db.collection("invoices").where("tokenId", "==", str(token_id)).stream()
                now_iso = datetime.utcnow().isoformat() + "Z"
                for doc in docs:
                    doc.reference.update({
                        "blockchainStatus": "TOKENIZED",
                        "nftTxHash": tx_hash,
                        "updatedAt": now_iso
                    })
                    logger.info(f"[Listener] Synced invoice {doc.id} to TOKENIZED")
            except Exception as e:
                logger.error(f"[Listener] Firestore sync error for InvoiceHashRegistered: {e}")

        last_processed_block["registry"] = to_block

    except Exception as e:
        logger.error(f"[Listener] Error polling InvoiceHashRegistered: {e}")


async def _sync_escrow_events(w3, db, escrow_addr: str):
    """Listens for EscrowCreated events and syncs Firestore."""
    global last_processed_block
    try:
        from_block = last_processed_block["escrow"] or (w3.eth.block_number - 5)
        to_block = w3.eth.block_number

        if from_block >= to_block:
            return

        contract = w3.eth.contract(address=w3.to_checksum_address(escrow_addr), abi=ESCROW_FACTORY_ABI)
        events = contract.events.EscrowCreated.get_logs(from_block=from_block, to_block=to_block)

        for event in events:
            token_id = event["args"]["tokenId"]
            escrow_address = event["args"]["escrowAddress"]
            tx_hash = event["transactionHash"].hex()
            logger.info(f"[Listener] EscrowCreated: tokenId={token_id}, escrow={escrow_address}, tx={tx_hash}")

            try:
                docs = db.collection("invoices").where("tokenId", "==", str(token_id)).stream()
                now_iso = datetime.utcnow().isoformat() + "Z"
                for doc in docs:
                    doc.reference.update({
                        "blockchainStatus": "ESCROWED",
                        "escrowAddress": escrow_address,
                        "escrowTxHash": tx_hash,
                        "updatedAt": now_iso
                    })
                    logger.info(f"[Listener] Synced invoice {doc.id} to ESCROWED")
            except Exception as e:
                logger.error(f"[Listener] Firestore sync error for EscrowCreated: {e}")

        last_processed_block["escrow"] = to_block

    except Exception as e:
        logger.error(f"[Listener] Error polling EscrowCreated: {e}")


async def run_blockchain_listener():
    """
    Background asyncio loop that polls Polygon Amoy every 30s for
    InvoiceHashRegistered and EscrowCreated events, keeping Firestore in sync.
    Gracefully skips if blockchain or Firestore is not configured.
    """
    from app.services.blockchain.polygon_service import polygon_service
    from app.services.firebase.firebase_service import firebase_service

    nft_addr    = os.getenv("NFT_CONTRACT_ADDRESS", "").strip()
    escrow_addr = os.getenv("ESCROW_CONTRACT_ADDRESS", "").strip()

    if not nft_addr or nft_addr == "0x..." or not escrow_addr or escrow_addr == "0x...":
        logger.warning("[Listener] Contract addresses not configured — blockchain listener disabled.")
        return

    logger.info(f"[Listener] Starting blockchain event listener. Poll interval: {POLL_INTERVAL_SECONDS}s")

    while True:
        try:
            w3 = polygon_service.w3
            db = firebase_service.db

            if w3 and w3.is_connected() and db:
                await _sync_registry_events(w3, db, nft_addr)
                await _sync_escrow_events(w3, db, escrow_addr)
            else:
                logger.warning("[Listener] Web3 or Firestore not ready — skipping poll.")

        except Exception as e:
            logger.error(f"[Listener] Unexpected error in listener loop: {e}")

        await asyncio.sleep(POLL_INTERVAL_SECONDS)
