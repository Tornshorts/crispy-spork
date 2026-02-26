from datetime import datetime
from sqlalchemy import func, or_
from database.session import SessionLocal
from database.models import Transaction


class TransactionRepository:

    def __init__(self):
        self.session = SessionLocal()

    def add_bulk(self, df):
        import pandas as pd

        df = df.rename(columns={
            "Transaction Code": "transaction_code",
            "Date": "date",
            "Type": "type",
            "Amount": "amount",
            "Balance": "balance",
            "Fuliza used": "fuliza_used",
        })

        # Convert date strings to datetime objects
        df["date"] = pd.to_datetime(df["date"], errors="coerce")

        # Ensure numeric columns are floats (not comma-formatted strings)
        for col in ["amount", "balance", "fuliza_used"]:
            if col in df.columns:
                df[col] = df[col].apply(
                    lambda x: float(str(x).replace(",", "")) if x else 0.0
                )

        records = df.to_dict(orient="records")

        # Use INSERT OR IGNORE to skip duplicates on re-run
        self.session.execute(
            Transaction.__table__.insert().prefix_with("OR IGNORE"),
            records
        )
        self.session.commit()

    def get_all(self):
        return self.session.query(Transaction).all()

    def get_transactions(
        self,
        start: str | None = None,
        end: str | None = None,
        tx_type: str | None = None,
        q: str | None = None,
        amount_min: float | None = None,
        amount_max: float | None = None,
        page: int = 1,
        page_size: int = 20,
    ):
        """Return paginated, filtered transactions."""
        session = SessionLocal()
        query = session.query(Transaction)

        if start:
            query = query.filter(Transaction.date >= datetime.fromisoformat(start))
        if end:
            query = query.filter(Transaction.date <= datetime.fromisoformat(end))
        if tx_type:
            query = query.filter(Transaction.type == tx_type)
        if q:
            pattern = f"%{q}%"
            query = query.filter(
                or_(
                    Transaction.transaction_code.ilike(pattern),
                    Transaction.type.ilike(pattern),
                )
            )
        if amount_min is not None:
            query = query.filter(func.abs(Transaction.amount) >= amount_min)
        if amount_max is not None:
            query = query.filter(func.abs(Transaction.amount) <= amount_max)

        total = query.count()
        rows = (
            query.order_by(Transaction.date.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        session.close()

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "data": [
                {
                    "transaction_code": t.transaction_code,
                    "date": str(t.date),
                    "type": t.type,
                    "amount": t.amount,
                    "balance": t.balance,
                    "fuliza_used": t.fuliza_used,
                }
                for t in rows
            ],
        }

    def total_spent(self):
        return self.session.query(
            func.sum(Transaction.amount)
        ).filter(Transaction.amount < 0).scalar()

    def total_received(self):
        return self.session.query(
            func.sum(Transaction.amount)
        ).filter(Transaction.amount > 0).scalar()

    def close(self):
        self.session.close()