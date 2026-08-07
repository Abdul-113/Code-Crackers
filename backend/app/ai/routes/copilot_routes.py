import logging
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.ai.services.copilot_service import copilot_service
from app.ai.schemas.copilot import CopilotChatRequest
from app.services.firebase.firebase_service import firebase_service

logger = logging.getLogger("CopilotRoutes")

router = APIRouter(prefix="/v1/ai/copilot", tags=["AI Copilot Assistant"])

@router.post("/chat")
async def copilot_chat(payload: CopilotChatRequest):
    """
    Accepts user prompts, processes platform database context (invoices, reports),
    and returns a stream of token events using Server-Sent Events (SSE).
    Stores conversation logs in Firestore.
    """
    try:
        # Reconstruct list of dicts from pydantic message list
        history_list = [{"role": msg.role, "content": msg.content} for msg in payload.history]
        
        generator = copilot_service.stream_copilot_chat(
            chat_id=payload.chatId,
            user_id=payload.userId,
            message_text=payload.messageText,
            history=history_list
        )
        
        # Return StreamingResponse with SSE media type
        return StreamingResponse(generator, media_type="text/event-stream")

    except Exception as exc:
        logger.exception(f"Copilot streaming router failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Copilot assistant stream error: {exc}"
        )

@router.get("/history/{userId}", response_model=List[Dict[str, Any]])
async def get_user_chat_history(userId: str):
    """
    Fetch all chat threads created by a specific user from Firestore.
    """
    try:
        db = firebase_service.db
        if not db:
            raise RuntimeError("Firestore is not initialized.")

        query = db.collection("chats").where("userId", "==", userId).order_by("updatedAt", direction="DESCENDING").get()
        return [doc.to_dict() for doc in query]
    except Exception as exc:
        logger.exception(f"Failed to retrieve chat history: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not load chat history: {exc}"
        )

@router.get("/chat/{chatId}", response_model=Dict[str, Any])
async def get_single_chat(chatId: str):
    """
    Load a single chat thread's complete conversation exchange from Firestore.
    """
    try:
        db = firebase_service.db
        if not db:
            raise RuntimeError("Firestore is not initialized.")

        doc = db.collection("chats").document(chatId).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation thread not found."
            )
        return doc.to_dict()
    except HTTPException as http_exc:
        raise http_exc
    except Exception as exc:
        logger.exception(f"Failed to retrieve chat thread: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not load chat thread: {exc}"
        )
