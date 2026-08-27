from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models.progress import (
    LearningProgress
)

from app.models.feedback import (
    LearningFeedback
)
from app.services.ai_insights import (
    generate_learning_insight
)

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/{user_id}")
def get_learning_analytics(
    user_id: int,
    db: Session = Depends(get_db)
):

    progress_records = (
        db.query(LearningProgress)
        .filter(
            LearningProgress.user_id
            == user_id
        )
        .all()
    )


    feedback_records = (
        db.query(LearningFeedback)
        .filter(
            LearningFeedback.user_id
            == user_id
        )
        .all()
    )


    total_resources = len(
        progress_records
    )


    completed = sum(
        1
        for record in progress_records
        if record.progress_percentage >= 100
    )


    in_progress = sum(
        1
        for record in progress_records
        if (
            record.progress_percentage > 0
            and
            record.progress_percentage < 100
        )
    )


    average_progress = (
        sum(
            record.progress_percentage
            for record in progress_records
        )
        / total_resources
        if total_resources > 0
        else 0
    )


    feedback_summary = {}

    for feedback in feedback_records:

        feedback_type = (
            feedback.feedback_type
        )

        feedback_summary[
            feedback_type
        ] = (
            feedback_summary.get(
                feedback_type,
                0
            ) + 1
        )


    return {

        "user_id": user_id,

        "total_resources":
            total_resources,

        "completed":
            completed,

        "in_progress":
            in_progress,

        "average_progress":
            round(
                average_progress,
                2
            ),

        "completion_rate":
            round(
                (
                    completed /
                    total_resources
                    * 100
                )
                if total_resources
                else 0,
                2
            ),

        "feedback":
            feedback_summary

    }

@router.get("/{user_id}/insight")
def get_ai_learning_insight(
    user_id: int,
    db: Session = Depends(get_db)
):

    progress_records = (
        db.query(LearningProgress)
        .filter(
            LearningProgress.user_id
            == user_id
        )
        .all()
    )


    feedback_records = (
        db.query(LearningFeedback)
        .filter(
            LearningFeedback.user_id
            == user_id
        )
        .all()
    )


    total = len(
        progress_records
    )


    completed = sum(
        1
        for record in progress_records
        if record.progress_percentage >= 100
    )


    average_progress = (

        sum(
            record.progress_percentage
            for record in progress_records
        )
        / total

        if total > 0

        else 0

    )


    feedback = {}

    for record in feedback_records:

        feedback[
            record.feedback_type
        ] = (
            feedback.get(
                record.feedback_type,
                0
            ) + 1
        )


    analytics = {

        "total_resources":
            total,

        "completed":
            completed,

        "average_progress":
            round(
                average_progress,
                2
            ),

        "feedback":
            feedback

    }


    insight = generate_learning_insight(
        analytics
    )


    return {

        "user_id":
            user_id,

        "analytics":
            analytics,

        "insight":
            insight

    }