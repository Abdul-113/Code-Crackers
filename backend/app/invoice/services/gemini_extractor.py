import os
import json
import logging
import requests
from typing import Dict, Any

from app.invoice.services.extraction_service import BaseExtractor, ExtractionResult, FieldResult
from app.invoice.utils.pdf_extractor import get_best_text, get_page_count

logger = logging.getLogger("GeminiExtractor")

class GeminiExtractor(BaseExtractor):
    """
    Uses Google's Gemini 1.5 Flash REST API to extract fields from invoice text.
    Bypasses google-generativeai SDK to avoid protobuf version conflicts with Firestore.
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY environment variable is not set. Gemini extractor will fail.")
        
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"

    def extract(self, file_bytes: bytes, filename: str) -> ExtractionResult:
        logger.info("[GeminiExtractor] Processing %s (%d bytes)", filename, len(file_bytes))
        
        # We can extract text using the existing tools
        raw_text, base_extractor_name = get_best_text(file_bytes)
        page_count = get_page_count(file_bytes)
        snippet = raw_text[:800].replace("\n", " ") if raw_text else ""

        if not raw_text or len(raw_text.strip()) < 30:
            logger.warning("[GeminiExtractor] Insufficient text.")

        prompt = f"""
You are an expert OCR AI system specialized in extracting structured data from business invoices.
Please extract the following information from the invoice text provided below.

REQUIRED FIELDS:
- invoiceNumber: The unique invoice number/ID (e.g., ZEN-2026-IT-042).
- invoiceDate: The date of the invoice (format: YYYY-MM-DD if possible, else just the string).
- dueDate: The payment due date of the invoice (format: YYYY-MM-DD if possible).
- invoiceAmount: The GRAND TOTAL / Total Invoice Value (purely a number, no commas or currency symbols, e.g., 12390000.00).
- currency: The 3-letter currency code (e.g., INR, USD). Default to INR if the invoice uses rupee symbols.
- sellerName: The full legal name of the supplier/seller/vendor.
- sellerGST: The GSTIN or tax registration number of the seller (15-character alphanumeric string).
- buyerName: The full legal name of the buyer (the 'Bill To' or 'Billed To' party).
- buyerGST: The GSTIN or tax registration number of the buyer.
- irn: The Invoice Reference Number (IRN) — this is a 64-character hexadecimal hash string (e.g., e2b7a421b8c9d134...). Look for labels like 'IRN', 'Invoice Reference Number', or any 64-char hex string.
- taxAmount: The total tax/GST amount on the invoice (purely a number, e.g., 1890000.00). Sum up CGST + SGST + IGST if broken down separately.
- sellerAddress: The full postal address of the seller including city, state, pin code.
- buyerAddress: The full postal address of the buyer including city, state, pin code.
- paymentTerms: The payment terms (e.g., 'Net 60 days', 'Net 30').

IMPORTANT: Return ONLY a valid JSON object with the exact keys above. If a field cannot be found, set its value to null. Do not use markdown blocks like ```json ... ```, just return the raw JSON object.

INVOICE TEXT:
-------------------------
{raw_text}
-------------------------
"""
        
        field_results: Dict[str, FieldResult] = {}
        success = True
        message = "Extraction completed successfully."

        try:
            logger.info("[GeminiExtractor] Sending REST request to Gemini 1.5 Flash...")
            
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.0,
                    "responseMimeType": "application/json"
                }
            }
            
            headers = {'Content-Type': 'application/json'}
            response = requests.post(self.api_url, json=payload, headers=headers)
            response.raise_for_status()
            
            res_data = response.json()
            raw_output = res_data['candidates'][0]['content']['parts'][0]['text']
            
            if raw_output.startswith("```json"):
                raw_output = raw_output[7:-3]
            elif raw_output.startswith("```"):
                raw_output = raw_output[3:-3]
                
            extracted_json = json.loads(raw_output.strip())
            logger.info("[GeminiExtractor] Successfully parsed JSON from Gemini REST API.")
            
            # Map JSON to FieldResults
            expected_keys = ["invoiceNumber", "invoiceDate", "dueDate", "invoiceAmount", "currency", "sellerName", "sellerGST", "buyerName", "buyerGST", "irn", "taxAmount", "sellerAddress", "buyerAddress", "paymentTerms"]
            for key in expected_keys:
                val = extracted_json.get(key)
                conf = 0.95 if val else 0.0
                field_results[key] = FieldResult(
                    value=val if val else "",
                    confidence=conf,
                    source="gemini_ocr"
                )

        except Exception as e:
            logger.error("[GeminiExtractor] Failed to extract via Gemini REST: %s", e)
            success = False
            message = f"Gemini Extraction failed: {str(e)}"
        
        return ExtractionResult(
            fields=field_results,
            rawTextSnippet=snippet,
            pageCount=page_count,
            extractorUsed="gemini-1.5-flash",
            success=success,
            message=message,
        )
