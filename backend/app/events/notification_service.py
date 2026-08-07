"""
notification_service.py
───────────────────────
Centralized notification writer and reader.

Firestore collection: notifications
Document shape:
  id          (str)  — auto-generated
  userId      (str)  — recipient's uid
  title       (str)
  desc        (str)
  category    (str)  — invoices | marketplace | ai | funding | security | system
  eventType   (str)  — EventType enum value
  invoiceId   (str)  — optional invoice reference
  read        (bool)
  createdAt   (str)  — ISO timestamp
"""
import logging
from datetime import datetime
from typing import Optional

from app.services.firebase.firebase_service import firebase_service
from app.events.event_types import EventType, EVENT_CATEGORY_MAP

logger = logging.getLogger("NotificationService")


class NotificationService:

    @property
    def db(self):
        if not firebase_service.db:
            raise RuntimeError("Firestore is not initialized.")
        return firebase_service.db

    def create(
        self,
        user_id: str,
        event_type: EventType,
        title: str,
        desc: str,
        invoice_id: Optional[str] = None,
    ) -> dict:
        """Persist a notification document and return it."""
        now = datetime.utcnow().isoformat() + "Z"
        payload = {
            "userId":    user_id,
            "title":     title,
            "desc":      desc,
            "category":  EVENT_CATEGORY_MAP.get(event_type, "system"),
            "eventType": event_type.value,
            "invoiceId": invoice_id or "",
            "read":      False,
            "createdAt": now,
        }
        try:
            ref = self.db.collection("notifications").add(payload)
            payload["id"] = ref[1].id
        except Exception as exc:
            logger.error(f"Failed to write notification: {exc}")
            payload["id"] = "local"
        return payload

    def get_for_user(
        self,
        user_id: str,
        limit: int = 50,
        unread_only: bool = False,
        category: Optional[str] = None,
    ) -> list:
        """Return notifications for a user, newest first."""
        try:
            try:
                q = (
                    self.db.collection("notifications")
                    .where("userId", "==", user_id)
                    .order_by("createdAt", direction="DESCENDING")
                    .limit(limit)
                )
                docs = q.stream()
            except Exception as index_err:
                logger.warning(f"Composite index missing for notifications, querying and sorting in memory: {index_err}")
                # Fallback: query without order_by
                q = (
                    self.db.collection("notifications")
                    .where("userId", "==", user_id)
                    .limit(limit)
                )
                docs = q.stream()
                # Sort in-memory desc by createdAt
                docs = sorted(docs, key=lambda d: d.to_dict().get("createdAt", ""), reverse=True)

            results = []
            for d in docs:
                data = d.to_dict()
                data["id"] = d.id
                if unread_only and data.get("read"):
                    continue
                if category and category != "all" and data.get("category") != category:
                    continue
                results.append(data)
            return results
        except Exception as exc:
            logger.error(f"Failed to fetch notifications: {exc}")
            return []

    def mark_read(self, notification_id: str) -> bool:
        try:
            self.db.collection("notifications").document(notification_id).update({"read": True})
            return True
        except Exception as exc:
            logger.error(f"Failed to mark notification read: {exc}")
            return False

    def mark_all_read(self, user_id: str) -> int:
        """Marks every unread notification for a user as read. Returns count updated."""
        try:
            q = (
                self.db.collection("notifications")
                .where("userId", "==", user_id)
                .where("read", "==", False)
                .stream()
            )
            batch = self.db.batch()
            count = 0
            for d in q:
                batch.update(d.reference, {"read": True})
                count += 1
            if count:
                batch.commit()
            return count
        except Exception as exc:
            logger.error(f"Failed to mark all read: {exc}")
            return 0

    def delete(self, notification_id: str) -> bool:
        try:
            self.db.collection("notifications").document(notification_id).delete()
            return True
        except Exception as exc:
            logger.error(f"Failed to delete notification: {exc}")
            return False


# Global singleton
notification_service = NotificationService()
