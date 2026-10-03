from typing import Optional
from pydantic import BaseModel
from app.models.outreach import OutreachStatus


class Customer(BaseModel):
    customerID: str
    gender: str
    SeniorCitizen: int
    Partner: str
    Dependents: str
    tenure: int
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str
    PaymentMethod: str
    MonthlyCharges: float
    TotalCharges: Optional[float] = None
    Churn: str


class RiskFactor(BaseModel):
    factor: str
    impact: int
    reason: str


class Risk(BaseModel):
    score: int
    tier: str
    factors: list[RiskFactor]


class CustomerListItem(BaseModel):
    customerID: str
    gender: str
    tenure: int
    Contract: str
    MonthlyCharges: float
    risk_score: int
    risk_tier: str


class CustomerDetail(BaseModel):
    customer: Customer
    risk: Risk
    outreach_status: OutreachStatus


class CustomerListResponse(BaseModel):
    items: list[CustomerListItem]
    page: int
    page_size: int
    total: int
