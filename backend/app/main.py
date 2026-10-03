from fastapi import FastAPI
from app.routes import customers, model
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Churn Risk API",
    version="1.0.0",
    description="API for predicting customer churn risk",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    customers.router,
    prefix="/customers",
    tags=["Customers"],
)

app.include_router(
    model.router,
    prefix="/model",
    tags=["Model"],
)


@app.get("/")
def root():
    return {"message": "Churn Risk API is running"}
