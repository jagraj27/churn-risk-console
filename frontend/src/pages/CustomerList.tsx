interface CustomerListProps {
  onSelectCustomer: (customerId: string) => void;
}
import { useEffect, useState } from "react";
import axios from "axios";
import { getCustomers } from "../services/api";
import type { CustomerListItem } from "../types/customer";

import RiskBadge from "../components/RiskBadge";

export default function CustomerList({ onSelectCustomer }: CustomerListProps) {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [riskTier, setRiskTier] = useState("");
  const [contract, setContract] = useState("");

  const pageSize = 20;

  useEffect(() => {
    loadCustomers();
  }, [page, riskTier, contract]);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomers(page, pageSize, riskTier, contract);

      setCustomers(data.items);
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          setError(
            "The server is taking too long to respond. Please try again.",
          );
        } else if (!error.response) {
          setError(
            "Unable to connect to the server. Please check that the API is running.",
          );
        } else {
          setError("The server returned an error. Please try again.");
        }
      } else {
        setError("Something went wrong while loading customers.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleRiskChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setPage(1);
    setRiskTier(event.target.value);
  }

  function handleContractChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setPage(1);
    setContract(event.target.value);
  }

  return (
    <div className="page">
      <header>
        <h1>Customer Retention Console</h1>

        <p>Identify customers who may need outreach.</p>
      </header>

      <section className="filters">
        <select value={riskTier} onChange={handleRiskChange}>
          <option value="">All Risk Levels</option>
          <option value="HIGH">High Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
        </select>

        <select value={contract} onChange={handleContractChange}>
          <option value="">All Contracts</option>
          <option value="Month-to-month">Month-to-month</option>
          <option value="One year">One year</option>
          <option value="Two year">Two year</option>
        </select>
      </section>

      {loading && <div className="message">Loading customers...</div>}

      {!loading && error && (
        <div className="error-message">
          <p>{error}</p>

          <button onClick={loadCustomers}>Retry</button>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="message">No customers found matching your filters.</div>
      )}

      {!loading && !error && customers.length > 0 && (
        <section className="customer-table">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Risk</th>
                <th>Contract</th>
                <th>Tenure</th>
                <th>Monthly Charges</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customerID}>
                  <td>
                    <button
                      className="customer-link"
                      onClick={() => onSelectCustomer(customer.customerID)}
                    >
                      {customer.customerID}
                    </button>
                  </td>

                  <td>
                    <RiskBadge
                      tier={customer.risk_tier}
                      score={customer.risk_score}
                    />
                  </td>

                  <td>{customer.Contract}</td>

                  <td>{customer.tenure} months</td>

                  <td>${customer.MonthlyCharges.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <div className="pagination">
        <button
          disabled={page === 1 || loading}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span>Page {page}</span>

        <button
          disabled={loading || customers.length < pageSize}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
