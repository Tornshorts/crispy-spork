from email.policy import default
from enum import unique
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime

Base = declarative_base()

class Transaction(Base):
    __tablename__="transactions"

    id = Column(Integer, primary_key=True)
    transaction_code = Column(String, unique=True, nullable=False)
    date=Column(DateTime,nullable=False)
    type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    balance = Column(Float, nullable=False)
    fuliza_used = Column(Float, default=0.0)
    
