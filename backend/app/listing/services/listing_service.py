import logging
from datetime import datetime
from typing import Dict, Any, Optional

from app.services.firebase.firebase_service import firebase_service
from app.invoice.repositories.invoice_repository import InvoiceRepository
from app.events.notification_service import notification_service
from app.events.activity_service import activity_service
from app.events.event_types import EventType

logger = logging.getLogger("ListingService")

class ListingService:
    def __init__(self):
        self.invoice_repo = InvoiceRepository()

    @property
    def db(self):
        if not firebase_service.db:
            raise RuntimeError("Firestore is not initialized.")
        return firebase_service.db

    def list_invoice_on_marketplace(self, invoice_id: str) -> Dict[str, Any]:
        """
        Validates verification + underwriting compliance, creates a marketplace listing
        document, updates invoice status to LISTED, and stores owner notification alerts.
        """
        # 1. Fetch Invoice
        invoice_doc = self.invoice_repo.get_by_id(invoice_id)
        if not invoice_doc:
            raise ValueError(f"Invoice {invoice_id} not found in database.")

        # 2. Check if invoice is already listed
        if invoice_doc.get("invoiceStatus") == "Listed":
            raise ValueError(f"Invoice {invoice_id} has already been listed on the marketplace.")

        # 3. Verify verification report exists and is Approved/Eligible
        verification_ref = self.db.collection("verificationReports").document(invoice_id).get()
        if not verification_ref.exists:
            raise ValueError(f"Verification report for invoice {invoice_id} is missing. Run compliance validation first.")
        
        ver_data = verification_ref.to_dict()
        if not ver_data.get("eligibleForMarketplace") or ver_data.get("overallStatus") == "Rejected":
            raise ValueError(f"Invoice {invoice_id} is ineligible for listing. Status is {ver_data.get('overallStatus')}.")

        # 4. Verify AI credit report exists
        ai_ref = self.db.collection("invoiceReports").document(invoice_id).get()
        if not ai_ref.exists:
            raise ValueError(f"AI Underwriting credit report for invoice {invoice_id} is missing.")
        
        ai_data = ai_ref.to_dict()

        # 4.5 Require Corporate Buyer Approval
        is_buyer_approved = invoice_doc.get("buyerApproved") is True or invoice_doc.get("verificationStatus") == "BUYER_APPROVED"
        if not is_buyer_approved:
            raise ValueError(f"Invoice {invoice_id} must be approved by the designated Corporate Buyer before it can be listed on the marketplace.")

        # 4.6 Require Minted/Tokenized Status
        valid_admin_statuses = ["TOKENIZED", "ESCROWED", "APPROVED", "DEMO_APPROVED", "MINTED"]
        if invoice_doc.get("blockchainStatus") not in valid_admin_statuses and invoice_doc.get("invoiceStatus") not in valid_admin_statuses:
            raise ValueError(f"Invoice {invoice_id} must be minted/tokenized before it can be listed on the marketplace.")

        # 5. Build marketplace listing format matching UI schema
        listing_id = f"LST-{Date_Now_Int()}"
        now_str = datetime.utcnow().isoformat() + "Z"
        
        # Determine industry (fallback to 'Manufacturing' or general)
        industry = invoice_doc.get("industry") or "Manufacturing"
        
        listing_data = {
            "id": invoice_doc.get("invoiceNumber", invoice_id),
            "invoiceId": invoice_id,
            "listingId": listing_id,
            "buyer": invoice_doc.get("buyerName", "Unknown Buyer"),
            "owner": invoice_doc.get("sellerName", "Unknown Seller"),
            "industry": industry,
            "amount": invoice_doc.get("invoiceAmount", 0.0),
            "required": invoice_doc.get("invoiceAmount", 0.0),
            "progress": 0,
            "grade": ai_data.get("creditGrade", "B"),
            "yieldRate": ai_data.get("expectedInvestorYield", 12.0),
            "dueDate": invoice_doc.get("dueDate", ""),
            "confidence": float(ai_data.get("confidenceScore", 0.85) * 100),
            "status": "Live Auction",
            "tokenUrl": invoice_doc.get("invoiceHash", "0x..."),
            "minBid": float(invoice_doc.get("invoiceAmount", 0.0) * 0.75),
            "highestBid": 0.0,
            "timeRemaining": "3d 12h",
            "bids": [],
            "createdAt": now_str,
            "updatedAt": now_str,
            "investorVisibility": True
        }

        # 6. Save Listing to marketplace collection
        # We use invoiceId as document ID in marketplace to guarantee 1-to-1 mapping
        self.db.collection("marketplace").document(invoice_id).set(listing_data)
        logger.info(f"Created marketplace listing {listing_id} for invoice {invoice_id}")

        # 7. Update raw invoice status
        try:
            self.invoice_repo.update(invoice_id, {
                "invoiceStatus": "Listed",
                "updatedAt": now_str
            })
        except Exception as exc:
            logger.error(f"Could not update status of invoice {invoice_id} to Listed: {exc}")

        # 8. Notify Owner (create notification document)
        try:
            owner_uid = invoice_doc.get("createdBy")
            if owner_uid:
                _desc = f"{invoice_doc.get('invoiceNumber')} is now live on the Marketplace. Grade: {ai_data.get('creditGrade', 'B')}, Yield: {ai_data.get('expectedInvestorYield', 12)}% APR."
                notification_service.create(
                    user_id=owner_uid,
                    event_type=EventType.LISTED_ON_MARKETPLACE,
                    title=f"Invoice Listed — {invoice_doc.get('invoiceNumber')}",
                    desc=_desc, invoice_id=invoice_id
                )
                activity_service.log(
                    user_id=owner_uid,
                    event_type=EventType.LISTED_ON_MARKETPLACE,
                    title=f"Invoice Listed on Marketplace — {invoice_doc.get('invoiceNumber')}",
                    desc=_desc, status="Active",
                    invoice_id=invoice_id,
                    invoice_num=invoice_doc.get("invoiceNumber", ""),
                    actor="Marketplace Engine"
                )
        except Exception as exc:
            logger.error(f"Failed to create owner notification: {exc}")

        return listing_data

    def get_all_listings(self) -> list:
        """Return all documents from the Firestore marketplace collection."""
        try:
            docs = self.db.collection("marketplace").stream()
            result = []
            for doc in docs:
                data = doc.to_dict()
                data["docId"] = doc.id
                result.append(data)
            return result
        except Exception as exc:
            logger.error(f"Failed to fetch marketplace listings: {exc}")
            return []

    def _find_marketplace_doc(self, identifier: str):
        """
        Finds a marketplace document reference, data, and doc ID by:
        1. Direct document key match
        2. 'id' field match (e.g. ZEN-2026-IT-042)
        3. 'invoiceId' field match
        4. 'docId' field match
        """
        if not identifier:
            return None, None, None
        
        # 1. Direct doc key
        try:
            doc_ref = self.db.collection("marketplace").document(identifier)
            snap = doc_ref.get()
            if snap.exists:
                data = snap.to_dict()
                data["docId"] = snap.id
                return doc_ref, data, snap.id
        except Exception as e:
            logger.warning(f"Direct marketplace doc lookup error for {identifier}: {e}")

        # 2. Query by fields
        for field in ["id", "invoiceId", "invoiceNumber", "docId"]:
            try:
                query = self.db.collection("marketplace").where(field, "==", identifier).limit(1).stream()
                for doc in query:
                    data = doc.to_dict()
                    data["docId"] = doc.id
                    return doc.reference, data, doc.id
            except Exception as e:
                logger.warning(f"Query marketplace by {field}=={identifier} failed: {e}")

        return None, None, None

    def _find_invoice_doc(self, identifier: str):
        """
        Finds an invoice document reference, data, and doc ID by direct key or invoiceNumber/invoiceId.
        """
        if not identifier:
            return None, None, None
        
        try:
            doc_ref = self.db.collection("invoices").document(identifier)
            snap = doc_ref.get()
            if snap.exists:
                data = snap.to_dict()
                data["docId"] = snap.id
                return doc_ref, data, snap.id
        except Exception as e:
            logger.warning(f"Direct invoice doc lookup error for {identifier}: {e}")

        for field in ["invoiceNumber", "invoiceId", "id", "docId"]:
            try:
                query = self.db.collection("invoices").where(field, "==", identifier).limit(1).stream()
                for doc in query:
                    data = doc.to_dict()
                    data["docId"] = doc.id
                    return doc.reference, data, doc.id
            except Exception as e:
                logger.warning(f"Query invoices by {field}=={identifier} failed: {e}")

        return None, None, None

    def get_listing_by_id(self, invoice_id: str) -> Optional[Dict[str, Any]]:
        """Return a single listing document by invoice ID or document key."""
        _, data, _ = self._find_marketplace_doc(invoice_id)
        return data

    def place_bid(self, invoice_id: str, bid_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Appends a bid to an existing listing's bids array and updates progress.
        """
        doc_ref, listing, doc_id = self._find_marketplace_doc(invoice_id)
        if not doc_ref or not listing:
            raise ValueError(f"Listing for invoice {invoice_id} not found in marketplace.")

        bid_amount = float(bid_data.get("bid", 0))
        total_amount = float(listing.get("amount", 1))
        current_highest = float(listing.get("highestBid", 0))

        # Append the new bid
        existing_bids = listing.get("bids", [])
        existing_bids.insert(0, bid_data)

        # Recalculate progress & highest bid
        new_progress = min(100, int((bid_amount / total_amount) * 100))
        new_highest = max(current_highest, bid_amount)
        new_status = "Live Auction"
        now_str = datetime.utcnow().isoformat() + "Z"

        update_payload = {
            "bids": existing_bids,
            "highestBid": new_highest,
            "progress": new_progress,
            "status": new_status,
            "updatedAt": now_str
        }

        doc_ref.update(update_payload)
        listing.update(update_payload)

        # Sync to invoices collection
        target_inv_id = listing.get("invoiceId") or doc_id or invoice_id
        inv_ref, _, _ = self._find_invoice_doc(target_inv_id)
        if inv_ref:
            try:
                inv_ref.update({
                    "bids": existing_bids,
                    "highestBid": new_highest,
                    "updatedAt": now_str
                })
            except Exception as inv_err:
                logger.warning(f"Could not sync bids to invoices doc: {inv_err}")

        # Fire bid event
        try:
            investor_name = bid_data.get("investor", "Unknown Investor")
            owner_uid = listing.get("ownerId") or listing.get("createdBy", "system")
            inv_num = listing.get("id", invoice_id)
            _desc = f"{investor_name} placed a bid of ₹{bid_amount:,.0f} ({bid_data.get('yield', 0)}% APY) on {inv_num}."
            notification_service.create(
                user_id=owner_uid, event_type=EventType.INVESTOR_BID_RECEIVED,
                title=f"New Bid Received — {inv_num}",
                desc=_desc, invoice_id=invoice_id
            )
            activity_service.log(
                user_id=owner_uid, event_type=EventType.INVESTOR_BID_RECEIVED,
                title=f"Investor Bid Received — {inv_num}",
                desc=_desc, status="Active",
                invoice_id=invoice_id, invoice_num=inv_num,
                actor=investor_name
            )
        except Exception as exc:
            logger.warning(f"Failed to emit bid events: {exc}")

        return listing

    def accept_bid(self, invoice_id: str, bid_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Accepts a specific bid, marking the listing and invoice as Funded in Firestore.
        """
        doc_ref, listing, doc_id = self._find_marketplace_doc(invoice_id)
        if not doc_ref or not listing:
            raise ValueError(f"Listing for invoice {invoice_id} not found in marketplace.")

        now_str = datetime.utcnow().isoformat() + "Z"
        
        # 1. Update marketplace listing
        update_payload = {
            "status": "Funded",
            "acceptedBid": bid_data,
            "updatedAt": now_str,
            "progress": 100
        }
        doc_ref.update(update_payload)
        listing.update(update_payload)

        # 2. Update the core invoice status
        target_inv_id = listing.get("invoiceId") or doc_id or invoice_id
        inv_ref, _, _ = self._find_invoice_doc(target_inv_id)
        if inv_ref:
            try:
                inv_ref.update({
                    "invoiceStatus": "Funded",
                    "status": "Funded",
                    "blockchainStatus": "ESCROWED",
                    "acceptedBid": bid_data,
                    "updatedAt": now_str
                })
            except Exception as e:
                logger.warning(f"Could not update invoice status during accept_bid: {e}")

        # 3. Fire events
        try:
            investor_name = bid_data.get("investor", "Unknown Investor")
            owner_uid = listing.get("ownerId") or listing.get("createdBy", "system")
            inv_num = listing.get("id", invoice_id)
            _desc = f"MSME accepted the bid from {investor_name} for ₹{bid_data.get('bid', 0):,.0f}."
            
            notification_service.create(
                user_id=owner_uid, event_type=EventType.FUNDING_RELEASED,
                title=f"Bid Accepted — {inv_num}",
                desc=_desc, invoice_id=invoice_id
            )
            activity_service.log(
                user_id=owner_uid, event_type=EventType.FUNDING_RELEASED,
                title=f"Bid Accepted — {inv_num}",
                desc=_desc, status="Funded",
                invoice_id=invoice_id, invoice_num=inv_num,
                actor="MSME"
            )
        except Exception as exc:
            logger.warning(f"Failed to emit bid acceptance events: {exc}")

        return listing

    def list_invoice_on_secondary_market(self, listing_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a secondary market auction listing document for a tokenized invoice NFT,
        allowing other investors to place secondary bids or execute instant buyout.
        """
        invoice_id = listing_payload.get("invoiceId") or listing_payload.get("id")
        if not invoice_id:
            raise ValueError("invoiceId is required for secondary market listing.")

        now_str = datetime.utcnow().isoformat() + "Z"
        secondary_listing_id = f"SEC-{invoice_id}-{Date_Now_Int()}"

        secondary_data = {
            "id": invoice_id,
            "invoiceId": invoice_id,
            "secondaryListingId": secondary_listing_id,
            "buyer": listing_payload.get("buyer", "Unknown Buyer"),
            "sellerInvestor": listing_payload.get("sellerInvestor", "Institutional Investor"),
            "sellerAddress": listing_payload.get("sellerAddress", "0x3A9b1c7E8F...0B9C"),
            "faceValue": float(listing_payload.get("faceValue", listing_payload.get("amount", 0))),
            "amount": float(listing_payload.get("amount", listing_payload.get("faceValue", 0))),
            "askingPrice": float(listing_payload.get("askingPrice", 0)),
            "originalYield": float(listing_payload.get("originalYield", listing_payload.get("yield", 9.0))),
            "effectiveYield": float(listing_payload.get("effectiveYield", 10.5)),
            "dueDate": listing_payload.get("dueDate", listing_payload.get("due", "")),
            "daysLeft": int(listing_payload.get("daysLeft", 30)),
            "grade": listing_payload.get("grade", "AAA / A+"),
            "riskProfile": listing_payload.get("riskProfile", {}),
            "tokenUrl": listing_payload.get("tokenUrl", "0x..."),
            "status": "Live Secondary Auction",
            "bids": listing_payload.get("bids", []),
            "createdAt": now_str,
            "updatedAt": now_str
        }

        # Save to secondaryMarketplace collection in Firestore
        self.db.collection("secondaryMarketplace").document(invoice_id).set(secondary_data)
        logger.info(f"Created secondary market listing {secondary_listing_id} for invoice {invoice_id}")

        # Update core invoice if present
        try:
            invoice_ref = self.db.collection("invoices").document(invoice_id)
            if invoice_ref.get().exists:
                invoice_ref.update({
                    "isSecondaryListed": True,
                    "secondaryAskingPrice": secondary_data["askingPrice"],
                    "updatedAt": now_str
                })
        except Exception as e:
            logger.warning(f"Could not update invoice isSecondaryListed: {e}")

        return secondary_data

    def get_all_secondary_listings(self) -> list:
        """Return all active documents from the Firestore secondaryMarketplace collection."""
        try:
            docs = self.db.collection("secondaryMarketplace").stream()
            result = []
            for doc in docs:
                data = doc.to_dict()
                data["docId"] = doc.id
                result.append(data)
            return result
        except Exception as exc:
            logger.error(f"Failed to fetch secondary marketplace listings: {exc}")
            return []

    def place_secondary_bid(self, invoice_id: str, bid_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Appends a secondary investor bid to an active secondary listing in Firestore.
        """
        doc_ref = self.db.collection("secondaryMarketplace").document(invoice_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise ValueError(f"Secondary listing for invoice {invoice_id} not found.")

        listing = doc.to_dict()
        existing_bids = listing.get("bids", [])
        
        now_str = datetime.utcnow().isoformat() + "Z"
        bid_entry = {
            "investor": bid_data.get("investor", "Investor Desk"),
            "investorAddress": bid_data.get("investorAddress", "0x..."),
            "bid": float(bid_data.get("bid", 0)),
            "yield": float(bid_data.get("yield", 10.0)),
            "date": "Just now",
            "timestamp": now_str
        }
        existing_bids.insert(0, bid_entry)

        update_payload = {
            "bids": existing_bids,
            "highestBid": max(float(listing.get("highestBid", 0)), bid_entry["bid"]),
            "updatedAt": now_str
        }
        doc_ref.update(update_payload)
        listing.update(update_payload)
        logger.info(f"Recorded secondary bid of ₹{bid_entry['bid']} on {invoice_id}")
        return listing

    def accept_secondary_bid(self, invoice_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Finalizes a secondary NFT sale, transferring ownership and marking the secondary listing as Sold.
        """
        doc_ref = self.db.collection("secondaryMarketplace").document(invoice_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise ValueError(f"Secondary listing for invoice {invoice_id} not found.")

        listing = doc.to_dict()
        now_str = datetime.utcnow().isoformat() + "Z"
        
        accepted_bid = payload.get("bidData") or {
            "investor": payload.get("buyerInvestor", "Secondary Liquidity Pool"),
            "bid": float(payload.get("amount", listing.get("askingPrice", 0))),
            "date": "Just now"
        }

        update_payload = {
            "status": "Sold / Settled",
            "acceptedBid": accepted_bid,
            "settledAt": now_str,
            "newOwner": accepted_bid.get("investor"),
            "updatedAt": now_str
        }
        doc_ref.update(update_payload)
        listing.update(update_payload)

        # Update core invoice
        try:
            inv_ref = self.db.collection("invoices").document(invoice_id)
            if inv_ref.get().exists:
                inv_ref.update({
                    "isSecondaryListed": False,
                    "currentOwner": accepted_bid.get("investor"),
                    "secondarySettled": True,
                    "updatedAt": now_str
                })
        except Exception as e:
            logger.warning(f"Could not update invoice after secondary settlement: {e}")

        return listing



def Date_Now_Int() -> int:
    return int(datetime.utcnow().timestamp())

# Global singleton
listing_service = ListingService()
