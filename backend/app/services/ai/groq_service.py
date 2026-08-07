import os
import json
import logging
from groq import Groq
from app.services.ai.prompt_builder import prompt_builder
from app.services.ai.response_parser import InvoiceAnalysisResult

logger = logging.getLogger("Invoice2Credit-Groq")

class GroqAIService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = None
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
        else:
            logger.warning("GROQ_API_KEY not found in environment configurations.")

    def analyze_invoice_text(self, text: str) -> dict:
        """
        Sends extracted invoice text to Groq model under JSON format,
        validating it against the InvoiceAnalysisResult Pydantic schema.
        """
        if not self.client:
            logger.error("Groq API client is not initialized.")
            return {"error": "Groq client not configured"}

        system_msg = prompt_builder.build_system_prompt()
        user_msg = prompt_builder.build_user_prompt(text)

        # Retries loop
        for attempt in range(3):
            try:
                # Call Groq API with JSON mode
                chat_completion = self.client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_msg}
                    ],
                    model="llama3-8b-8192", # Llama-3 8B is reliable and fast
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
                
                raw_response = chat_completion.choices[0].message.content.strip()
                logger.info(f"Groq Raw Response on attempt {attempt+1}: {raw_response[:200]}...")

                # Parse JSON
                parsed_json = json.loads(raw_response)
                
                # Validate using Pydantic
                validated_data = InvoiceAnalysisResult(**parsed_json)
                return validated_data.dict()

            except json.JSONDecodeError as je:
                logger.error(f"Failed to decode Groq response JSON on attempt {attempt+1}: {je}")
            except Exception as e:
                logger.error(f"Groq API transaction failed on attempt {attempt+1}: {e}")

        # If all retries fail, return a fallback parse structure with default values
        logger.error("All Groq API compilation retries exhausted. Returning fallback parsing structure.")
        return {
            "error": "Failed to extract validated invoice values",
            "invoiceNumber": "ERR-PARSE-000",
            "supplier": "Unknown Supplier",
            "buyer": "Unknown Corporate",
            "gstNumber": "GST-PENDING-99",
            "amount": 0.0,
            "invoiceDate": "2026-07-09",
            "dueDate": "2026-09-09",
            "paymentTerms": "60 Days Net",
            "summary": "Extraction failure. Please review document details manually.",
            "riskGrade": "C",
            "confidence": 10.0,
            "suggestedFinancingAmount": 0.0,
            "investorRecommendation": "Low",
            "explanation": "The AI risk engine was unable to compile the invoice document parameters securely."
        }

# Central Instance
groq_ai_service = GroqAIService()
