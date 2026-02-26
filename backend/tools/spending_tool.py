import json
import re
from langchain_core.tools import tool
from services.analytics import AnalyticsService

# ── Create a shared analytics instance ───────────────────────────────────────
analytics = AnalyticsService()

@tool
def get_spending_summary(query: str = "") -> str:
    """
    Returns total money spent and total money received from the M-PESA statement.
    Use this to give the user an overview of their financial position.
    Pass any string as input (it is ignored).
    """
    result = analytics.summary()
    return json.dumps(result, indent=2)
