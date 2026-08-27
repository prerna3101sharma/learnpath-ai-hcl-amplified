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


@router.post("")
def submit_feedback(
    request: FeedbackRequest,
    db: Session = Depends(get_db)
):

    feedback = LearningFeedback(

        user_id=request.user_id,

        course_id=request.course_id,

        feedback_type=
            request.feedback_type,

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