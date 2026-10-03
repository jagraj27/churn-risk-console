# Churn Risk & Retention Console

## 1. Overview

What the application does.

## 2. Architecture

Frontend → FastAPI → Services → Data Access

## 3. Running the Application

Installation and commands.

## 4. API Endpoints

GET /customers
GET /customers/{id}
PATCH /customers/{id}/outreach
GET /model/info

## 5. Risk Scoring

Explain the heuristic rules and weights.

## 6. Risk Tiers

LOW / MEDIUM / HIGH thresholds.

## 7. Outreach State Machine

NOT_CONTACTED → IN_PROGRESS → RESOLVED

## 8. Error Handling

400 / 404 / 422 / 500 and logging.

## 9. Testing

How to run tests and what is covered.

## 10. Design Decisions

Why these technologies and architectural choices were made.

## 11. Assumptions & Limitations

Heuristic is not a real ML model,
CSV is used as the data source,
etc.

## 12. Future Improvements

Database persistence, real ML service, authentication, etc.

The scoring function is intentionally heuristic and is not intended to
represent a trained machine-learning model.

The score uses customer attributes that are intuitively related to
subscription churn:

- Contract type: month-to-month customers have less commitment.
- Tenure: newer customers have had less time to establish a relationship.
- Monthly charges: higher recurring charges may increase cancellation sensitivity.
- Technical support: lack of support may indicate reduced service engagement.
- Online security: lack of additional services may indicate lower product adoption.

Each rule contributes a fixed weight. The final score is capped at 100 and
mapped into LOW, MEDIUM, and HIGH risk tiers.

cd frontend/

npm create vite@latest . -- --template react-ts

npm install axios


npm run dev