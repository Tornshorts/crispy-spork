from database.repository import TransactionRepository
from sqlalchemy import func, extract
from database.session import SessionLocal
from database.models import Transaction


class AnalyticsService:

    def __init__(self):
        self.repo = TransactionRepository()

    def summary(self):
        """Returns 6 KPI fields for the dashboard."""
        session = SessionLocal()

        total_inflow = session.query(
            func.sum(Transaction.amount)
        ).filter(Transaction.amount > 0).scalar() or 0.0

        lifestyle_outflow = session.query(
            func.sum(Transaction.amount)
        ).filter(Transaction.amount < 0).scalar() or 0.0

        fuliza_used = session.query(
            func.sum(Transaction.fuliza_used)
        ).filter(Transaction.fuliza_used > 0).scalar() or 0.0

        fuliza_repaid = session.query(
            func.sum(func.abs(Transaction.amount))
        ).filter(Transaction.type == "Fuliza Repayment").scalar() or 0.0

        merchant_spend = session.query(
            func.sum(func.abs(Transaction.amount))
        ).filter(Transaction.type == "Merchant Payment").scalar() or 0.0

        session.close()
        return {
            "total_inflow": round(total_inflow, 2),
            "lifestyle_outflow": round(abs(lifestyle_outflow), 2),
            "net": round(total_inflow + lifestyle_outflow, 2),
            "fuliza_used": round(fuliza_used, 2),
            "fuliza_repaid": round(fuliza_repaid, 2),
            "merchant_spend": round(merchant_spend, 2),
        }

    def spending_by_category(self):
        """Returns spending grouped by transaction type."""
        session = SessionLocal()
        results = session.query(
            Transaction.type,
            func.sum(Transaction.amount).label("total"),
            func.count(Transaction.id).label("count")
        ).filter(Transaction.amount < 0).group_by(Transaction.type).all()
        session.close()
        return [
            {"type": r.type, "total": round(r.total, 2), "count": r.count}
            for r in results
        ]

    def top_transactions(self, limit=10):
        """Returns the largest single expenditures."""
        session = SessionLocal()
        results = session.query(Transaction).filter(
            Transaction.amount < 0
        ).order_by(Transaction.amount.asc()).limit(limit).all()
        session.close()
        return [
            {"transaction_code": t.transaction_code, "date": str(t.date),
             "type": t.type, "amount": t.amount}
            for t in results
        ]

    def fuliza_usage(self):
        """Returns full Fuliza analytics including repaid, ratio, and timeline."""
        session = SessionLocal()

        used = session.query(
            func.sum(Transaction.fuliza_used).label("total"),
            func.count(Transaction.id).label("count")
        ).filter(Transaction.fuliza_used > 0).first()

        fuliza_used_total = round(used.total or 0, 2)
        fuliza_used_count = used.count or 0

        fuliza_repaid_total = round(
            session.query(
                func.sum(func.abs(Transaction.amount))
            ).filter(Transaction.type == "Fuliza Repayment").scalar() or 0, 2
        )

        total_inflow = session.query(
            func.sum(Transaction.amount)
        ).filter(Transaction.amount > 0).scalar() or 1  # avoid div-by-zero

        fuliza_ratio = round(fuliza_used_total / total_inflow, 4)

        # Timeline: daily fuliza usage
        timeline_rows = session.query(
            func.date(Transaction.date).label("day"),
            func.sum(Transaction.fuliza_used).label("value")
        ).filter(
            Transaction.fuliza_used > 0
        ).group_by(func.date(Transaction.date)).order_by("day").all()

        session.close()

        return {
            "fuliza_used_total": fuliza_used_total,
            "fuliza_used_count": fuliza_used_count,
            "fuliza_repaid_total": fuliza_repaid_total,
            "fuliza_ratio": fuliza_ratio,
            "timeline": [
                {"date": str(r.day), "value": round(r.value, 2)}
                for r in timeline_rows
            ],
        }