import { useEffect, useState } from "react";
import axios from "axios";
import { getCustomer, updateOutreachStatus } from "../services/api";

import type {
  CustomerDetail as CustomerDetailType,
  OutreachStatus,
} from "../types/customer";

import RiskBadge from "../components/RiskBadge";

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
}

export default function CustomerDetail({
  customerId,
  onBack,
}: CustomerDetailProps) {
  const [data, setData] = useState<CustomerDetailType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [outreachStatus, setOutreachStatus] =
  useState<OutreachStatus | null>(null);

  const [updatingOutreach, setUpdatingOutreach] =
  useState(false);

  const [outreachError, setOutreachError] =
  useState("");

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  async function loadCustomer() {
    try {
      setLoading(true);
      setError("");

      const result = await getCustomer(customerId);

      setData(result);
      setOutreachStatus(result.outreach_status);
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
        setError("Something went wrong while loading customer details.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOutreachChange(newStatus: OutreachStatus) {
    if (!outreachStatus) {
      return;
    }

    try {
      setUpdatingOutreach(true);
      setOutreachError("");

      const result = await updateOutreachStatus(customerId, newStatus);

      setOutreachStatus(result.outreach_status);
    } catch (error) {
      console.error(error);

      setOutreachError("Unable to update outreach status. Please try again.");
    } finally {
      setUpdatingOutreach(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p>Loading customer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-message">
          <p>{error}</p>

          <button onClick={loadCustomer}>Retry</button>
        </div>

        <button onClick={onBack}>Back to customers</button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { customer, risk } = data;

  return (
    <div className="page">
      <button className="back-button" onClick={onBack}>
        ← Back to customers
      </button>

      <header>
        <h1>Customer Details</h1>

        <p>Customer ID: {customer.customerID}</p>
      </header>

      {/* Risk summary */}

      <section className="detail-card">
        <div className="detail-card-header">
          <h2>Risk Assessment</h2>

          <RiskBadge tier={risk.tier} score={risk.score} />
        </div>

        <div className="risk-score">
          <strong>{risk.score}</strong>
          <span>/ 100</span>
        </div>
      </section>

      {/* Risk factors */}

      <section className="detail-card">
        <h2>Why is this customer at risk?</h2>

        {risk.factors.length === 0 ? (
          <p>No risk factors were identified.</p>
        ) : (
          <div className="risk-factors">
            {risk.factors.map((factor) => (
              <div className="risk-factor" key={factor.factor}>
                <div>
                  <strong>{factor.factor}</strong>

                  <p>{factor.reason}</p>
                </div>

                <span className="factor-impact">+{factor.impact}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="detail-card">
        <h2>Outreach</h2>

        <div className="outreach-section">
          <div>
            <label>Current Status</label>

            <div className="outreach-status">{outreachStatus}</div>
          </div>

          <div className="outreach-actions">
            {outreachStatus === "NOT_CONTACTED" && (
              <button
                onClick={() => handleOutreachChange("IN_PROGRESS")}
                disabled={updatingOutreach}
              >
                {updatingOutreach ? "Updating..." : "Start Outreach"}
              </button>
            )}

            {outreachStatus === "IN_PROGRESS" && (
              <button
                onClick={() => handleOutreachChange("RESOLVED")}
                disabled={updatingOutreach}
              >
                {updatingOutreach ? "Updating..." : "Mark Resolved"}
              </button>
            )}

            {outreachStatus === "RESOLVED" && (
              <p className="resolved-message">Outreach has been resolved.</p>
            )}
          </div>

          {outreachError && (
            <div className="outreach-error">{outreachError}</div>
          )}
        </div>
      </section>

      {/* Customer profile */}

      <section className="detail-card">
        <h2>Customer Profile</h2>

        <div className="profile-grid">
          <div>
            <label>Gender</label>
            <span>{customer.gender}</span>
          </div>

          <div>
            <label>Tenure</label>
            <span>{customer.tenure} months</span>
          </div>

          <div>
            <label>Contract</label>
            <span>{customer.Contract}</span>
          </div>

          <div>
            <label>Monthly Charges</label>
            <span>${customer.MonthlyCharges.toFixed(2)}</span>
          </div>

          <div>
            <label>Total Charges</label>
            <span>
              {customer.TotalCharges !== null
                ? `$${customer.TotalCharges.toFixed(2)}`
                : "N/A"}
            </span>
          </div>

          <div>
            <label>Internet Service</label>
            <span>{customer.InternetService}</span>
          </div>

          <div>
            <label>Tech Support</label>
            <span>{customer.TechSupport}</span>
          </div>

          <div>
            <label>Online Security</label>
            <span>{customer.OnlineSecurity}</span>
          </div>

          <div>
            <label>Online Backup</label>
            <span>{customer.OnlineBackup}</span>
          </div>

          <div>
            <label>Device Protection</label>
            <span>{customer.DeviceProtection}</span>
          </div>

          <div>
            <label>Streaming TV</label>
            <span>{customer.StreamingTV}</span>
          </div>

          <div>
            <label>Streaming Movies</label>
            <span>{customer.StreamingMovies}</span>
          </div>

          <div>
            <label>Payment Method</label>
            <span>{customer.PaymentMethod}</span>
          </div>

          <div>
            <label>Paperless Billing</label>
            <span>{customer.PaperlessBilling}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
