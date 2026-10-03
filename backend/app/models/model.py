from pydantic import BaseModel


class ScoringRule(BaseModel):
    factor: str
    weight: int
    description: str


class ModelInfo(BaseModel):
    model_version: str
    model_type: str
    description: str
    risk_thresholds: dict[str, str]
    scoring_rules: list[ScoringRule]
