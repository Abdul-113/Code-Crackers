from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InvoiceBase(BaseModel):
    irn: Optional[str] = Field("", description="Invoice Reference Number (64-character hex)")
    invoiceNumber: str = Field(..., description="Unique invoice identifier from the issuer")
    invoiceDate: str = Field(..., description="Date of invoice issuance in YYYY-MM-DD format")
    dueDate: Optional[str] = Field(None, description="Payment due date in YYYY-MM-DD format")
    invoiceAmount: float = Field(0.0, description="Total amount of the invoice")
    currency: Optional[str] = Field("INR", description="Three-letter currency code (e.g., INR, USD)")
    sellerName: Optional[str] = Field(None, description="Legal name of the selling entity")
    sellerGST: Optional[str] = Field(None, description="15-character GSTIN of the seller")
    buyerName: Optional[str] = Field(None, description="Legal name of the buying entity")
    buyerGST: Optional[str] = Field(None, description="15-character GSTIN of the buyer")
    buyerCompany: Optional[str] = Field(None, description="Registered company name of the buyer")
    buyerId: Optional[str] = Field(None, description="User ID of the assigned corporate buyer")
    buyerApproved: Optional[bool] = Field(False, description="Whether the corporate buyer has confirmed the invoice")
    industry: Optional[str] = Field("RETAIL", description="Sector classification of the transaction (e.g. TEXTILES, RETAIL)")

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    invoiceNumber: Optional[str] = None
    invoiceDate: Optional[str] = None
    dueDate: Optional[str] = None
    invoiceAmount: Optional[float] = None
    currency: Optional[str] = None
    sellerName: Optional[str] = None
    sellerGST: Optional[str] = None
    buyerName: Optional[str] = None
    buyerGST: Optional[str] = None
    buyerCompany: Optional[str] = None
    buyerId: Optional[str] = None
    buyerApproved: Optional[bool] = None
    industry: Optional[str] = None
    invoiceStatus: Optional[str] = None
    verificationStatus: Optional[str] = None
    duplicateStatus: Optional[str] = None
    marketplaceStatus: Optional[str] = None
    blockchainStatus: Optional[str] = None
    riskScore: Optional[float] = None

class InvoiceResponse(InvoiceBase):
    invoiceId: str
    invoiceStatus: Optional[str] = "PENDING"
    invoicePDFUrl: Optional[str] = None
    invoiceHash: Optional[str] = None
    riskScore: Optional[float] = 0.0
    verificationStatus: Optional[str] = "PENDING"
    duplicateStatus: Optional[str] = "CLEAN"
    marketplaceStatus: Optional[str] = "UNLISTED"
    blockchainStatus: Optional[str] = "UNMINTED"
    buyerApproved: Optional[bool] = False
    buyerId: Optional[str] = None
    createdBy: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True
