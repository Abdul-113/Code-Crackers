from pydantic import BaseModel, Field
from typing import List, Optional

class CreditReportModel(BaseModel):
    invoiceId: str = Field(..., description="Reference to the analyzed invoice ID")
    businessSummary: str = Field(..., description="Summary of the seller and buyer business profile")
    invoiceSummary: str = Field(..., description="Brief summary of the invoice transaction particulars")
    paymentRiskScore: int = Field(..., ge=0, le=100, description="Risk score from 0 (safest) to 100 (riskiest)")
    creditGrade: str = Field(..., description="Credit Grade: A+, A, B+, B, or C")
    probabilityOfOnTimePayment: float = Field(..., ge=0.0, le=1.0, description="Probability of on-time payment (0.0 to 1.0)")
    estimatedDelayRisk: str = Field(..., description="Estimated payment delay in days (e.g. '0-5 days', '15-30 days')")
    investmentRecommendation: str = Field(..., description="Investment rating and recommendation description")
    recommendedMaximumFundingPercentage: float = Field(..., ge=0.0, le=100.0, description="Recommended max funding limit percentage (0 to 100)")
    expectedInvestorYield: float = Field(..., ge=0.0, le=100.0, description="Expected annualized investor return percentage (0 to 100)")
    fraudIndicators: List[str] = Field(default_factory=list, description="Identified red flags or fraud signs")
    businessHealth: str = Field(..., description="Assessment of business operational and financial health")
    riskFactors: List[str] = Field(default_factory=list, description="Primary risk factors identified in transaction")
    positiveIndicators: List[str] = Field(default_factory=list, description="Positive credit/financial indicators")
    aiExplanation: str = Field(..., description="Detailed AI credit rationale explaining risk score and grades")
    confidenceScore: float = Field(..., ge=0.0, le=1.0, description="Confidence score of AI analysis itself")
    createdAt: str = Field(..., description="ISO 8601 creation timestamp")
    updatedAt: str = Field(..., description="ISO 8601 update timestamp")
