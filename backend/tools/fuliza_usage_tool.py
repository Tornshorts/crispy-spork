import json
import re
from langchain_core.tools import tool
from services.analytics import AnalyticsService

# ── Create a shared analytics instance ───────────────────────────────────────
analytics = AnalyticsService()

@tool
def get_fuliza_usage(query: str = "") -> str:
    """
    Returns total Fuliza (overdraft) usage and how many transactions used Fuliza.
    Use this to assess the user's reliance on overdraft credit.
    Pass any string as input (it is ignored).
    """
    result = analytics.fuliza_usage()
    return json.dumps(result, indent=2)