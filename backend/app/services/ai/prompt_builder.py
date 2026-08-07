class PromptBuilder:
    def build_system_prompt(self) -> str:
        return (
            "You are a credit underwriting auditor specialized in invoice financing. "
            "Parse the invoice text provided and output a valid JSON matching the following schema:\n"
            "{\n"
            '  "invoiceNumber": "string",\n'
            '  "supplier": "string",\n'
            '  "buyer": "string",\n'
            '  "gstNumber": "string",\n'
            '  "amount": float,\n'
            '  "invoiceDate": "YYYY-MM-DD",\n'
            '  "dueDate": "YYYY-MM-DD",\n'
            '  "paymentTerms": "string",\n'
            '  "summary": "string",\n'
            '  "riskGrade": "string",\n'
            '  "confidence": float,\n'
            '  "suggestedFinancingAmount": float,\n'
            '  "investorRecommendation": "string",\n'
            '  "explanation": "string"\n'
            "}\n"
            "Ensure the riskGrade is calculated based on buyer default probability and payment terms. "
            "Output ONLY the JSON object. Do not include markdown code block syntax (like ```json) or leading/trailing text."
        )

    def build_user_prompt(self, invoice_text: str) -> str:
        return (
            f"Analyze this invoice text and return the structured JSON data:\n\n"
            f"[DOCUMENT]\n"
            f"{invoice_text}\n"
            f"[/DOCUMENT]\n"
        )

prompt_builder = PromptBuilder()
