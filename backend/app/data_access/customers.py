import pandas as pd
from app.logging_config import logger
from pathlib import Path

DATA_FILE = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
)

_outreach_status = {}


def load_customers():
    try:
        df = pd.read_csv(DATA_FILE)

        df["TotalCharges"] = pd.to_numeric(
            df["TotalCharges"].astype(str).str.strip(), errors="coerce"
        )

        df["TotalCharges"] = df["TotalCharges"].where(df["TotalCharges"].notna(), None)

        customers = df.to_dict(orient="records")

        for customer in customers:
            customer["outreach_status"] = _outreach_status.get(
                customer["customerID"], "NOT_CONTACTED"
            )

        return customers
    
    except FileNotFoundError:
        logger.exception("Customer data file not found")
        raise

    except (pd.errors.ParserError, ValueError):
        logger.exception("Unable to parse customer data")
        raise

    except Exception:
        logger.exception("Unexpected error loading customers")
        raise


def update_outreach_status(customer_id: str, status: str):
    _outreach_status[customer_id] = status
