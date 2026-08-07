from pydantic import BaseModel, Field
from typing import Optional
from app.ai.models.report import CreditReportModel

class AIAnalysisResponse(BaseModel):
    success: bool = Field(True, description="Indicates if AI analysis succeeded")
    message: str = Field("Analysis completed successfully", description="Status message")
    report: Optional[CreditReportModel] = Field(None, description="The generated credit report, if successful")
