import os
import sys
from pypdf import PdfReader
import pandas as pd
import re



def load_statements(file_path: str) ->str:
    """
    Loads statements from a pdf file.
    Returns the raw text.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found:{file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return _load_pdf(file_path)
    elif ext == ".csv":
        return _load_csv(file_path)
    else:
        raise ValueError(f"Unsupported file type {ext}. Use .pdf or .csv")

def _load_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text =""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text


def _to_float(val):
    """Convert a comma-formatted string like '-1,460.00' to a float."""
    if not val:
        return 0.0
    return float(str(val).replace(',', ''))


def clean_mpesa_text(raw_text: str):

    transactions = re.split(r'\bU[A-Z0-9]{9,}\b', raw_text)

    codes = re.findall(r'\bU[A-Z0-9]{9,}\b', raw_text)

    structured = []

    for code, body in zip(codes, transactions[1:]):
        #Extract date
        date_match =re.search(r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}', body)
        date = date_match.group() if date_match else None

        #Extract amount
        amount_match = re.search(r'(-?\d{1,3}(?:,\d{3})*\.\d{2})',body)
        amount = _to_float(amount_match.group()) if amount_match else 0.0

        #extract balance
        balance_match = re.findall(r'(-?\d{1,3}(?:,\d{3})*\.\d{2})', body)
        balance = _to_float(balance_match[-1]) if balance_match else 0.0

        #Transaction type
        if "Funds received" in body:
            tx_type ="Received"
        elif "Merchant Payment" in body:
            tx_type = "Merchant Payment"
        elif "Loan Repayment" in body or "OD Loan Repayment" in body:
            tx_type = "Fuliza Repayment"
        elif "Bundle Purchase" in body:
            tx_type = "Bundle Purchase"
        elif "Pay Bill" in body:
            tx_type = "Merchant Payment"
        elif "Unit Trust Invest" in body:
            tx_type = "Ziidi Investment"
        elif "Customer Transfer" in body:
            tx_type = "Money Transfer"
        elif "Airtime Purchase" in body:
            tx_type = "Airtime Purchase"
        elif "C2B Transfer" in body:
            tx_type = "Airtel Money Transfer" 
        elif "Unit Trust Withdraw" in body:
            tx_type = "Ziidi Withdrawal"
        elif "OverDraft of Credit Party" in body:
            tx_type = "Amount Fulizad"
        elif "Customer Withdrawal At Agent" in body:
            tx_type = "Withdrawal"
        elif "Withdrawal Charge" in body:
            tx_type = "Withdrawal Charge"
        elif "Business Payment from" in body:
            tx_type = "Received"
        elif "Customer Payment to Small" in body:
            tx_type = "Merchant Payment"
        else:
            tx_type ="Other"
        
        structured.append({
            "Transaction Code": code,
            "Date":date,
            "Type":tx_type,
            "Amount": amount,
            "Balance": balance
        })
    return pd.DataFrame(structured)

def consolidate_fuliza(df):
    cleaned = []

    grouped = df.groupby("Transaction Code", sort =False)

    for code, group in grouped:

        row = group.iloc[0].copy()
        row["Fuliza used"] = 0.0

        if "Amount Fulizad" in group["Type"].values:
            fuliza_amount = group.loc[
                group["Type"] == "Amount Fulizad", "Amount"
            ].sum()

            row["Fuliza used"] = fuliza_amount

            # Remove the artificial positive inflow
            if row["Type"] == "Amount Fulizad":
                continue

        cleaned.append(row)

    return pd.DataFrame(cleaned)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python file_loader.py <path_to_statement.pdf|csv>")
        sys.exit(1)

    file_path = sys.argv[1]
    raw = load_statements(file_path)
    df = clean_mpesa_text(raw)
    df = consolidate_fuliza(df)

    print(df.head(20))