from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from app.services.gst_service import gst_service
from app.services.credit_score_service import compute_buyer_credit_score
import logging

logger = logging.getLogger("Invoice2Credit-BuyerRoutes")

router = APIRouter(tags=["Buyer Credit & GST Compliance"])

@router.get("/v1/buyer/credit-score/{gstin}")
async def get_buyer_credit_score(gstin: str) -> Dict[str, Any]:
    """
    Computes a real GST-backed buyer credit score (0-100) using Sandbox.co.in verification
    and return filing track status data.
    """
    try:
        clean_gst = gstin.strip().upper()
        taxpayer = gst_service.verify_gstin(clean_gst)
        returns = gst_service.get_return_filing_status(clean_gst)
        score_data = compute_buyer_credit_score(taxpayer, returns)
        return score_data
    except Exception as e:
        logger.error(f"Error computing buyer credit score for {gstin}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/v1/gst/verify/{gstin}")
async def verify_gstin(gstin: str) -> Dict[str, Any]:
    """
    Direct GSTIN lookup from Sandbox.co.in.
    """
    try:
        return gst_service.verify_gstin(gstin)
    except Exception as e:
        logger.error(f"Error verifying GSTIN {gstin}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/v1/gst/returns/{gstin}")
async def get_gst_returns(gstin: str, financial_year: str = Query("FY 2023-24")) -> List[Dict[str, Any]]:
    """
    Direct Return Filing tracking lookup from Sandbox.co.in.
    """
    try:
        return gst_service.get_return_filing_status(gstin, financial_year=financial_year)
    except Exception as e:
        logger.error(f"Error fetching GST returns for {gstin}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
