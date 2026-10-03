import axios from "axios";

import type {
  CustomerDetail,
  CustomerListResponse,
  OutreachStatus,
} from "../types/customer";

const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
});

export async function getCustomers(
  page: number,
  pageSize: number,
  riskTier?: string,
  contract?: string,
) {
  const response = await api.get<CustomerListResponse>("/customers/", {
    params: {
      page,
      page_size: pageSize,
      risk_tier: riskTier || undefined,
      contract: contract || undefined,
    },
  });

  return response.data;
}

export async function getCustomer(customerId: string) {
  const response = await api.get<CustomerDetail>(`/customers/${customerId}`);

  return response.data;
}

export async function updateOutreachStatus(
  customerId: string,
  status: OutreachStatus,
) {
  const response = await api.patch(`/customers/${customerId}/outreach`, {
    status,
  });

  return response.data;
}
