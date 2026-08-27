from sqlalchemy.orm import Session

from app.models.progress import LearningProgress

from app.models.feedback import LearningFeedback


def calculate_adaptive_score(
    current_score: float,
    feedback: str | None
) -> float:

    score = current_score

    if feedback == "TOO_EASY":
        score += 0.20

    elif feedback == "TOO_DIFFICULT":
        score -= 0.20

    elif feedback == "ALREADY_KNOW":
        score += 0.30

    elif feedback == "NOT_RELEVANT":
        score -= 0.50

    elif feedback == "JUST_RIGHT":
        score += 0.05

    return max(
        0,
        min(score, 1)
    )


def get_learning_adjustment(
    db: Session,
    user_id: int,
    course_id: int
):

    progress = (
        db.query(
            LearningProgress
        )
        .filter(
            LearningProgress.user_id
            == user_id,

            LearningProgress.course_id
            == course_id
        )
        .first()
    )


    feedback = (
        db.query(
            LearningFeedback
        )
        .filter(
            LearningFeedback.user_id
            == user_id,

            LearningFeedback.course_id
            == course_id
        )
        .order_by(
            LearningFeedback.created_at.desc()
        )
        .first()
    )


    progress_score = (
        progress.progress_percentage / 100
        if progress
        else 0
    )


    feedback_type = (
        feedback.feedback_type
        if feedback
        else None
    )


    adaptive_score = (
        calculate_adaptive_score(
            progress_score,
            feedback_type
        )
    )


    return {

        "progress": progress_score,

        "feedback":
            feedback_type,

        "adaptive_score":
            adaptive_score

    }