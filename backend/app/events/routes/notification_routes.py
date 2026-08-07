"""
notification_routes.py
Exposes read/manage APIs for the NotificationDrawer.
"""
import logging
from fastapi import APIRouter, HTTPException, Query, status
from app.events.notification_service import notification_service

logger = logging.getLogger("NotificationRoutes")

router = APIRouter(prefix="/v1/notifications", tags=["Notifications"])


@router.get("", status_code=200, summary="Get notifications for a user")
async def get_notifications(
    userId:     str  = Query(..., description="User UID"),
    limit:      int  = Query(50,  ge=1, le=200),
    unreadOnly: bool = Query(False),
    category:   str  = Query("all"),
):
    try:
        items = notification_service.get_for_user(
            user_id=userId, limit=limit,
            unread_only=unreadOnly, category=category
        )
        unread_count = sum(1 for n in items if not n.get("read"))
        return {"success": True, "count": len(items), "unreadCount": unread_count, "notifications": items}
    except Exception as exc:
        logger.exception(exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/{notificationId}/read", status_code=200, summary="Mark single notification read")
async def mark_read(notificationId: str):
    ok = notification_service.mark_read(notificationId)
    return {"success": ok}


@router.post("/mark-all-read", status_code=200, summary="Mark all notifications read for user")
async def mark_all_read(userId: str = Query(...)):
    count = notification_service.mark_all_read(userId)
    return {"success": True, "updatedCount": count}


@router.delete("/{notificationId}", status_code=200, summary="Delete a single notification")
async def delete_notification(notificationId: str):
    ok = notification_service.delete(notificationId)
    return {"success": ok}
