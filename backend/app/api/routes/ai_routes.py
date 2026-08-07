from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.ai.pdf_service import pdf_service
from app.services.ai.groq_service import groq_ai_service
import logging

logger = logging.getLogger("Invoice2Credit-AIRoutes")

router = APIRouter(prefix="/ai", tags=["AI Invoice Analysis"])

@router.post("/analyze")
async def analyze_invoice(file: UploadFile = File(...)):
    """
    Endpoint to receive multipart PDF files, extract text using PyMuPDF,
    and analyze credit risks using the Groq AI service.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF documents are supported."
        )

    try:
        # Read file bytes
        file_bytes = await file.read()
        logger.info(f"Received file upload: {file.filename} ({len(file_bytes)} bytes)")

        # Extract text
        extracted_text = pdf_service.extract_text_from_bytes(file_bytes)
        if not extracted_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract readable text from PDF. Ensure the file contains text."
            )

        logger.info(f"Successfully extracted {len(extracted_text)} characters of text from PDF.")

        # Analyze using Groq
        analysis_result = groq_ai_service.analyze_invoice_text(extracted_text)
        
        # If the result contains an error key
        if "error" in analysis_result and analysis_result["invoiceNumber"] == "ERR-PARSE-000":
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=analysis_result["error"]
            )

        return analysis_result

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected failure in invoice analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server processing failure: {str(e)}"
        )
