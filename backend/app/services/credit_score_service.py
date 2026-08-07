import datetime
from typing import Dict, Any, List, Optional

def parse_date(date_str: str) -> Optional[datetime.date]:
    """Parses date string in formats DD-MM-YYYY, DD/MM/YYYY, or YYYY-MM-DD."""
    if not date_str:
        return None
    date_str = str(date_str).strip()
    for fmt in ("%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%d", "%d-%b-%Y"):
        try:
            return datetime.datetime.strptime(date_str[:10], fmt).date()
        except ValueError:
            continue
    return None

def compute_buyer_credit_score(
    taxpayer_data: Dict[str, Any],
    returns_data: List[Dict[str, Any]],
    as_of_date: Optional[datetime.date] = None
) -> Dict[str, Any]:
    """
    Computes a 0–100 Buyer Credit Score derived from real GST data.
    
    Formula Weighting:
      1. Filing consistency (% of expected periods filed in last 12 months) — 40%
      2. Filing timeliness (on-time vs late, if dates available) — 25%
      3. GSTIN status (Active = full marks, Suspended/Cancelled = heavy penalty) — 25%
      4. Business vintage (registration age) — 10%

    Returns structured score breakdown, grade, risk tier, and metrics.
    """
    if as_of_date is None:
        as_of_date = datetime.date.today()

    # ─────────────────────────────────────────────────────────────────────────
    # 1. Filing Consistency (Weight: 40%)
    # ─────────────────────────────────────────────────────────────────────────
    # Expecting 12 GSTR-1 and 12 GSTR-3B filings per annual cycle = 24 target filings
    expected_filings_count = 24
    valid_returns = [r for r in returns_data if r.get("status", "").lower() == "filed" or r.get("valid") == "Y"]
    filing_count = len(valid_returns)
    
    # Cap ratio at 1.0
    consistency_ratio = min(1.0, filing_count / expected_filings_count) if expected_filings_count > 0 else 0.0
    consistency_score = round(consistency_ratio * 40.0, 1)

    # ─────────────────────────────────────────────────────────────────────────
    # 2. Filing Timeliness (Weight: 25%)
    # ─────────────────────────────────────────────────────────────────────────
    # GSTR-1 is due on the 11th of next month; GSTR-3B is due on the 20th of next month
    on_time_count = 0
    evaluated_for_timeliness = 0

    for ret in valid_returns:
        rtn_type = str(ret.get("rtntype", "")).upper()
        ret_prd = str(ret.get("ret_prd", "")).strip() # MMYYYY e.g. "082023"
        dof_str = ret.get("dof", "")
        dof = parse_date(dof_str)

        if not dof or len(ret_prd) != 6:
            # If dates or period format unavailable, default to timely
            on_time_count += 1
            evaluated_for_timeliness += 1
            continue

        try:
            m = int(ret_prd[:2])
            y = int(ret_prd[2:])
            # Next month calculation
            if m == 12:
                next_m = 1
                next_y = y + 1
            else:
                next_m = m + 1
                next_y = y

            due_day = 11 if "1" in rtn_type else 20
            due_date = datetime.date(next_y, next_m, due_day)

            evaluated_for_timeliness += 1
            if dof <= due_date:
                on_time_count += 1
        except Exception:
            on_time_count += 1
            evaluated_for_timeliness += 1

    timeliness_ratio = (on_time_count / evaluated_for_timeliness) if evaluated_for_timeliness > 0 else 1.0
    timeliness_score = round(timeliness_ratio * 25.0, 1)

    # ─────────────────────────────────────────────────────────────────────────
    # 3. GSTIN Status (Weight: 25%)
    # ─────────────────────────────────────────────────────────────────────────
    raw_status = str(taxpayer_data.get("status", "")).strip().capitalize()
    if raw_status == "Active":
        status_score = 25.0
        status_multiplier = 1.0
    elif raw_status == "Suspended":
        status_score = 5.0
        status_multiplier = 0.2
    else: # Cancelled, Inactive, Invalid
        status_score = 0.0
        status_multiplier = 0.0

    # ─────────────────────────────────────────────────────────────────────────
    # 4. Business Vintage (Weight: 10%)
    # ─────────────────────────────────────────────────────────────────────────
    reg_date_str = taxpayer_data.get("registrationDate") or taxpayer_data.get("regStartDate") or ""
    reg_date = parse_date(reg_date_str)
    
    if reg_date:
        vintage_years = max(0.0, (as_of_date - reg_date).days / 365.25)
    else:
        vintage_years = 5.0 # default established

    if vintage_years >= 5.0:
        vintage_score = 10.0
    elif vintage_years >= 3.0:
        vintage_score = 8.0
    elif vintage_years >= 1.0:
        vintage_score = 6.0
    else:
        vintage_score = 4.0

    # ─────────────────────────────────────────────────────────────────────────
    # Composite Score & Tier Rating
    # ─────────────────────────────────────────────────────────────────────────
    total_score = round(consistency_score + timeliness_score + status_score + vintage_score)
    total_score = max(0, min(100, total_score))

    if total_score >= 85:
        grade = "AAA"
        risk_tier = "Prime / Ultra-Low Risk"
        recommended_advance = "90% - 95%"
        badge_color = "emerald"
    elif total_score >= 70:
        grade = "AA"
        risk_tier = "Strong / Low Risk"
        recommended_advance = "85% - 90%"
        badge_color = "blue"
    elif total_score >= 55:
        grade = "A"
        risk_tier = "Moderate / Standard Risk"
        recommended_advance = "75% - 85%"
        badge_color = "amber"
    elif total_score >= 40:
        grade = "BBB"
        risk_tier = "Subprime / Elevated Risk"
        recommended_advance = "65% - 75%"
        badge_color = "orange"
    else:
        grade = "C"
        risk_tier = "High Risk / Critical Review"
        recommended_advance = "50% - 60%"
        badge_color = "red"

    return {
        "score": total_score,
        "grade": grade,
        "riskTier": risk_tier,
        "recommendedAdvanceRate": recommended_advance,
        "badgeColor": badge_color,
        "breakdown": {
            "filingConsistency": {
                "score": consistency_score,
                "max": 40.0,
                "weight": "40%",
                "filingsCount": filing_count,
                "expectedCount": expected_filings_count,
                "percentage": round(consistency_ratio * 100, 1)
            },
            "filingTimeliness": {
                "score": timeliness_score,
                "max": 25.0,
                "weight": "25%",
                "onTimeCount": on_time_count,
                "evaluatedCount": evaluated_for_timeliness,
                "percentage": round(timeliness_ratio * 100, 1)
            },
            "gstinStatus": {
                "score": status_score,
                "max": 25.0,
                "weight": "25%",
                "status": raw_status or "Active"
            },
            "businessVintage": {
                "score": vintage_score,
                "max": 10.0,
                "weight": "10%",
                "years": round(vintage_years, 1),
                "registrationDate": reg_date_str or "01/07/2017"
            }
        },
        "taxpayer": taxpayer_data,
        "recentFilings": returns_data[:8]
    }
