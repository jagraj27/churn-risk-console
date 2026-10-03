from fastapi import HTTPException

from app.models.outreach import OutreachStatus

VALID_TRANSITIONS = {
    OutreachStatus.NOT_CONTACTED: {
        OutreachStatus.NOT_CONTACTED,
        OutreachStatus.IN_PROGRESS,
    },
    OutreachStatus.IN_PROGRESS: {
        OutreachStatus.IN_PROGRESS,
        OutreachStatus.RESOLVED,
    },
    OutreachStatus.RESOLVED: {
        OutreachStatus.RESOLVED,
    },
}


def validate_transition(
    current_status: OutreachStatus,
    new_status: OutreachStatus,
):
    if current_status not in VALID_TRANSITIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid current outreach status: {current_status}",
        )

    if new_status is None:
        raise HTTPException(
            status_code=400,
            detail="New outreach status is required",
        )

    allowed_states = VALID_TRANSITIONS[current_status]

    if new_status not in allowed_states:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid outreach transition: "
                f"{current_status.value} -> {new_status.value}"
            ),
        )
