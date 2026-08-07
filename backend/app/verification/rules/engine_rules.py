import re
from datetime import datetime
from typing import Dict, Any, Tuple
from app.verification.rules.base_rule import BaseRule

class AmountPositiveRule(BaseRule):
    @property
    def name(self) -> str:
        return "amount_validation"

    @property
    def description(self) -> str:
        return "Invoice amount must be greater than zero."

    def evaluate(self, invoice_data: Dict[str, Any]) -> Tuple[bool, str]:
        amt = invoice_data.get("invoiceAmount")
        try:
            val = float(amt) if amt is not None else 0.0
            if val > 0:
                return True, f"Invoice amount validation passed with amount {val}."
            return False, "Invoice amount must be positive."
        except Exception:
            return False, f"Invalid numerical format for amount: {amt}"

class InvoiceDatePastRule(BaseRule):
    @property
    def name(self) -> str:
        return "invoice_date_validation"

    @property
    def description(self) -> str:
        return "Invoice issuance date must not be in the future."

    def evaluate(self, invoice_data: Dict[str, Any]) -> Tuple[bool, str]:
        inv_date_str = invoice_data.get("invoiceDate")
        if not inv_date_str:
            return False, "Invoice date is missing."
        try:
            # ISO date format parsing
            inv_date = datetime.strptime(inv_date_str[:10], "%Y-%m-%d").date()
            today = datetime.utcnow().date()
            if inv_date <= today:
                return True, f"Invoice date {inv_date} is valid (past or today)."
            return False, f"Invoice date {inv_date} cannot be in the future (today is {today})."
        except Exception as exc:
            return False, f"Invalid date format (expected YYYY-MM-DD): {inv_date_str}"

class DueDateMaturityRule(BaseRule):
    @property
    def name(self) -> str:
        return "due_date_validation"

    @property
    def description(self) -> str:
        return "Maturity due date must be strictly after invoice date."

    def evaluate(self, invoice_data: Dict[str, Any]) -> Tuple[bool, str]:
        inv_date_str = invoice_data.get("invoiceDate")
        due_date_str = invoice_data.get("dueDate")
        if not inv_date_str or not due_date_str:
            return False, "Invoice date or due date is missing."
        try:
            inv_date = datetime.strptime(inv_date_str[:10], "%Y-%m-%d").date()
            due_date = datetime.strptime(due_date_str[:10], "%Y-%m-%d").date()
            if due_date > inv_date:
                days = (due_date - inv_date).days
                return True, f"Maturity due date is {days} days after invoice date."
            return False, f"Due date {due_date} must be after invoice date {inv_date}."
        except Exception:
            return False, f"Invalid date formats: inv={inv_date_str}, due={due_date_str}"

class GSTFormatRule(BaseRule):
    GSTIN_RE = re.compile(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$')

    @property
    def name(self) -> str:
        return "gst_format_validation"

    @property
    def description(self) -> str:
        return "GSTIN formats for seller and buyer must be valid."

    def evaluate(self, invoice_data: Dict[str, Any]) -> Tuple[bool, str]:
        seller_gst = invoice_data.get("sellerGST")
        buyer_gst = invoice_data.get("buyerGST")
        
        # If GST is missing
        if not seller_gst or not buyer_gst:
            return False, f"Missing GSTIN codes: seller={seller_gst}, buyer={buyer_gst}"
        
        # Format checks
        s_match = bool(self.GSTIN_RE.match(seller_gst))
        b_match = bool(self.GSTIN_RE.match(buyer_gst))
        
        if s_match and b_match:
            return True, "GSTIN formats for both counter-parties are valid."
        
        failures = []
        if not s_match:
            failures.append(f"sellerGST invalid: {seller_gst}")
        if not b_match:
            failures.append(f"buyerGST invalid: {buyer_gst}")
        return False, " | ".join(failures)

class InvoiceCompletenessRule(BaseRule):
    @property
    def name(self) -> str:
        return "invoice_completeness"

    @property
    def description(self) -> str:
        return "Check if all mandatory billing fields are present."

    def evaluate(self, invoice_data: Dict[str, Any]) -> Tuple[bool, str]:
        mandatory = [
            "invoiceId", "invoiceNumber", "sellerName", "buyerName", 
            "invoiceAmount", "invoiceDate", "dueDate"
        ]
        missing = [f for f in mandatory if not invoice_data.get(f)]
        if not missing:
            return True, "All mandatory metadata fields are populated."
        return False, f"Missing required fields: {', '.join(missing)}"

class FilesAndHashExistenceRule(BaseRule):
    @property
    def name(self) -> str:
        return "document_assets_validation"

    @property
    def description(self) -> str:
        return "Invoice PDF file link and content integrity hash must exist."

    def evaluate(self, invoice_data: Dict[str, Any]) -> Tuple[bool, str]:
        pdf_url = invoice_data.get("invoicePDFUrl")
        ihash = invoice_data.get("invoiceHash")
        
        if pdf_url and ihash:
            return True, "Secure document assets and verification hash found."
        
        failures = []
        if not pdf_url:
            failures.append("invoicePDFUrl is missing")
        if not ihash:
            failures.append("invoiceHash is missing")
        return False, " | ".join(failures)

# Rule registry
DETERMINISTIC_RULES = [
    AmountPositiveRule(),
    InvoiceDatePastRule(),
    DueDateMaturityRule(),
    GSTFormatRule(),
    InvoiceCompletenessRule(),
    FilesAndHashExistenceRule()
]
