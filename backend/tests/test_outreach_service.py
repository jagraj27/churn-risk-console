import pytest
from fastapi import HTTPException

from app.models.outreach import OutreachStatus
from app.services.outreach_service import validate_transition


def test_not_contacted_to_in_progress():
    validate_transition(
        OutreachStatus.NOT_CONTACTED,
        OutreachStatus.IN_PROGRESS,
    )


def test_in_progress_to_resolved():
    validate_transition(
        OutreachStatus.IN_PROGRESS,
        OutreachStatus.RESOLVED,
    )


def test_not_contacted_cannot_go_directly_to_resolved():
    with pytest.raises(HTTPException):
        validate_transition(
            OutreachStatus.NOT_CONTACTED,
            OutreachStatus.RESOLVED,
        )


def test_in_progress_cannot_go_back_to_not_contacted():
    with pytest.raises(HTTPException):
        validate_transition(
            OutreachStatus.IN_PROGRESS,
            OutreachStatus.NOT_CONTACTED,
        )


def test_resolved_cannot_go_back_to_in_progress():
    with pytest.raises(HTTPException):
        validate_transition(
            OutreachStatus.RESOLVED,
            OutreachStatus.IN_PROGRESS,
        )


def test_resolved_cannot_go_back_to_not_contacted():
    with pytest.raises(HTTPException):
        validate_transition(
            OutreachStatus.RESOLVED,
            OutreachStatus.NOT_CONTACTED,
        )


def test_same_status_is_allowed():
    validate_transition(
        OutreachStatus.NOT_CONTACTED,
        OutreachStatus.NOT_CONTACTED,
    )

    validate_transition(
        OutreachStatus.IN_PROGRESS,
        OutreachStatus.IN_PROGRESS,
    )

    validate_transition(
        OutreachStatus.RESOLVED,
        OutreachStatus.RESOLVED,
    )
