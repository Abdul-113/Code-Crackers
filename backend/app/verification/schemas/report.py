from pydantic import BaseModel, Field
from typing import Optional
from app.verification.models.report import VerificationReportModel

class VerificationResponse(BaseModel):
    success: bool = Field(True, description="Indicates if verification pipeline completed")
    message: str = Field("Verification executed successfully", description="Status message")
    report: Optional[VerificationReportModel] = Field(None, description="The complete verification report details")
