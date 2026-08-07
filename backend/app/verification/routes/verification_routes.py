import logging
from fastapi import APIRouter, HTTPException, status
from app.verification.services.verification_service import verification_service
from app.verification.schemas.report import VerificationResponse
from app.verification.models.report import VerificationReportModel

logger = logging.getLogger("VerificationRoutes")

router = APIRouter(prefix="/v1/verification", tags=["Decision Underwriting"])

@router.post(
    "/{invoiceId}",
    response_model=VerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Invoice",
    description="Run deterministic business rules and AI underwriting models to evaluate invoice marketplace eligibility."
)
async def verify_invoice(invoiceId: str):
    try:
        report_data = verification_service.verify_invoice(invoiceId)
        report_model = VerificationReportModel(**report_data)
        return VerificationResponse(
            success=True,
            message="Invoice verification completed successfully.",
            report=report_model
        )
    except ValueError as val_err:
        logger.warning(f"Invoice not found for verification: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )
    except Exception as exc:
        logger.exception(f"Verification pipeline failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification pipeline failed: {exc}"
        )

@router.get(
    "/{invoiceId}",
    response_model=VerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Verification Report",
    description="Fetch a cached verification report if one has already been compiled."
)
async def get_verification_report(invoiceId: str):
    report_data = verification_service.get_cached_verification(invoiceId)
    if not report_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification report not found for this invoice. Trigger verification first."
        )
    report_model = VerificationReportModel(**report_data)
    return VerificationResponse(
        success=True,
        message="Verification report retrieved successfully.",
        report=report_model
    )
