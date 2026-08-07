"""
extraction_service.py
─────────────────────
Clean abstraction layer for invoice field extraction.

Architecture:
  BaseExtractor (ABC)
      └── PDFParserExtractor   ← active now (pdfplumber / fitz / pdfminer)
      └── (future) OCRExtractor, GroqVisionExtractor …

ExtractionService wraps the active extractor and exposes
  extract_from_bytes(file_bytes, filename) → ExtractionResult

To upgrade to OCR: create a new subclass of BaseExtractor and pass it to
ExtractionService().  Zero frontend or route changes required.
"""

from __future__ import annotations
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict

from app.invoice.utils.pdf_extractor import get_best_text, extract_fields, get_page_count

logger = logging.getLogger("ExtractionService")


# ─── Data classes ─────────────────────────────────────────────────────────

@dataclass
class FieldResult:
    """A single extracted field with provenance metadata."""
    value: Any
    confidence: float          # 0.0 → 1.0
    source: str = "pdf_parser" # "pdf_parser" | "ocr" | "manual" | …

    @property
    def label(self) -> str:
        if self.confidence >= 0.85:
            return "high"
        if self.confidence >= 0.60:
            return "medium"
        return "low"

    def to_dict(self) -> dict:
        return {
            "value":           self.value,
            "confidence":      round(self.confidence, 3),
            "confidenceLabel": self.label,     # "high" | "medium" | "low"
            "source":          self.source,
        }


@dataclass
class ExtractionResult:
    """Complete extraction result envelope."""
    fields:            Dict[str, FieldResult] = field(default_factory=dict)
    rawTextSnippet:    str   = ""
    pageCount:         int   = 0
    extractorUsed:     str   = "pdf_parser"
    overallConfidence: float = 0.0
    success:           bool  = True
    message:           str   = ""

    def to_dict(self) -> dict:
        confidences = [f.confidence for f in self.fields.values() if f.confidence > 0]
        return {
            "success":           self.success,
            "message":           self.message,
            "fields":            {k: v.to_dict() for k, v in self.fields.items()},
            "rawTextSnippet":    self.rawTextSnippet,
            "pageCount":         self.pageCount,
            "extractorUsed":     self.extractorUsed,
            "overallConfidence": round(
                sum(confidences) / len(confidences) if confidences else 0.0, 3
            ),
        }


# ─── Extractor interface ───────────────────────────────────────────────────

class BaseExtractor(ABC):
    """
    Abstract base.  Implement extract() in any subclass to plug in
    OCR, cloud vision, or any other backend transparently.
    """
    @abstractmethod
    def extract(self, file_bytes: bytes, filename: str) -> ExtractionResult:
        raise NotImplementedError


# ─── Concrete PDF extractor ────────────────────────────────────────────────

class PDFParserExtractor(BaseExtractor):
    """
    Uses pdfplumber → PyMuPDF → pdfminer.six in order of preference.
    Returns an ExtractionResult with per-field confidence scores.
    """

    def extract(self, file_bytes: bytes, filename: str) -> ExtractionResult:
        logger.info("[PDFParserExtractor] Processing %s (%d bytes)", filename, len(file_bytes))

        raw_text, extractor_name = get_best_text(file_bytes)

        if not raw_text or len(raw_text.strip()) < 30:
            logger.warning("[PDFParserExtractor] Insufficient text — likely scanned/image PDF")
            return ExtractionResult(
                success=False,
                message="Could not extract text. This may be a scanned PDF — OCR will improve results.",
                extractorUsed=extractor_name,
                pageCount=get_page_count(file_bytes),
            )

        raw_fields = extract_fields(raw_text)

        field_results: Dict[str, FieldResult] = {
            name: FieldResult(
                value=data["value"],
                confidence=data["confidence"],
                source="pdf_parser",
            )
            for name, data in raw_fields.items()
        }

        page_count = get_page_count(file_bytes)
        snippet = raw_text[:800].replace("\n", " ")

        logger.info(
            "[PDFParserExtractor] Done. extractor=%s pages=%d fields=%d",
            extractor_name, page_count, len(field_results),
        )

        return ExtractionResult(
            fields=field_results,
            rawTextSnippet=snippet,
            pageCount=page_count,
            extractorUsed=extractor_name,
            success=True,
            message="Extraction completed successfully.",
        )


# ─── Service wrapper ───────────────────────────────────────────────────────

class ExtractionService:
    """
    Delegates to whatever BaseExtractor is active.
    Hot-swap by calling use_extractor() — no routes or schemas change.
    """

    def __init__(self, extractor: BaseExtractor | None = None):
        self._extractor: BaseExtractor = extractor or PDFParserExtractor()

    def use_extractor(self, extractor: BaseExtractor) -> None:
        """Runtime swap — plug in OCR here when ready."""
        self._extractor = extractor
        logger.info("[ExtractionService] Extractor switched → %s", type(extractor).__name__)

    def extract_from_bytes(self, file_bytes: bytes, filename: str) -> ExtractionResult:
        try:
            return self._extractor.extract(file_bytes, filename)
        except Exception as exc:
            logger.exception("[ExtractionService] Extractor crashed: %s", exc)
            return ExtractionResult(
                success=False,
                message=f"Extraction error: {exc}",
                extractorUsed=type(self._extractor).__name__,
            )


# ─── Global singleton ──────────────────────────────────────────────────────
# Using GeminiExtractor by default for high-accuracy AI extraction
from app.invoice.services.gemini_extractor import GeminiExtractor
extraction_service = ExtractionService(extractor=GeminiExtractor())
