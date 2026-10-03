from fastapi import APIRouter, HTTPException, Query

from app.logging_config import logger

from app.data_access.customers import load_customers
from app.models.customer import (
    CustomerDetail,
    CustomerListResponse,
)
from app.services.risk_service import calculate_risk

from app.data_access.customers import (
    load_customers,
    update_outreach_status,
)

from app.models.outreach import (
    OutreachStatus,
    OutreachUpdate,
)

from app.services.outreach_service import validate_transition

router = APIRouter()


@router.get("/", response_model=CustomerListResponse)
def get_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    risk_tier: str | None = None,
    contract: str | None = None,
):
    customers = load_customers()

    results = []

    for customer in customers:
        risk = calculate_risk(customer)

        if risk_tier and risk["tier"] != risk_tier.upper():
            continue

        if contract and customer["Contract"] != contract:
            continue

        results.append(
            {
                "customerID": customer["customerID"],
                "gender": customer["gender"],
                "tenure": customer["tenure"],
                "Contract": customer["Contract"],
                "MonthlyCharges": customer["MonthlyCharges"],
                "risk_score": risk["score"],
                "risk_tier": risk["tier"],
            }
        )

    total = len(results)

    start = (page - 1) * page_size
    end = start + page_size

    return {
        "items": results[start:end],
        "page": page,
        "page_size": page_size,
        "total": total,
    }


@router.get("/{customer_id}", response_model=CustomerDetail)
def get_customer(customer_id: str):
    customers = load_customers()

    customer = next(
        (customer for customer in customers if customer["customerID"] == customer_id),
        None,
    )

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    risk = calculate_risk(customer)

    return {
        "customer": customer,
        "risk": risk,
        "outreach_status": customer["outreach_status"],
    }


@router.patch("/{customer_id}/outreach")
def update_customer_outreach(
    customer_id: str,
    update: OutreachUpdate,
):
    customers = load_customers()

    customer = next(
        (customer for customer in customers if customer["customerID"] == customer_id),
        None,
    )

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    try:
        current_status = OutreachStatus(customer["outreach_status"])
    except ValueError:
        raise HTTPException(
            status_code=500,
            detail="Customer has an invalid outreach status",
        )

    validate_transition(
        current_status,
        update.status,
    )

    update_outreach_status(
        customer_id,
        update.status.value,
    )

    return {
        "customerID": customer_id,
        "outreach_status": update.status.value,
    }
