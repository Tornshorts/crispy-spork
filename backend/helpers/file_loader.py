import os
import sys
from pypdf import PdfReader
import pandas as pd
import re



def load_statements(file_path: str, password: str = None) -> str:
    """
    Loads statements from a pdf or csv file.
    Returns the raw text.

    For encrypted M-PESA PDFs, pass the password (usually your national ID).
    If no password is provided and the PDF is encrypted, it will be prompted interactively.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found:{file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return _load_pdf(file_path, password)
    elif ext == ".csv":
        return _load_csv(file_path)
    else:
        raise ValueError(f"Unsupported file type {ext}. Use .pdf or .csv")

def _load_pdf(file_path: str, password: str = None) -> str:
    reader = PdfReader(file_path)

    # Handle encrypted / password-protected PDFs
    if reader.is_encrypted:
        if password is None:
            # Do NOT use getpass here — it blocks the web server.
            # Instead, raise so the API returns an error to the frontend,
            # which will then show a password input in the browser.
            raise ValueError(
                "This PDF is password-protected. "
                "Please provide your statement password."
            )
        try:
            result = reader.decrypt(password)
            if result == 0:
                raise ValueError(
                    "Wrong password. M-PESA statements are usually "
                    "protected with your national ID number."
                )
        except Exception as e:
            if "password" in str(e).lower() or "decrypt" in str(e).lower() or isinstance(e, ValueError):
                raise ValueError(
                    "Wrong password. M-PESA statements are usually "
                    "protected with your national ID number."
                )
            raise

    text = ""
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

        # Normalize body text — PDF extraction may split lines
        body_clean = body.replace("\n", " ").replace("\r", " ")

        #Transaction type
        if "Funds received" in body_clean:
            tx_type ="Received"
        elif "Merchant Payment" in body_clean:
            tx_type = "Merchant Payment"
        elif "Loan Repayment" in body_clean or "OD Loan Repayment" in body_clean:
            tx_type = "Fuliza Repayment"
        elif "Bundle Purchase" in body_clean:
            tx_type = "Bundle Purchase"
        elif "Pay Bill" in body_clean:
            tx_type = "Merchant Payment"
        elif "Unit Trust Invest" in body_clean:
            tx_type = "Ziidi Investment"
        elif "Customer Transfer" in body_clean:
            tx_type = "Money Transfer"
        elif "Airtime Purchase" in body_clean:
            tx_type = "Airtime Purchase"
        elif "C2B Transfer" in body_clean:
            tx_type = "Airtel Money Transfer" 
        elif "Unit Trust Withdraw" in body_clean:
            tx_type = "Ziidi Withdrawal"
        elif "OverDraft of Credit Party" in body_clean:
            tx_type = "Amount Fulizad"
        elif "Withdrawal Charge" in body_clean:
            tx_type = "Withdrawal Charge"
        elif "Customer Withdrawal" in body_clean or "Agent Withdrawal" in body_clean or "Withdraw" in body_clean or "Cash Out" in body_clean:
            tx_type = "Withdrawal"
        elif "Business Payment from" in body_clean:
            tx_type = "Received"
        elif "Customer Payment to Small" in body_clean:
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