SCORING_RULES = [
    {
        "factor": "Month-to-month contract",
        "weight": 30,
        "description": "Month-to-month contracts indicate higher churn risk.",
    },
    {
        "factor": "Short tenure",
        "weight": 25,
        "description": "Customers with less than 12 months of tenure have higher churn risk.",
    },
    {
        "factor": "High monthly charges",
        "weight": 15,
        "description": "Monthly charges of $70 or more increase churn risk.",
    },
    {
        "factor": "No tech support",
        "weight": 10,
        "description": "Customers without technical support receive additional risk points.",
    },
    {
        "factor": "No online security",
        "weight": 10,
        "description": "Customers without online security receive additional risk points.",
    },
]


def calculate_risk(customer):
    score = 0
    factors = []

    if customer["Contract"] == "Month-to-month":
        score += 30
        factors.append(
            {
                "factor": "Month-to-month contract",
                "impact": 30,
                "reason": "Month-to-month contracts indicate higher churn risk.",
            }
        )

    if customer["tenure"] < 12:
        score += 25
        factors.append(
            {
                "factor": "Short tenure",
                "impact": 25,
                "reason": "Customer has been with the company for less than 12 months.",
            }
        )

    if customer["MonthlyCharges"] >= 70:
        score += 15
        factors.append(
            {
                "factor": "High monthly charges",
                "impact": 15,
                "reason": "Monthly charges are $70 or more.",
            }
        )

    if customer["TechSupport"] == "No":
        score += 10
        factors.append(
            {
                "factor": "No tech support",
                "impact": 10,
                "reason": "Customer does not have technical support.",
            }
        )

    if customer["OnlineSecurity"] == "No":
        score += 10
        factors.append(
            {
                "factor": "No online security",
                "impact": 10,
                "reason": "Customer does not have online security.",
            }
        )

    score = min(score, 100)

    if score >= 60:
        tier = "HIGH"
    elif score >= 30:
        tier = "MEDIUM"
    else:
        tier = "LOW"

    return {"score": score, "tier": tier, "factors": factors}
