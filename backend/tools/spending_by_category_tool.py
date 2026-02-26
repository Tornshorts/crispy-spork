import json
import re
from langchain_core.tools import tool
from services.analytics import AnalyticsService

# ── Create a shared analytics instance ───────────────────────────────────────
analytics = AnalyticsService()

@tool
def get_spending_by_category(query: str = "") -> str:
    """
    Returns spending broken down by transaction type (e.g., Merchant Payment,
    Money Transfer, Airtime Purchase, Fuliza Repayment, etc.).
    Use this to identify where the user spends the most money.
    Pass any string as input (it is ignored).
    """
    result = analytics.spending_by_category()
    return json.dumps(result, indent=2)