from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RuleStatusModel(BaseModel):
    passed: bool = Field(..., description="Indicates if this rule passed validation")
    message: str = Field(..., description="Message details or validation failures")

class AIAssessmentModel(BaseModel):
    paymentRiskScore: int = Field(..., description="Underwriting risk score (0-100)")
    creditGrade: str = Field(..., description="Assigned credit grade letter")
    overallConfidence: float = Field(..., description="AI confidence score")
    explanation: str = Field(..., description="AI underwriting explanation")

class VerificationReportModel(BaseModel):
    invoiceId: str = Field(..., description="Reference invoice ID")
    eligibleForMarketplace: bool = Field(..., description="Final eligibility status for marketplace listing")
    overallStatus: str = Field(..., description="Status: 'Approved', 'Needs Review', or 'Rejected'")
    riskLevel: str = Field(..., description="Risk Level: 'Low', 'Medium', or 'High'")
    readinessScore: int = Field(..., ge=0, le=100, description="Weighted marketplace readiness score (0-100)")
    ruleValidation: Dict[str, RuleStatusModel] = Field(..., description="Summary of rule outcomes")
    aiAssessment: Optional[AIAssessmentModel] = Field(None, description="Underwriting parameters from Llama")
    recommendations: List[str] = Field(default_factory=list, description="Remediation steps or list advice")
    nextStep: str = Field(..., description="Next recommended action in the timeline")
    createdAt: str = Field(..., description="ISO creation timestamp")
    updatedAt: str = Field(..., description="ISO update timestamp")
