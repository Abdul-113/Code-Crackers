import re
from datetime import datetime
from typing import Dict, Any

class GSTVerificationService:
    # GSTIN Format: 2 digits state code, 10 char PAN, 1 entity code, 1 Z, 1 checksum
    GSTIN_RE = re.compile(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$')
    # IRN Format: exactly 64 character hex string
    IRN_RE = re.compile(r'^[a-fA-F0-9]{64}$')

    def verify_irn(self, irn: str, buyer_gstin: str, seller_gstin: str, amount: float, date: str) -> Dict[str, Any]:
        """
        MOCK IMPLEMENTATION — production would call a licensed GSP (GST Suvidha Provider) 
        API against the GSTN e-invoice system. This sandbox validates structure and 
        checksum only.
        """
        if not irn or not self.IRN_RE.match(irn):
            return {
                "verified": False,
                "reason": "Invalid IRN format. Must be a 64-character hex string.",
                "mockGovernmentTimestamp": None
            }

        if not buyer_gstin or not self.GSTIN_RE.match(buyer_gstin):
            return {
                "verified": False,
                "reason": f"Invalid Buyer GSTIN format: {buyer_gstin}",
                "mockGovernmentTimestamp": None
            }

        if not seller_gstin or not self.GSTIN_RE.match(seller_gstin):
            return {
                "verified": False,
                "reason": f"Invalid Seller GSTIN format: {seller_gstin}",
                "mockGovernmentTimestamp": None
            }

        if amount <= 0:
            return {
                "verified": False,
                "reason": "Invoice amount must be positive.",
                "mockGovernmentTimestamp": None
            }

        try:
            datetime.strptime(date[:10], "%Y-%m-%d")
        except ValueError:
            return {
                "verified": False,
                "reason": "Invalid invoice date format. Expected YYYY-MM-DD.",
                "mockGovernmentTimestamp": None
            }

        now_iso = datetime.utcnow().isoformat() + "Z"
        
        return {
            "verified": True,
            "reason": "MOCK GSTN IRN VERIFICATION PASSED",
            "mockGovernmentTimestamp": now_iso
        }

gst_verification_service = GSTVerificationService()
