import re
import hashlib
from datetime import datetime

# Indian GSTIN format: 2 numbers, 10 alphanumeric chars (PAN), 1 number, 1 alpha char, 1 number/alpha
GST_REGEX = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")

class InvoiceUtils:
    @staticmethod
    def calculate_sha256(file_bytes: bytes) -> str:
        """
        Calculates SHA-256 hash of a file's raw bytes to ensure content uniqueness and integrity.
        """
        sha256 = hashlib.sha256()
        sha256.update(file_bytes)
        return sha256.hexdigest()

    @staticmethod
    def validate_gst(gst: str) -> bool:
        """
        Validates if the GST matches the standard Indian GSTIN 15-character format.
        """
        if not gst or len(gst) != 15:
            return False
        return bool(GST_REGEX.match(gst.upper()))

    @staticmethod
    def validate_dates(invoice_date_str: str, due_date_str: str) -> bool:
        """
        Validates that dates are in YYYY-MM-DD format and due date is on or after invoice date.
        """
        try:
            inv_date = datetime.strptime(invoice_date_str, "%Y-%m-%d")
            due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
            return due_date >= inv_date
        except ValueError:
            return False

    @staticmethod
    def validate_amount(amount: float) -> bool:
        """
        Ensures the invoice amount is positive and greater than zero.
        """
        return amount > 0.0
