"""
Centralized event type registry.
Every backend event must declare its type here.
"""
from enum import Enum

class EventType(str, Enum):
    INVOICE_UPLOADED       = "Invoice Uploaded"
    AI_ANALYSIS_COMPLETE   = "AI Analysis Completed"
    VERIFICATION_PASSED    = "Verification Passed"
    VERIFICATION_FAILED    = "Verification Failed"
    LISTED_ON_MARKETPLACE  = "Listed on Marketplace"
    INVESTOR_BID_RECEIVED  = "Investor Bid Received"
    AUCTION_CLOSED         = "Auction Closed"
    FUNDING_APPROVED       = "Funding Approved"
    FUNDS_RELEASED         = "Funds Released"
    SETTLEMENT_COMPLETE    = "Settlement Complete"

# Category used by the NotificationDrawer
EVENT_CATEGORY_MAP = {
    EventType.INVOICE_UPLOADED:      "invoices",
    EventType.AI_ANALYSIS_COMPLETE:  "ai",
    EventType.VERIFICATION_PASSED:   "invoices",
    EventType.VERIFICATION_FAILED:   "security",
    EventType.LISTED_ON_MARKETPLACE: "marketplace",
    EventType.INVESTOR_BID_RECEIVED: "marketplace",
    EventType.AUCTION_CLOSED:        "marketplace",
    EventType.FUNDING_APPROVED:      "funding",
    EventType.FUNDS_RELEASED:        "funding",
    EventType.SETTLEMENT_COMPLETE:   "funding",
}

# Priority for activity timeline
EVENT_PRIORITY_MAP = {
    EventType.INVOICE_UPLOADED:      "High",
    EventType.AI_ANALYSIS_COMPLETE:  "High",
    EventType.VERIFICATION_PASSED:   "High",
    EventType.VERIFICATION_FAILED:   "High",
    EventType.LISTED_ON_MARKETPLACE: "High",
    EventType.INVESTOR_BID_RECEIVED: "Medium",
    EventType.AUCTION_CLOSED:        "High",
    EventType.FUNDING_APPROVED:      "High",
    EventType.FUNDS_RELEASED:        "High",
    EventType.SETTLEMENT_COMPLETE:   "High",
}
