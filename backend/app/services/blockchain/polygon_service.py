import os
import time
import logging
from web3 import Web3
from eth_abi.packed import encode_packed

logger = logging.getLogger("PolygonService")

# Minimal ABI — only the functions we call
INVOICE_REGISTRY_ABI = [
    {
        "inputs": [{"internalType": "bytes32", "name": "invoiceHash", "type": "bytes32"}],
        "name": "isHashRegistered",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "name": "hashToTokenId",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "to",          "type": "address"},
            {"internalType": "uint256", "name": "tokenId",     "type": "uint256"},
            {"internalType": "bytes32", "name": "invoiceHash", "type": "bytes32"}
        ],
        "name": "mintInvoice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

class PolygonService:
    # Fallback RPC list — tried in order
    FALLBACK_RPCS = [
        "https://polygon-amoy-bor-rpc.publicnode.com",
        "https://polygon-amoy.gateway.tenderly.co",
        "https://polygon-amoy-public.nodies.app",
    ]

    def __init__(self):
        self.nft_contract_address = os.getenv("NFT_CONTRACT_ADDRESS")
        self.private_key = os.getenv("CONTRACT_OWNER_PRIVATE_KEY")
        self._w3 = None

    def _build_w3(self) -> "Web3 | None":
        """Try primary RPC from env, then each fallback, return first that connects."""
        primary = os.getenv("POLYGON_AMOY_RPC_URL")
        candidates = []
        if primary:
            candidates.append(primary)
        for fb in self.FALLBACK_RPCS:
            if fb not in candidates:
                candidates.append(fb)

        for url in candidates:
            try:
                w3 = Web3(Web3.HTTPProvider(url, request_kwargs={"timeout": 10}))
                if w3.is_connected():
                    logger.info(f"[PolygonService] Connected via {url}")
                    return w3
                else:
                    logger.warning(f"[PolygonService] RPC not connected: {url}")
            except Exception as e:
                logger.warning(f"[PolygonService] RPC error ({url}): {e}")
        return None

    @property
    def w3(self):
        """Lazy-load and auto-reconnect Web3 instance."""
        if self._w3 is None or not self._w3.is_connected():
            self._w3 = self._build_w3()
        return self._w3

    def is_connected(self) -> bool:
        return self.w3 is not None and self.w3.is_connected()

    def get_latest_block(self) -> int:
        if not self.is_connected():
            return 0
        return self.w3.eth.block_number

    def _get_contract(self):
        """Returns the InvoiceRegistry contract instance."""
        if not self.is_connected() or not self.nft_contract_address:
            raise RuntimeError("Web3 not connected or NFT_CONTRACT_ADDRESS missing.")
        checksum_addr = Web3.to_checksum_address(self.nft_contract_address)
        return self.w3.eth.contract(address=checksum_addr, abi=INVOICE_REGISTRY_ABI)

    def compute_invoice_hash(self, irn: str, buyer_gstin: str, amount: float, due_date: str) -> bytes:
        """
        Computes keccak256(abi.encodePacked(IRN, buyerGSTIN, amount, dueDate))
        """
        amount_int = int(amount)
        encoded = encode_packed(
            ['string', 'string', 'uint256', 'string'],
            [irn, buyer_gstin, amount_int, due_date]
        )
        return Web3.keccak(encoded)

    def check_duplicate_hash_onchain(self, invoice_hash: bytes):
        """
        Returns the existing Token ID if registered, or None if not registered.
        """
        try:
            contract = self._get_contract()
            is_registered = contract.functions.isHashRegistered(invoice_hash).call()
            if is_registered:
                token_id = contract.functions.hashToTokenId(invoice_hash).call()
                return token_id
            return None
        except RuntimeError:
            logger.warning("Web3 not connected or NFT_CONTRACT_ADDRESS missing. Skipping on-chain duplicate check.")
            return None
        except Exception as e:
            logger.error(f"Failed to check duplicate hash on-chain: {e}")
            return None

    def mint_invoice_nft(self, to_address: str, token_id: int, invoice_hash_hex: str) -> dict:
        """
        Mints an ERC-721 Invoice NFT on the InvoiceRegistry contract.
        Signs and broadcasts the transaction using CONTRACT_OWNER_PRIVATE_KEY.
        Returns a dict with txHash, tokenId, blockNumber.
        """
        if not self.is_connected():
            raise RuntimeError("Web3 is not connected. Check POLYGON_AMOY_RPC_URL.")
        if not self.private_key:
            raise RuntimeError("CONTRACT_OWNER_PRIVATE_KEY is not configured in .env.")
        if not self.nft_contract_address:
            raise RuntimeError("NFT_CONTRACT_ADDRESS is not configured in .env.")

        contract = self._get_contract()
        owner_account = self.w3.eth.account.from_key(self.private_key)
        to_checksum = Web3.to_checksum_address(to_address)

        # Convert hex hash string to bytes32
        if isinstance(invoice_hash_hex, str):
            hash_bytes = bytes.fromhex(invoice_hash_hex.replace('0x', ''))
        else:
            hash_bytes = invoice_hash_hex

        # Build transaction
        nonce = self.w3.eth.get_transaction_count(owner_account.address)
        gas_price = self.w3.eth.gas_price

        tx = contract.functions.mintInvoice(
            to_checksum, token_id, hash_bytes
        ).build_transaction({
            'from':     owner_account.address,
            'nonce':    nonce,
            'gas':      300000,
            'gasPrice': gas_price,
            'chainId':  80002,   # Polygon Amoy chain ID
        })

        # Sign and send
        signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        logger.info(f"NFT mint transaction sent: {tx_hash.hex()}")

        # Wait for receipt (up to 60s)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
        logger.info(f"NFT minted! Block: {receipt.blockNumber}, Status: {receipt.status}")

        if receipt.status != 1:
            raise RuntimeError(f"Mint transaction reverted. Tx: {tx_hash.hex()}")

        return {
            "txHash":      tx_hash.hex(),
            "tokenId":     token_id,
            "blockNumber": receipt.blockNumber,
            "from":        owner_account.address,
            "to":          to_checksum,
        }

# Central Instance
polygon_service = PolygonService()
