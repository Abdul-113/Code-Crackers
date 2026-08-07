import pytest
from app.verification.services.gst_verification import gst_verification_service

def test_valid_irn_and_gstin():
    valid_irn = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
    valid_buyer = "29ABCDE1234F1Z5"
    valid_seller = "27XYZAB5678C1Z9"
    amount = 1000.50
    date = "2023-10-01"

    result = gst_verification_service.verify_irn(valid_irn, valid_buyer, valid_seller, amount, date)
    assert result["verified"] is True
    assert "PASSED" in result["reason"]
    assert result["mockGovernmentTimestamp"] is not None

def test_invalid_irn_format():
    invalid_irn = "too_short"
    valid_buyer = "29ABCDE1234F1Z5"
    valid_seller = "27XYZAB5678C1Z9"
    
    result = gst_verification_service.verify_irn(invalid_irn, valid_buyer, valid_seller, 100, "2023-10-01")
    assert result["verified"] is False
    assert "Invalid IRN format" in result["reason"]

def test_invalid_gstin_format():
    valid_irn = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
    invalid_buyer = "INVALID_GST"
    valid_seller = "27XYZAB5678C1Z9"
    
    result = gst_verification_service.verify_irn(valid_irn, invalid_buyer, valid_seller, 100, "2023-10-01")
    assert result["verified"] is False
    assert "Invalid Buyer GSTIN format" in result["reason"]

def test_invalid_amount():
    valid_irn = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
    valid_buyer = "29ABCDE1234F1Z5"
    valid_seller = "27XYZAB5678C1Z9"
    
    result = gst_verification_service.verify_irn(valid_irn, valid_buyer, valid_seller, -50, "2023-10-01")
    assert result["verified"] is False
    assert "positive" in result["reason"]
