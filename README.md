# Churn Risk & Retention Console

A full-stack application for helping retention agents identify customers who may be at risk of churn, understand **why** they are considered high risk, and manage customer outreach.

The application consists of:

- **FastAPI + Python** backend
- **React + TypeScript + Vite** frontend
- **Pandas** for CSV data loading
- **Pydantic** for API data validation
- **Pytest** for backend unit tests
- **Axios** for frontend API communication

The risk model is intentionally a transparent heuristic rather than a trained machine-learning model. In a production environment, the same UI could consume scores from a versioned ML service.

---

## Project Structure

```text
project/
├── README.md
├── data/
│   └── WA_Fn-UseC_-Telco-Customer-Churn.csv
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── logging_config.py
│   │   ├── routes/
│   │   │   ├── customers.py
│   │   │   └── model.py
│   │   ├── models/
│   │   │   ├── customer.py
│   │   │   ├── outreach.py
│   │   │   └── model.py
│   │   ├── services/
│   │   │   ├── risk_service.py
│   │   │   └── outreach_service.py
│   │   └── data_access/
│   │       └── customers.py
│   │
│   ├── tests/
│   │   ├── test_risk_service.py
│   │   └── test_outreach_service.py
│   │
│   ├── requirements.txt
│   └── pytest.ini
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── types/
    │   ├── App.tsx
    │   └── index.css
    ├── package.json
    └── vite.config.ts
```

---

# Setup and Running

The application can be run locally with a Python environment for the backend and Node.js for the frontend.

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## 1. Clone the repository

```bash
git clone https://github.com/jagraj27/churn-risk-console.git
cd churn-risk-console
```

## 2. Start the backend

Open a terminal:

```bash
cd backend
```

Create and activate a virtual environment:

### Linux / macOS / WSL

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
fastapi dev app/main.py --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

API documentation is available at:

```text
http://localhost:8000/docs
```

## 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

Open the frontend URL in a browser.

The frontend is configured to communicate with the FastAPI backend at:

```text
http://localhost:8000
```

---

# Framework Choice

## Backend — FastAPI

FastAPI was chosen because it provides:

- Strong request and response validation through Pydantic
- Automatic OpenAPI/Swagger documentation
- Clear HTTP status handling
- Good support for asynchronous applications
- Simple dependency and route structure
- Good fit for a Python-based data and ML ecosystem

The application separates API routes, services, data access, and models so that the risk-scoring logic is not tied directly to HTTP handlers.

## Frontend — React + TypeScript + Vite

React was chosen because the application is primarily an interactive operational console with:

- Customer lists
- Filters
- Pagination
- Customer detail views
- Risk indicators
- Outreach actions
- Loading and error states

TypeScript provides type safety between API responses and UI components.

Vite was selected for its simple configuration and fast development workflow.

Axios is used as the HTTP client for communication with the backend.

---

# Data Modeling

The customer data originates from a CSV dataset.

The backend converts CSV records into validated application models using Pydantic.

The customer model represents the original customer attributes, while risk information is represented separately.

Conceptually:

```text
Customer
├── Customer information
├── Subscription information
├── Service information
├── Billing information
└── Churn information

Risk
├── score
├── tier
└── factors[]

Outreach
└── status
```

Keeping risk information separate from the underlying customer record makes it possible to change the scoring implementation without changing the core customer data model.

The list endpoint intentionally returns a smaller customer representation rather than the entire customer record. Full customer information is returned by the detail endpoint.

---

# Risk Scoring Design

The assessment describes a churn model but does not provide a trained model.

Therefore, the application uses a transparent heuristic scoring system as a stand-in for a production ML model.

The scoring rules are:

| Factor                  | Weight |
| ----------------------- | -----: |
| Month-to-month contract |    +30 |
| Tenure below 12 months  |    +25 |
| Monthly charges >= $70  |    +15 |
| No technical support    |    +10 |
| No online security      |    +10 |

The maximum possible score is 90 with the current rules. The implementation still caps the final score at 100 to provide a safe upper bound if additional rules are added later.

Risk tiers are:

```text
0–29    LOW
30–59   MEDIUM
60–100  HIGH
```

The scoring function also returns the individual factors that contributed to the score.

For example:

```text
Risk Score: 65

Factors:
- Month-to-month contract       +30
- Short tenure                  +25
- No technical support          +10
```

This makes the score explainable to a retention agent rather than presenting an unexplained number.

The `/model/info` endpoint exposes the current scoring rules and thresholds so the frontend can understand and display how the score is produced.

### Important limitation

This is intentionally **not presented as a production ML model**.

In production, the heuristic could be replaced with a versioned ML model or external model service while keeping the customer-facing workflow largely unchanged.

---

# Pagination and Filtering

The customer list endpoint supports server-side pagination.

Example:

```text
GET /customers/?page=1&page_size=20
```

The backend calculates:

```text
start = (page - 1) * page_size
end = start + page_size
```

Only the requested page is returned to the frontend.

The endpoint also supports filtering by:

- Risk tier
- Contract type
- Customer search

Example:

```text
GET /customers/?risk_tier=HIGH
```

```text
GET /customers/?contract=Month-to-month
```

```text
GET /customers/?search=7590
```

Filtering is performed before pagination so that pagination applies to the filtered result set.

This prevents the frontend from downloading the complete dataset just to perform basic filtering.

The API response also includes the total number of matching records:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 123
}
```

---

# Customer Detail and Outreach

The customer detail endpoint provides:

```text
GET /customers/{customer_id}
```

It returns:

- Full customer information
- Risk score
- Risk tier
- Individual risk factors
- Current outreach status

Outreach status is controlled through:

```text
PATCH /customers/{customer_id}/outreach
```

The application uses an explicit state machine:

```text
NOT_CONTACTED
      ↓
IN_PROGRESS
      ↓
RESOLVED
```

Allowed transitions include remaining in the current state.

Invalid transitions return an HTTP 400 error.

For example:

```text
NOT_CONTACTED → IN_PROGRESS     valid
IN_PROGRESS   → RESOLVED        valid

NOT_CONTACTED → RESOLVED        invalid
IN_PROGRESS   → NOT_CONTACTED   invalid
RESOLVED      → IN_PROGRESS     invalid
```

This prevents the frontend from being the only place enforcing business rules. The backend remains the source of truth.

---

# Error Handling and Logging

The backend handles common errors using meaningful HTTP status codes.

Examples:

```text
200 OK
```

Successful requests.

```text
400 Bad Request
```

Invalid outreach state transition.

```text
404 Not Found
```

Customer does not exist.

```text
422 Unprocessable Entity
```

Invalid request data handled by FastAPI/Pydantic validation.

The data-access layer catches expected file/parsing errors and logs exceptions.

Structured application logging is configured through Python's `logging` module.

Errors are logged server-side while the API returns appropriate information to the client.

The frontend also handles API failures explicitly.

The UI provides:

- Loading states
- API error messages
- Retry actions
- Timeout handling
- Connection failure messages
- Empty search/filter results

Axios requests use a timeout so the UI does not remain indefinitely in a loading state if the backend becomes unresponsive.

---

# Frontend Resilience

The UI distinguishes between several states:

```text
Loading
   ↓
Success
```

or:

```text
Loading
   ↓
API error
   ↓
Clear error message + Retry
```

or:

```text
Loading
   ↓
Timeout
   ↓
Clear timeout message + Retry
```

or:

```text
Loading
   ↓
No matching customers
   ↓
"No customers found"
```

The application therefore avoids leaving the retention agent with a blank page when the API is unavailable or a filter produces no results.

---

# Testing Approach

Backend unit tests are implemented with Pytest.

## Risk scoring tests

The scoring tests cover representative cases including:

- High-risk customer
- Low-risk customer

The tests verify both:

```text
score
```

and:

```text
risk tier
```

This protects the core business logic from accidental changes.

## Outreach state-machine tests

The outreach tests cover:

- `NOT_CONTACTED → IN_PROGRESS`
- `IN_PROGRESS → RESOLVED`
- Invalid transitions
- Same-state transitions

This verifies that the business rules are enforced independently from the HTTP layer.

Run the tests from the backend directory:

```bash
PYTHONPATH=. pytest
```

If `pytest.ini` is configured with the project root on the Python path, the tests can also be run with:

```bash
pytest
```

## What is not currently covered

The current test suite does not comprehensively cover:

- Every FastAPI endpoint through integration tests
- Frontend component tests
- Browser/end-to-end tests
- Performance/load testing
- Failure scenarios involving corrupted CSV files
- Concurrent outreach updates

The core risk calculation and outreach state machine were prioritized because they contain the most important business logic.

---

# Data Handling

The assessment dataset is loaded from:

```text
data/customers.csv
```

The application converts `TotalCharges` to a numeric value and handles missing values safely.

The current outreach status is stored in memory.

This means outreach changes persist while the backend process is running but are reset when the server restarts.

This was a deliberate simplification for the assessment.

---

# Trade-offs and Shortcuts

Several areas were intentionally kept simple to focus on the core assessment requirements.

### CSV instead of a database

The provided dataset is static, so CSV was sufficient for the assessment.

A production application would use a database for customer data and transactional updates.

### In-memory outreach state

Outreach status is currently stored in memory rather than a database.

This keeps the implementation small but means changes are lost when the server restarts.

### Heuristic instead of ML model

No trained model was provided, so a transparent rule-based scoring system was implemented.

The scoring service is isolated so that a production ML service could replace it later.

### Simple frontend navigation

The application uses React state to switch between the customer list and customer detail views rather than introducing a routing library.

For the scope of this assessment, this keeps the frontend smaller and easier to understand.

### Synchronous CSV loading

The current dataset is small enough that synchronous CSV loading is acceptable for the assessment.

A production system would typically use a database and appropriate connection pooling/caching.

---

# With More Time

The following improvements would be considered for a production-oriented implementation:

1. **Database persistence**
   - Replace CSV storage with PostgreSQL or another production database.
   - Persist outreach status and outreach history.

2. **Outreach history**
   - Record who contacted the customer.
   - Record timestamps.
   - Record notes and outcomes.
   - Maintain an audit trail.

3. **Production ML integration**
   - Replace the heuristic with a versioned ML model service.
   - Store model version with each score.
   - Monitor model performance and drift.

4. **More comprehensive tests**
   - FastAPI integration tests.
   - Frontend component tests.
   - End-to-end browser tests.
   - API failure and timeout tests.

5. **Improved pagination**
   - Add richer pagination metadata.
   - Consider cursor-based pagination for very large datasets.

6. **Advanced filtering**
   - Outreach status
   - Payment method
   - Internet service
   - Tenure range
   - Monthly charge range

7. **Performance improvements**
   - Database indexes.
   - Caching.
   - Background processing for expensive scoring operations.
   - Async calls when integrating with external model or customer services.

8. **Authentication and authorization**
   - Authenticate retention agents.
   - Restrict customer data based on user permissions.
   - Add audit logging for sensitive actions.

9. **Observability**
   - Centralized logs.
   - Metrics.
   - Request tracing.
   - Monitoring and alerting.

10. **UI improvements**
    - Responsive design.
    - More detailed dashboard metrics.
    - Sorting.
    - Better accessibility.
    - Confirmation and feedback for important outreach actions.

---

# API Summary

| Method | Endpoint                            | Purpose                                 |
| ------ | ----------------------------------- | --------------------------------------- |
| GET    | `/customers/`                       | Paginated/filterable customer list      |
| GET    | `/customers/{customer_id}`          | Customer details and risk information   |
| PATCH  | `/customers/{customer_id}/outreach` | Update outreach status                  |
| GET    | `/model/info`                       | Current risk model rules and thresholds |

---

# Summary

The application turns customer churn scores into an operational workflow for a retention agent.

The main design principles are:

- Keep risk scoring transparent.
- Return only the data needed by each view.
- Keep business rules on the backend.
- Provide clear loading and error states.
- Validate API input and state transitions.
- Test the core business logic.
- Keep the architecture simple enough to extend into a production system.

The heuristic scoring implementation is intentionally a stand-in for a production model. The important architectural boundary is that the console can surface a score, explain its contributing factors, and allow a human agent to take an action regardless of whether the score comes from a heuristic or a future ML service.
