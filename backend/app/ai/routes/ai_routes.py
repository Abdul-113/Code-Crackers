import logging
from fastapi import APIRouter, HTTPException, status

from app.ai.services.ai_analysis_service import ai_analysis_service
from app.ai.schemas.report import AIAnalysisResponse
from app.ai.models.report import CreditReportModel

logger = logging.getLogger("AIRoutes")

router = APIRouter(prefix="/v1/ai", tags=["AI Underwriting"])

@router.post(
    "/analyze/{invoiceId}",
    response_model=AIAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate AI Credit Report",
    description="Analyzes invoice metadata & raw text snippet to generate an enterprise credit underwriting report."
)
async def analyze_invoice(invoiceId: str):
    try:
        report_data = ai_analysis_service.analyze_invoice(invoiceId)
        # Parse into Pydantic model
        report_model = CreditReportModel(**report_data)
        return AIAnalysisResponse(
            success=True,
            message="AI credit underwriting report compiled successfully.",
            report=report_model
        )
    except ValueError as val_err:
        logger.warning(f"Invoice not found for analysis: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )
    except Exception as exc:
        logger.exception(f"AI Underwriting API route failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI credit report compilation failed: {exc}"
        )

@router.get(
    "/report/{invoiceId}",
    response_model=AIAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Get AI Credit Report",
    description="Retrieves a cached AI credit underwriting report if it exists."
)
async def get_report(invoiceId: str):
    report_data = ai_analysis_service.get_cached_report(invoiceId)
    if not report_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI Credit report not found for this invoice. Trigger analysis first."
        )
    # Parse into Pydantic model
    report_model = CreditReportModel(**report_data)
    return AIAnalysisResponse(
        success=True,
        message="AI credit underwriting report retrieved successfully.",
        report=report_model
    )

