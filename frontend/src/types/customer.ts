export type RiskTier = "LOW" | "MEDIUM" | "HIGH";

export type OutreachStatus = "NOT_CONTACTED" | "IN_PROGRESS" | "RESOLVED";

export interface CustomerListItem {
  customerID: string;
  gender: string;
  tenure: number;
  Contract: string;
  MonthlyCharges: number;
  risk_score: number;
  risk_tier: RiskTier;
}

export interface Customer {
  customerID: string;
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number | null;
  Churn: string;
}

export interface RiskFactor {
  factor: string;
  impact: number;
  reason: string;
}

export interface CustomerRisk {
  score: number;
  tier: RiskTier;
  factors: RiskFactor[];
}

export interface CustomerDetail {
  customer: Customer;
  risk: CustomerRisk;
  outreach_status: OutreachStatus;
}

export interface CustomerListResponse {
  items: CustomerListItem[];
  page: number;
  page_size: number;
  total: number;
}
