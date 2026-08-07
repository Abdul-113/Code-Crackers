from pydantic import BaseModel, Field
from typing import Optional

class InvoiceAnalysisResult(BaseModel):
    invoiceNumber: str = Field(..., description="The unique invoice identifier or invoice number")
    supplier: str = Field(..., description="The supplier / billing organization name")
    buyer: str = Field(..., description="The buyer / corporate client organization name")
    gstNumber: str = Field(..., description="The corporate GST tax registration number")
    amount: float = Field(..., description="Total billing invoice amount in INR numerical value")
    invoiceDate: str = Field(..., description="Billing invoice creation date formatted as YYYY-MM-DD")
    dueDate: str = Field(..., description="Invoiced payment maturity date formatted as YYYY-MM-DD")
    paymentTerms: str = Field(..., description="Net billing payment duration terms (e.g., 60 Days Net)")
    summary: str = Field(..., description="A short summary detailing the invoice line items")
    riskGrade: str = Field(..., description="AI estimated credit default rating grade (A+, A, B+, B, C, F)")
    confidence: float = Field(..., description="Extraction confidence percentage matching accuracy (e.g. 98.4)")
    suggestedFinancingAmount: float = Field(..., description="Calculated maximum capital loan amount recommendation in INR")
    investorRecommendation: str = Field(..., description="DeFi investor demand profile indicator (High Demand, Moderate, Low)")
    explanation: str = Field(..., description="A clear natural-language explanation explaining the credit grade rating, supplier records, and repayment trust factors")
