import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.services.firebase.firebase_service import firebase_service
from app.services.blockchain.polygon_service import polygon_service

logger = logging.getLogger("AnalyticsRoutes")

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/dashboard", summary="Real-time Admin Dashboard Analytics")
async def get_dashboard_analytics():
    """
    Aggregates real data from Firestore collections to power the Admin dashboard.
    Returns KPIs, user counts, invoice stats, funding volume, and system health.
    """
    try:
        db = firebase_service.db
        if not db:
            raise HTTPException(status_code=503, detail="Firestore not initialized")

        # ── 1. Invoice aggregations ──────────────────────────────────────────
        invoice_docs = list(db.collection("invoices").stream())
        invoices = [d.to_dict() for d in invoice_docs]

        total_invoices = len(invoices)
        total_amount = sum(float(i.get("invoiceAmount", 0) or 0) for i in invoices)
        funded_invoices = [i for i in invoices if i.get("invoiceStatus") in ("Funded", "FUNDED", "Listed", "LISTED", "ESCROWED", "TOKENIZED")]
        funded_amount = sum(float(i.get("invoiceAmount", 0) or 0) for i in funded_invoices)
        pending_invoices = [i for i in invoices if i.get("invoiceStatus") in ("PENDING", "Pending", None, "")]
        fraud_blocked = [i for i in invoices if i.get("fraudAttempt") or i.get("isDuplicate")]

        # ── 2. Marketplace aggregations ──────────────────────────────────────
        marketplace_docs = list(db.collection("marketplace").stream())
        listings = [d.to_dict() for d in marketplace_docs]
        total_liquidity = sum(float(l.get("amount", 0) or 0) for l in listings if l.get("status") == "Live Auction")
        total_bids = sum(len(l.get("bids", [])) for l in listings)

        # ── 3. User aggregations ─────────────────────────────────────────────
        user_docs = list(db.collection("users").stream())
        users = [d.to_dict() for d in user_docs]
        msme_count = len([u for u in users if u.get("role") == "msme"])
        investor_count = len([u for u in users if u.get("role") == "investor"])
        buyer_count = len([u for u in users if u.get("role") == "buyer"])
        total_users = len(users)

        # ── 4. Monthly invoice trend (last 6 months) ─────────────────────────
        from collections import defaultdict
        monthly = defaultdict(lambda: {"amount": 0, "invoices": 0})
        for inv in invoices:
            created_at = inv.get("createdAt", "")
            if created_at:
                try:
                    dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                    key = dt.strftime("%b")
                    monthly[key]["amount"] += float(inv.get("invoiceAmount", 0) or 0)
                    monthly[key]["invoices"] += 1
                except Exception:
                    pass

        month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        current_month_idx = datetime.utcnow().month - 1
        last_6 = [month_order[(current_month_idx - i) % 12] for i in range(5, -1, -1)]
        funding_trend = [
            {"name": m, "amount": monthly[m]["amount"], "invoices": monthly[m]["invoices"]}
            for m in last_6
        ]

        # ── 5. User growth trend ─────────────────────────────────────────────
        user_monthly = defaultdict(lambda: {"msme": 0, "investor": 0, "buyer": 0})
        for u in users:
            created_at = u.get("createdAt", "")
            if created_at:
                try:
                    dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                    key = dt.strftime("%b")
                    role = u.get("role", "")
                    if role in ("msme", "investor", "buyer"):
                        user_monthly[key][role] += 1
                except Exception:
                    pass

        user_growth = [{"name": m, **user_monthly[m]} for m in last_6]

        # ── 6. Recent users (for Users table) ────────────────────────────────
        recent_users = sorted(users, key=lambda u: str(u.get("createdAt", "")), reverse=True)[:20]
        users_table = []
        for u in recent_users:
            users_table.append({
                "uid": u.get("uid", u.get("id", "N/A")),
                "name": u.get("displayName") or u.get("name") or u.get("email", "Unknown"),
                "role": u.get("role", "unknown"),
                "verified": u.get("emailVerified", False) or u.get("verified", False),
                "wallet": u.get("walletAddress") or u.get("wallet", "Not Connected"),
                "status": u.get("status", "Active"),
                "kyc": u.get("kycStatus", "Pending"),
                "funding": f"Rs.{float(u.get('totalFunding', 0) or 0):,.0f}",
                "email": u.get("email", ""),
                "createdAt": u.get("createdAt", "")
            })

        # ── 7. System health ──────────────────────────────────────────────────
        blockchain_connected = polygon_service.is_connected()
        try:
            latest_block = polygon_service.get_latest_block() if blockchain_connected else None
        except Exception:
            latest_block = None

        # ── 8. Risk grade distribution ────────────────────────────────────────
        grade_counts = defaultdict(int)
        for inv in invoices:
            grade = inv.get("riskGrade") or inv.get("creditGrade") or "N/A"
            grade_counts[grade] += 1

        risk_grade_distribution = [
            {"name": grade, "value": count}
            for grade, count in sorted(grade_counts.items())
        ]

        return {
            "success": True,
            "kpis": {
                "totalInvoices": total_invoices,
                "totalAmountINR": total_amount,
                "fundedInvoices": len(funded_invoices),
                "fundedAmountINR": funded_amount,
                "pendingInvoices": len(pending_invoices),
                "fraudBlocked": len(fraud_blocked),
                "totalUsers": total_users,
                "msmeCount": msme_count,
                "investorCount": investor_count,
                "buyerCount": buyer_count,
                "marketplaceLiquidity": total_liquidity,
                "totalBids": total_bids,
                "activeListings": len(listings),
            },
            "charts": {
                "fundingTrend": funding_trend,
                "userGrowth": user_growth,
                "riskGradeDistribution": risk_grade_distribution,
            },
            "system": {
                "blockchainConnected": blockchain_connected,
                "latestBlock": latest_block,
                "firestoreConnected": True,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            },
            "usersTable": users_table,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Analytics aggregation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")
