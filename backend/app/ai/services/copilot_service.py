import os
import json
import logging
from datetime import datetime
from typing import Generator, List, Dict, Any, Optional
from groq import Groq

from app.services.firebase.firebase_service import firebase_service
from app.ai.prompts.copilot import COPILOT_SYSTEM_PROMPT

logger = logging.getLogger("CopilotService")

class CopilotService:
    def __init__(self):
        self._groq_client: Optional[Groq] = None

    @property
    def groq_client(self) -> Groq:
        if not self._groq_client:
            api_key = os.getenv("GROQ_API_KEY")
            self._groq_client = Groq(api_key=api_key)
        return self._groq_client

    @property
    def db(self):
        if not firebase_service.db:
            raise RuntimeError("Firestore is not initialized.")
        return firebase_service.db

    def _fetch_platform_context(self) -> str:
        """
        Gathers live invoices and credit reports from Firestore to feed as
        ground truth context to the LLM.
        """
        context_lines = []
        try:
            # 1. Fetch Invoices
            invoices_ref = self.db.collection("invoices").limit(30).get()
            invoices_list = [doc.to_dict() for doc in invoices_ref]
            
            if invoices_list:
                context_lines.append("AVAILABLE INVOICES IN PLATFORM:")
                for inv in invoices_list:
                    line = (
                        f"- Invoice ID: {inv.get('invoiceId')}, Num: {inv.get('invoiceNumber')}, "
                        f"Seller: {inv.get('sellerName')}, Buyer: {inv.get('buyerName')}, "
                        f"Amount: {inv.get('invoiceAmount')} {inv.get('currency')}, "
                        f"Status: {inv.get('invoiceStatus')}, Risk Score: {inv.get('riskScore', 'N/A')}"
                    )
                    context_lines.append(line)
            else:
                context_lines.append("No invoices uploaded yet.")

            # 2. Fetch Credit Reports
            reports_ref = self.db.collection("invoiceReports").limit(15).get()
            reports_list = [doc.to_dict() for doc in reports_ref]
            if reports_list:
                context_lines.append("\nGENERATED AI CREDIT REPORTS:")
                for rep in reports_list:
                    line = (
                        f"- Invoice ID: {rep.get('invoiceId')}, Grade: {rep.get('creditGrade')}, "
                        f"Payment Risk Score: {rep.get('paymentRiskScore')}/100, "
                        f"Delay Risk: {rep.get('estimatedDelayRisk')}, "
                        f"Funding Cap Recommendation: {rep.get('recommendedMaximumFundingPercentage')}%, "
                        f"Expected Yield: {rep.get('expectedInvestorYield')}% APR, "
                        f"Investment Rating: {rep.get('investmentRecommendation')}"
                    )
                    context_lines.append(line)

        except Exception as exc:
            logger.error(f"Error fetching platform context for copilot: {exc}")
            context_lines.append("Live context unavailable due to system query error.")

        return "\n".join(context_lines)

    def stream_copilot_chat(
        self,
        chat_id: str,
        user_id: str,
        message_text: str,
        history: List[Dict[str, str]]
    ) -> Generator[str, None, None]:
        """
        Streams assistant response tokens back to FastAPI client while appending
        the final response to the conversation history in Firestore.
        """
        # 1. Fetch live database state
        context_str = self._fetch_platform_context()
        system_content = COPILOT_SYSTEM_PROMPT.format(context_str=context_str)

        # 2. Reconstruct messages list for Llama completion
        messages = [{"role": "system", "content": system_content}]
        
        # Append sliding conversation history (max 8 messages)
        for msg in history[-8:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Append current user prompt
        messages.append({"role": "user", "content": message_text})

        # 3. Call Groq with streaming mode
        full_reply_accum = []
        try:
            stream = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-specdec",
                messages=messages,
                temperature=0.2,
                max_tokens=1500,
                stream=True
            )

            # Yield tokens chunk by chunk
            for chunk in stream:
                token = chunk.choices[0].delta.content
                if token:
                    full_reply_accum.append(token)
                    yield token

        except Exception as exc:
            logger.exception(f"Groq copilot stream crashed: {exc}")
            err_msg = f"\n[AI Assistant error: {exc}]"
            full_reply_accum.append(err_msg)
            yield err_msg

        # 4. Save entire conversation exchange to Firestore
        try:
            full_reply = "".join(full_reply_accum)
            now_str = datetime.utcnow().isoformat() + "Z"
            
            chat_doc_ref = self.db.collection("chats").document(chat_id)
            chat_doc = chat_doc_ref.get()
            
            messages_to_save = []
            if chat_doc.exists:
                messages_to_save = chat_doc.to_dict().get("messages", [])

            # Append user message
            messages_to_save.append({
                "role": "user",
                "content": message_text,
                "timestamp": now_str
            })
            # Append assistant message
            messages_to_save.append({
                "role": "assistant",
                "content": full_reply,
                "timestamp": now_str
            })

            # Save to Firestore
            chat_doc_ref.set({
                "chatId": chat_id,
                "userId": user_id,
                "messages": messages_to_save,
                "updatedAt": now_str
            })
            logger.info(f"Stored chat exchange in document {chat_id}")

        except Exception as store_exc:
            logger.error(f"Failed to persist chat in Firestore: {store_exc}")

# Global singleton
copilot_service = CopilotService()
