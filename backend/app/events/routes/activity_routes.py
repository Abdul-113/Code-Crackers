"""
activity_routes.py
Exposes read APIs for the Activity Timeline page.
"""
import logging
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger("ActivityRoutes")

router = APIRouter(prefix="/v1/activity", tags=["Activity Log"])

from app.events.activity_service import activity_service


@router.get("", status_code=200, summary="Get activity logs (user or global)")
async def get_activity(
    userId:   str = Query(None,  description="Filter by user UID; omit for global admin view"),
    limit:    int = Query(100,   ge=1, le=500),
    type:     str = Query("all", description="Event type keyword filter"),
    priority: str = Query("all", description="High | Medium | Low | all"),
    page:     int = Query(1,     ge=1),
):
    try:
        if userId:
            result = activity_service.get_for_user(
                user_id=userId, limit=limit,
                event_type_filter=type, priority_filter=priority, page=page
            )
        else:
            result = activity_service.get_all(
                limit=limit, event_type_filter=type, priority_filter=priority
            )
        return {"success": True, **result}
    except Exception as exc:
        logger.exception(exc)
        raise HTTPException(status_code=500, detail=str(exc))
