"""
activity_service.py
───────────────────
Immutable audit/activity log writer and paginated reader.

Firestore collection: activityLogs
Document shape:
  id          (str)  — auto-generated
  userId      (str)  — actor uid
  eventType   (str)  — EventType enum value
  title       (str)
  desc        (str)
  category    (str)
  priority    (str)  — High | Medium | Low
  status      (str)  — Completed | Active | Pending | Failed
  invoiceId   (str)
  invoiceNum  (str)  — human-readable invoice number
  actor       (str)  — display name of who triggered the event
  createdAt   (str)  — ISO timestamp
"""
import logging
from datetime import datetime, timezone
from typing import Optional

from app.services.firebase.firebase_service import firebase_service
from app.events.event_types import EventType, EVENT_CATEGORY_MAP, EVENT_PRIORITY_MAP

logger = logging.getLogger("ActivityService")


def _group_label(created_at_str: str) -> str:
    """Compute 'Today' / 'Yesterday' / 'This Week' from ISO timestamp."""
    try:
        ts = datetime.fromisoformat(created_at_str.rstrip("Z")).replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        delta = (now.date() - ts.date()).days
        if delta == 0:
            return "Today"
        if delta == 1:
            return "Yesterday"
        return "This Week"
    except Exception:
        return "This Week"


class ActivityService:

    @property
    def db(self):
        if not firebase_service.db:
            raise RuntimeError("Firestore is not initialized.")
        return firebase_service.db

    def log(
        self,
        user_id: str,
        event_type: EventType,
        title: str,
        desc: str,
        status: str = "Completed",
        invoice_id: Optional[str] = None,
        invoice_num: Optional[str] = None,
        actor: Optional[str] = "System",
    ) -> dict:
        """Write an immutable activity log entry."""
        now = datetime.utcnow().isoformat() + "Z"
        payload = {
            "userId":     user_id,
            "eventType":  event_type.value,
            "title":      title,
            "desc":       desc,
            "category":   EVENT_CATEGORY_MAP.get(event_type, "system"),
            "priority":   EVENT_PRIORITY_MAP.get(event_type, "Medium"),
            "status":     status,
            "invoiceId":  invoice_id or "",
            "invoiceNum": invoice_num or "",
            "actor":      actor,
            "createdAt":  now,
        }
        try:
            ref = self.db.collection("activityLogs").add(payload)
            payload["id"] = ref[1].id
        except Exception as exc:
            logger.error(f"Failed to write activity log: {exc}")
            payload["id"] = "local"
        return payload

    def get_for_user(
        self,
        user_id: str,
        limit: int = 50,
        event_type_filter: Optional[str] = None,
        priority_filter: Optional[str] = None,
        page: int = 1,
    ) -> dict:
        """
        Return paginated activity logs for a user, enriched with group labels.
        """
        try:
            try:
                q = (
                    self.db.collection("activityLogs")
                    .where("userId", "==", user_id)
                    .order_by("createdAt", direction="DESCENDING")
                    .limit(limit)
                )
                docs = list(q.stream())
            except Exception as index_err:
                logger.warning(f"Composite index missing for activityLogs user query, falling back to memory sort: {index_err}")
                q = (
                    self.db.collection("activityLogs")
                    .where("userId", "==", user_id)
                    .limit(limit)
                )
                docs = list(q.stream())
                docs = sorted(docs, key=lambda d: d.to_dict().get("createdAt", ""), reverse=True)

            results = []
            for d in docs:
                data = d.to_dict()
                data["id"] = d.id
                data["group"] = _group_label(data.get("createdAt", ""))
                # Client-side filters
                if event_type_filter and event_type_filter != "all":
                    if event_type_filter.lower() not in data.get("eventType", "").lower():
                        continue
                if priority_filter and priority_filter != "all":
                    if data.get("priority") != priority_filter:
                        continue
                results.append(data)
            return {
                "total": len(results),
                "page": page,
                "limit": limit,
                "events": results,
            }
        except Exception as exc:
            logger.error(f"Failed to fetch activity logs: {exc}")
            return {"total": 0, "page": page, "limit": limit, "events": []}

    def get_all(
        self,
        limit: int = 100,
        event_type_filter: Optional[str] = None,
        priority_filter: Optional[str] = None,
    ) -> dict:
        """Return global activity logs (admin view)."""
        try:
            try:
                q = (
                    self.db.collection("activityLogs")
                    .order_by("createdAt", direction="DESCENDING")
                    .limit(limit)
                )
                docs = list(q.stream())
            except Exception as index_err:
                logger.warning(f"Composite index missing for global activityLogs, falling back to memory sort: {index_err}")
                q = (
                    self.db.collection("activityLogs")
                    .limit(limit)
                )
                docs = list(q.stream())
                docs = sorted(docs, key=lambda d: d.to_dict().get("createdAt", ""), reverse=True)

            results = []
            for d in docs:
                data = d.to_dict()
                data["id"] = d.id
                data["group"] = _group_label(data.get("createdAt", ""))
                if event_type_filter and event_type_filter != "all":
                    if event_type_filter.lower() not in data.get("eventType", "").lower():
                        continue
                if priority_filter and priority_filter != "all":
                    if data.get("priority") != priority_filter:
                        continue
                results.append(data)
            return {"total": len(results), "events": results}
        except Exception as exc:
            logger.error(f"Failed to fetch all activity logs: {exc}")
            return {"total": 0, "events": []}


# Global singleton
activity_service = ActivityService()
