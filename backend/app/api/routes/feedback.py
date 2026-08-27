from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from pydantic import BaseModel

from app.core.database import get_db

from app.models.feedback import (
    LearningFeedback
)


router = APIRouter(
    prefix="/api/feedback",
    tags=["Feedback"]
)


class FeedbackRequest(BaseModel):

    user_id: int

    course_id: int

    feedback_type: str

    comment: str | None = None


# ============================================================
# SUBMIT FEEDBACK
# ============================================================

@router.post("")
def submit_feedback(
    request: FeedbackRequest,
    db: Session = Depends(get_db)
):

    feedback = LearningFeedback(

        user_id=request.user_id,

        course_id=request.course_id,

        feedback_type=request.feedback_type,

        comment=request.comment

    )

    db.add(feedback)

    db.commit()

    db.refresh(feedback)

    return {

        "message":
            "Feedback recorded",

        "feedback_id":
            feedback.id,

        "feedback_type":
            feedback.feedback_type

    }


# ============================================================
# GET USER FEEDBACK
# ============================================================

@router.get("/{user_id}")
def get_user_feedback(
    user_id: int,
    db: Session = Depends(get_db)
):

    records = (
        db.query(LearningFeedback)
        .filter(
            LearningFeedback.user_id == user_id
        )
        .order_by(
            LearningFeedback.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": record.id,

            "user_id":
                record.user_id,

            "course_id":
                record.course_id,

            "feedback_type":
                record.feedback_type,

            "comment":
                record.comment,

            "created_at":
                record.created_at
        }
        for record in records
    ]