from fastapi import APIRouter

from app.models.model import ModelInfo
from app.services.risk_service import SCORING_RULES

router = APIRouter()


@router.get("/info", response_model=ModelInfo)
def get_model_info():
    return {
        "model_version": "heuristic-v1",
        "model_type": "heuristic",
        "description": "Rule-based churn risk scoring used as a stand-in for a production ML model.",
        "risk_thresholds": {"LOW": "0-29", "MEDIUM": "30-59", "HIGH": "60-100"},
        "scoring_rules": SCORING_RULES,
    }
