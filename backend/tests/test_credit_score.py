import pytest
import datetime
from app.services.credit_score_service import compute_buyer_credit_score
from app.services.gst_service import gst_service

def test_full_active_profile():
    taxpayer = {
        "legalName": "INFOSYS LIMITED",
        "status": "Active",
        "regStartDate": "01/07/2017",
        "stateName": "Karnataka",
        "taxpayerType": "Regular",
        "pan": "AAACI1681G",
        "gstin": "29AAACI1681G1Z0"
    }
    # 24 on-time filings
    returns = [
        {"rtntype": "GSTR1", "ret_prd": f"{m:02d}2023", "dof": f"08-{m+1:02d}-2023" if m < 12 else "08-01-2024", "status": "Filed"}
        for m in range(1, 13)
    ] + [
        {"rtntype": "GSTR3B", "ret_prd": f"{m:02d}2023", "dof": f"18-{m+1:02d}-2023" if m < 12 else "18-01-2024", "status": "Filed"}
        for m in range(1, 13)
    ]

    res = compute_buyer_credit_score(taxpayer, returns, as_of_date=datetime.date(2024, 6, 1))
    
    assert res["score"] == 100
    assert res["grade"] == "AAA"
    assert res["breakdown"]["filingConsistency"]["score"] == 40.0
    assert res["breakdown"]["filingTimeliness"]["score"] == 25.0
    assert res["breakdown"]["gstinStatus"]["score"] == 25.0
    assert res["breakdown"]["businessVintage"]["score"] == 10.0

def test_suspended_late_profile():
    taxpayer = {
        "legalName": "DEFUNCT CORP",
        "status": "Suspended",
        "regStartDate": "01/01/2023",
        "stateName": "Delhi",
        "taxpayerType": "Regular",
        "pan": "AAACD1234F",
        "gstin": "07AAACD1234F1Z1"
    }
    # Only 6 late filings
    returns = [
        {"rtntype": "GSTR3B", "ret_prd": "012023", "dof": "28-02-2023", "status": "Filed"}, # late
        {"rtntype": "GSTR3B", "ret_prd": "022023", "dof": "29-03-2023", "status": "Filed"}, # late
    ]

    res = compute_buyer_credit_score(taxpayer, returns, as_of_date=datetime.date(2024, 6, 1))
    
    assert res["score"] < 50
    assert res["breakdown"]["gstinStatus"]["score"] == 5.0
    assert res["breakdown"]["filingTimeliness"]["score"] == 0.0

def test_live_service_integration():
    tp = gst_service.verify_gstin("29AAACI1681G1Z0")
    ret = gst_service.get_return_filing_status("29AAACI1681G1Z0")
    res = compute_buyer_credit_score(tp, ret)
    assert res["score"] >= 80
    assert tp["legalName"] != ""
