"""
MPESA Finance Tracker — FastAPI REST API
=========================================
Run:  uvicorn api:app --reload --port 8000
"""

import os
import tempfile
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database.session import engine
from database.models import Base, Transaction
from database.repository import TransactionRepository
from services.analytics import AnalyticsService
from helpers.file_loader import load_statements, clean_mpesa_text, consolidate_fuliza
from agents.analysing_agent import build_finance_agent

# ── Lifespan: create tables + build agent once ────────────────────────────────
_agent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _agent
    Base.metadata.create_all(engine)
    _agent = build_finance_agent()
    yield


app = FastAPI(
    title="MPESA Finance Tracker AI",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS — allow the React frontend ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ───────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════


@app.post("/api/upload")
async def upload_statement(file: UploadFile = File(...)):
    """Upload an M-PESA PDF or CSV statement and import transactions."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".pdf", ".csv"):
        raise HTTPException(status_code=400, detail="Only .pdf and .csv files are supported.")

    # Save to a temp file so the existing loader can read it
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        raw = load_statements(tmp_path)
        df = clean_mpesa_text(raw)
        df = consolidate_fuliza(df)

        repo = TransactionRepository()
        before_count = len(repo.get_all())
        repo.add_bulk(df)

        after_count = len(repo.get_all())
        imported = after_count - before_count
        skipped = len(df) - imported
        repo.close()

        return {
            "imported": imported,
            "skipped": skipped,
            "message": f"Successfully processed {file.filename}. "
                       f"{imported} new transactions imported, {skipped} duplicates skipped.",
        }
    finally:
        os.unlink(tmp_path)


@app.get("/api/summary")
def get_summary():
    """KPI cards: inflow, outflow, net, fuliza used/repaid, merchant spend."""
    analytics = AnalyticsService()
    return analytics.summary()


@app.get("/api/categories")
def get_categories():
    """Spending grouped by transaction type."""
    analytics = AnalyticsService()
    return analytics.spending_by_category()


@app.get("/api/top-expenses")
def get_top_expenses(limit: int = Query(5, ge=1, le=50)):
    """Largest single expenditures."""
    analytics = AnalyticsService()
    return analytics.top_transactions(limit=limit)


@app.get("/api/transactions")
def get_transactions(
    start: str | None = Query(None, description="ISO date start"),
    end: str | None = Query(None, description="ISO date end"),
    type: str | None = Query(None, description="Transaction type filter"),
    q: str | None = Query(None, description="Search query"),
    min: float | None = Query(None, description="Min absolute amount"),
    max: float | None = Query(None, description="Max absolute amount"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Paginated, filterable transaction list."""
    repo = TransactionRepository()
    result = repo.get_transactions(
        start=start,
        end=end,
        tx_type=type,
        q=q,
        amount_min=min,
        amount_max=max,
        page=page,
        page_size=page_size,
    )
    repo.close()
    return result


@app.get("/api/fuliza")
def get_fuliza():
    """Full Fuliza analytics with timeline."""
    analytics = AnalyticsService()
    return analytics.fuliza_usage()


@app.post("/api/chat")
def chat(req: ChatRequest):
    """Chat with the AI finance agent."""
    if _agent is None:
        raise HTTPException(status_code=503, detail="Agent not ready yet.")
    response = _agent.invoke({"input": req.message})
    return ChatResponse(answer=response["output"])
