import json
import re
from langchain_core.tools import tool
from services.analytics import AnalyticsService

# ── Create a shared analytics instance ───────────────────────────────────────
analytics = AnalyticsService()


@tool
def get_top_transactions(query: str = "") -> str:
    """
    Returns the 10 largest single expenditures from the user's M-PESA history.
    Use this to highlight big spending moments to the user.
    Pass any string as input (it is ignored).
    """
    result = analytics.top_transactions(limit=10)
    return json.dumps(result, indent=2)