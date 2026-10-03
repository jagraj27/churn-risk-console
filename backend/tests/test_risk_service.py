from app.services.risk_service import calculate_risk


def test_high_risk_customer():
    customer = {
        "Contract": "Month-to-month",
        "tenure": 2,
        "MonthlyCharges": 100,
        "TechSupport": "No",
        "OnlineSecurity": "No",
    }

    result = calculate_risk(customer)

    assert result["score"] == 90
    assert result["tier"] == "HIGH"


def test_low_risk_customer():
    customer = {
        "Contract": "Two year",
        "tenure": 48,
        "MonthlyCharges": 40,
        "TechSupport": "Yes",
        "OnlineSecurity": "Yes",
    }

    result = calculate_risk(customer)

    assert result["score"] == 0
    assert result["tier"] == "LOW"
