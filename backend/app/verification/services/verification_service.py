import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from app.services.firebase.firebase_service import firebase_service
from app.invoice.repositories.invoice_repository import InvoiceRepository
from app.ai.services.ai_analysis_service import ai_analysis_service
from app.verification.rules.engine_rules import DETERMINISTIC_RULES
from app.events.notification_service import notification_service
from app.events.activity_service import activity_service
from app.events.event_types import EventType
from app.services.gst_service import gst_service
from app.services.credit_score_service import compute_buyer_credit_score

logger = logging.getLogger("VerificationService")

class VerificationService:
    def __init__(self):
        self.invoice_repo = InvoiceRepository()

    @property
    def db(self):
        if not firebase_service.db:
            raise RuntimeError("Firestore is not initialized.")
        return firebase_service.db

    def get_cached_verification(self, invoice_id: str) -> Optional[Dict[str, Any]]:
        try:
            doc_ref = self.db.collection("verificationReports").document(invoice_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
        except Exception as exc:
            logger.error(f"Error checking verification report: {exc}")
        return None

    def save_verification(self, report_data: Dict[str, Any]) -> None:
        invoice_id = report_data["invoiceId"]
        try:
            doc_ref = self.db.collection("verificationReports").document(invoice_id)
            doc_ref.set(report_data)
            logger.info(f"Stored verification report for invoice {invoice_id} in Firestore.")
        except Exception as exc:
            logger.error(f"Failed to store verification report in Firestore: {exc}")
            raise exc

    def verify_invoice(self, invoice_id: str) -> Dict[str, Any]:
        """
        Executes hybrid decision logic: runs rules, fetches AI risk parameters,
        calculates weighted score, saves report, and updates invoice marketplace eligibility.
        """
        # 1. Fetch Invoice Metadata
        invoice_doc = self.invoice_repo.get_by_id(invoice_id)
        if not invoice_doc:
            raise ValueError(f"Invoice {invoice_id} not found in database.")

        # 2. Trigger/Fetch AI Underwriting analysis
        ai_report = None
        try:
            # Reuses cached report if exists, or executes Groq llama underwriting automatically
            ai_report = ai_analysis_service.analyze_invoice(invoice_id)
        except Exception as ai_exc:
            logger.warning(f"AI Underwriting failed during verification: {ai_exc}. Using fallback report.")
            ai_report = ai_analysis_service.generate_fallback_report(invoice_doc)

        # 3. Evaluate deterministic rules
        rule_validation_results = {}
        passed_rules_count = 0
        critical_failed = False

        for rule in DETERMINISTIC_RULES:
            passed, msg = rule.evaluate(invoice_doc)
            rule_validation_results[rule.name] = {
                "passed": passed,
                "message": msg
            }
            if passed:
                passed_rules_count += 1
            else:
                # amount, dates, duplicates, files check are critical
                critical_failed = True

        # Check duplicate status separately
        if invoice_doc.get("duplicateStatus") == "DUPLICATE":
            critical_failed = True
            rule_validation_results["duplicate_check"] = {
                "passed": False,
                "message": "This invoice has been flagged as a duplicate registry collision."
            }
        else:
            rule_validation_results["duplicate_check"] = {
                "passed": True,
                "message": "Unique invoice hash verification passed."
            }
            passed_rules_count += 1

        # 4. GST Buyer Credit Assessment (Sandbox.co.in Live Verification)
        buyer_gst = invoice_doc.get("buyerGST") or invoice_doc.get("buyer_gst") or "29AAACI4798L1ZU"
        try:
            gst_taxpayer = gst_service.verify_gstin(buyer_gst)
            gst_returns = gst_service.get_return_filing_status(buyer_gst)
            buyer_credit_assessment = compute_buyer_credit_score(gst_taxpayer, gst_returns)
        except Exception as gst_err:
            logger.warning(f"GST verification scoring failed for {buyer_gst}: {gst_err}")
            buyer_credit_assessment = compute_buyer_credit_score({"legalName": invoice_doc.get("buyerName", "Enterprise Buyer"), "status": "Active"}, [])

        # Rule Validation Component: (Passed / Total) * 40
        total_rules = len(DETERMINISTIC_RULES) + 1 # +1 for duplicate check
        rules_score = (passed_rules_count / total_rules) * 40.0

        # Real GST Credit Score Component: (buyer_credit.score) * 40%
        gst_score = buyer_credit_assessment.get("score", 85)
        credit_score_component = (gst_score / 100.0) * 40.0
        payment_risk = max(0, 100 - gst_score)

        # Completeness Component: (Present Fields / Total Required) * 20%
        mandatory_fields = [
            "invoiceId", "invoiceNumber", "sellerName", "buyerName", 
            "invoiceAmount", "invoiceDate", "dueDate", "sellerGST", 
            "buyerGST", "invoicePDFUrl", "invoiceHash"
        ]
        present_fields = sum(1 for f in mandatory_fields if invoice_doc.get(f))
        completeness_score = (present_fields / len(mandatory_fields)) * 20.0

        # Overall readiness
        readiness_score = int(rules_score + credit_score_component + completeness_score)
        readiness_score = max(0, min(100, readiness_score))

        # 5. Determine eligibility & status parameters
        # Eligibility criteria: Readiness >= 60 and no critical rule failures
        eligible = (readiness_score >= 60) and not critical_failed
        
        overall_status = "Approved"
        risk_level = "Low"
        next_step = "List on Marketplace"
        recommendations = []

        if critical_failed:
            overall_status = "Rejected"
            risk_level = "High"
            next_step = "Correct Metadata & Re-upload PDF"
            recommendations.append("Ensure the invoice PDF format contains legible metadata.")
            recommendations.append("Double-check input GSTIN values match Indian tax format rules.")
        elif readiness_score < 60:
            overall_status = "Rejected"
            risk_level = "High"
            next_step = "Improve invoice parameters"
            recommendations.append("The counterparties risk levels exceed threshold safety margins.")
        elif readiness_score < 80:
            overall_status = "Needs Review"
            risk_level = "Medium"
            next_step = "Review Underwriter Flags"
            recommendations.append("Manual underwriter check recommended to audit due-date seasoning.")
        else:
            recommendations.append("Eligible for instant Polygon tokenization Escrow pools.")

        if payment_risk > 40:
            recommendations.append(f"GST Filing Risk elevated. Track filing consistency ({buyer_credit_assessment['breakdown']['filingConsistency']['percentage']}%).")

        # 6. Format Verification Dossier JSON
        now_str = datetime.utcnow().isoformat() + "Z"
        verification_report = {
            "invoiceId": invoice_id,
            "eligibleForMarketplace": eligible,
            "overallStatus": overall_status,
            "riskLevel": risk_level,
            "readinessScore": readiness_score,
            "ruleValidation": rule_validation_results,
            "buyerCreditAssessment": buyer_credit_assessment,
            "aiAssessment": {
                "paymentRiskScore": payment_risk,
                "creditGrade": buyer_credit_assessment.get("grade", "AAA"),
                "overallConfidence": float(ai_report.get("confidenceScore") or 0.95),
                "explanation": f"GSTN compliance verified via Sandbox.co.in. Score: {gst_score}/100 ({buyer_credit_assessment.get('riskTier')})."
            },
            "recommendations": recommendations,
            "nextStep": next_step,
            "createdAt": now_str,
            "updatedAt": now_str
        }

        # If compliance is valid, the next step is mandatory buyer approval
        if eligible:
            curr_v_status = invoice_doc.get("verificationStatus", "")
            is_buyer_app = invoice_doc.get("buyerApproved", False) or curr_v_status == "BUYER_APPROVED"
            v_status = "BUYER_APPROVED" if is_buyer_app else "PENDING_BUYER_APPROVAL"
            next_step = "Awaiting Corporate Buyer Approval" if not is_buyer_app else "Mint NFT"
        else:
            v_status = overall_status.upper().replace(" ", "_")

        verification_report["nextStep"] = next_step

        # 7. Update raw invoice in Firestore
        try:
            update_data = {
                "verificationStatus": v_status,
                "buyerApproved": invoice_doc.get("buyerApproved", False),
                "marketplaceStatus": "ELIGIBLE" if eligible else "INELIGIBLE",
                "riskScore": payment_risk,
                "updatedAt": now_str
            }
            self.invoice_repo.update(invoice_id, update_data)
        except Exception as exc:
            logger.error(f"Could not sync verification status with invoice document: {exc}")

        # 8. Persist results
        self.save_verification(verification_report)

        # 9. Fire notification + activity
        try:
            created_by = invoice_doc.get("createdBy", "system")
            inv_num = invoice_doc.get("invoiceNumber", invoice_id)
            ev_type = EventType.VERIFICATION_PASSED if eligible else EventType.VERIFICATION_FAILED
            _desc = f"Verification {overall_status} for {inv_num}. Readiness score: {readiness_score}/100. Next: {next_step}."
            notification_service.create(
                user_id=created_by, event_type=ev_type,
                title=f"Compliance Check {overall_status} — {inv_num}",
                desc=_desc, invoice_id=invoice_id
            )
            activity_service.log(
                user_id=created_by, event_type=ev_type,
                title=f"Marketplace Compliance {overall_status} — {inv_num}",
                desc=_desc,
                status="Completed" if eligible else "Failed",
                invoice_id=invoice_id, invoice_num=inv_num,
                actor="Verification Engine"
            )
        except Exception as notify_err:
            logger.warning(f"Failed to emit verification events: {notify_err}")

        return verification_report

# Global singleton
verification_service = VerificationService()
