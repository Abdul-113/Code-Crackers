from fastapi import APIRouter, HTTPException, status, Body
from typing import List, Dict, Any
from app.services.firebase.firebase_service import firebase_service
import logging

logger = logging.getLogger("Invoice2Credit-BusinessRoutes")

router = APIRouter(prefix="/business", tags=["Business API Operations"])

# Mock data backups in case Firestore Admin SDK credentials are missing
MOCK_INVOICES = [
  {"id": "INV-2026-084", "buyer": "Tata Motors Group", "amount": "₹12,40,000", "status": "Funded", "risk": "Low", "progress": 100},
  {"id": "INV-2026-085", "buyer": "Reliance Retail Ltd", "amount": "₹8,50,000", "status": "Auction Live", "risk": "Low", "progress": 75}
]

@router.get("/dashboard")
async def get_dashboard_summary():
    """
    Returns general dashboard KPIs and recent transactions.
    """
    db = firebase_service.db
    if not db:
        return {"kpis": {}, "recentInvoices": MOCK_INVOICES}
    try:
        # Fetch from Firestore
        metrics_ref = db.collection('analytics').document('dashboard_metrics').get()
        metrics = metrics_ref.to_dict() if metrics_ref.exists else {}
        
        invoices_ref = db.collection('invoices').limit(5).get()
        invoices = [doc.to_dict() for doc in invoices_ref]
        
        return {"kpis": metrics, "recentInvoices": invoices}
    except Exception as e:
        logger.error(f"Failed to fetch dashboard summary from Firestore: {e}")
        return {"error": str(e), "recentInvoices": MOCK_INVOICES}

@router.get("/invoices")
async def get_invoices(ownerId: str = None):
    db = firebase_service.db
    if not db:
        return MOCK_INVOICES
    try:
        if ownerId:
            docs = db.collection('invoices').where('ownerId', '==', ownerId).get()
        else:
            docs = db.collection('invoices').get()
        return [{**doc.to_dict(), "docId": doc.id} for doc in docs]
    except Exception as e:
        logger.error(f"Failed to query invoices from Firestore: {e}")
        return MOCK_INVOICES

@router.post("/invoices")
async def add_invoice(invoice: Dict[str, Any] = Body(...)):
    db = firebase_service.db
    if not db:
        return {"status": "mock_success", "invoice": invoice}
    try:
        doc_ref = db.collection('invoices').document()
        doc_ref.set(invoice)
        return {"status": "success", "docId": doc_ref.id, "invoice": invoice}
    except Exception as e:
        logger.error(f"Failed to write invoice to Firestore: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/invoices/{id}")
async def update_invoice(id: str, fields: Dict[str, Any] = Body(...)):
    db = firebase_service.db
    if not db:
        return {"status": "mock_success_update", "id": id}
    try:
        db.collection('invoices').document(id).update(fields)
        return {"status": "success", "id": id}
    except Exception as e:
        logger.error(f"Failed to update invoice in Firestore: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/invoices/{id}")
async def delete_invoice(id: str):
    db = firebase_service.db
    if not db:
        return {"status": "mock_success_delete", "id": id}
    try:
        db.collection('invoices').document(id).delete()
        return {"status": "success", "id": id}
    except Exception as e:
        logger.error(f"Failed to delete invoice from Firestore: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/marketplace")
async def get_marketplace_listings():
    db = firebase_service.db
    if not db:
        return []
    try:
        docs = db.collection('marketplace').get()
        return [{**doc.to_dict(), "docId": doc.id} for doc in docs]
    except Exception as e:
        logger.error(f"Failed to query marketplace listings: {e}")
        return []

@router.post("/marketplace")
async def create_marketplace_listing(listing: Dict[str, Any] = Body(...)):
    db = firebase_service.db
    if not db:
        return {"status": "mock_success", "listing": listing}
    try:
        doc_ref = db.collection('marketplace').document()
        doc_ref.set(listing)
        return {"status": "success", "docId": doc_ref.id, "listing": listing}
    except Exception as e:
        logger.error(f"Failed to create marketplace listing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_analytics_metrics():
    db = firebase_service.db
    if not db:
        return {}
    try:
        doc_ref = db.collection('analytics').document('dashboard_metrics').get()
        return doc_ref.to_dict() if doc_ref.exists else {}
    except Exception as e:
        logger.error(f"Failed to fetch analytics metrics: {e}")
        return {}

@router.get("/notifications")
async def get_notifications(userId: str = None):
    db = firebase_service.db
    if not db:
        return []
    try:
        if userId:
            docs = db.collection('notifications').where('userId', '==', userId).get()
        else:
            docs = db.collection('notifications').get()
        return [{**doc.to_dict(), "docId": doc.id} for doc in docs]
    except Exception as e:
        logger.error(f"Failed to query notifications: {e}")
        return []
