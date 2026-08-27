from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.progress import LearningProgress
from app.models.feedback import LearningFeedback
from app.models.course import Course


router = APIRouter(
    prefix="/api/adaptive",
    tags=["Adaptive Recommendations"]
)


@router.get("/{user_id}")
def get_adaptive_recommendations(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate adaptive learning recommendations
    based on learner progress and feedback.
    """

    # ---------------------------------------------------------
    # 1. Get learner progress
    # ---------------------------------------------------------

    progress_records = (
        db.query(LearningProgress)
        .filter(
            LearningProgress.user_id == user_id
        )
        .all()
    )

    # ---------------------------------------------------------
    # 2. Get learner feedback
    # ---------------------------------------------------------

    feedback_records = (
        db.query(LearningFeedback)
        .filter(
            LearningFeedback.user_id == user_id
        )
        .order_by(
            LearningFeedback.created_at.desc()
        )
        .all()
    )

    # ---------------------------------------------------------
    # 3. If learner has no learning history
    # ---------------------------------------------------------

    if not progress_records:
        return {
            "user_id": user_id,
            "adaptation_status": "No learning history",
            "message": (
                "Start your learning path to receive "
                "personalized adaptive recommendations."
            ),
            "recommendations": []
        }

    # ---------------------------------------------------------
    # 4. Calculate learning statistics
    # ---------------------------------------------------------

    total_courses = len(progress_records)

    completed_courses = sum(
        1
        for record in progress_records
        if float(
            record.progress_percentage or 0
        ) >= 100
    )

    average_progress = (
        sum(
            float(
                record.progress_percentage or 0
            )
            for record in progress_records
        )
        / total_courses
    )

    # ---------------------------------------------------------
    # 5. Analyse feedback
    # ---------------------------------------------------------

    feedback_counts = {
        "TOO_EASY": 0,
        "JUST_RIGHT": 0,
        "TOO_DIFFICULT": 0,
        "ALREADY_KNOW": 0,
        "NOT_RELEVANT": 0
    }

    for feedback in feedback_records:

        feedback_type = (
            feedback.feedback_type or ""
        ).upper()

        if feedback_type in feedback_counts:
            feedback_counts[feedback_type] += 1

    # ---------------------------------------------------------
    # 6. Determine learner adaptation state
    # ---------------------------------------------------------

    adaptation_status = "Balanced"

    if feedback_counts["TOO_DIFFICULT"] >= 2:

        adaptation_status = "Needs Support"

    elif feedback_counts["TOO_EASY"] >= 2:

        adaptation_status = "Needs Challenge"

    elif feedback_counts["NOT_RELEVANT"] >= 2:

        adaptation_status = "Needs Relevance"

    elif average_progress >= 80:

        adaptation_status = "Ready to Advance"

    # ---------------------------------------------------------
    # 7. Generate adaptive actions
    # ---------------------------------------------------------

    recommendations = []

    if adaptation_status == "Needs Support":

        recommendations.append({
            "type": "difficulty_adjustment",
            "priority": "HIGH",
            "title": "Reduce learning difficulty",
            "description": (
                "You have reported difficulty with multiple "
                "resources. Easier explanations and prerequisite "
                "content are recommended before moving forward."
            ),
            "action": "Review prerequisite concepts"
        })

        recommendations.append({
            "type": "revision",
            "priority": "HIGH",
            "title": "Strengthen weak concepts",
            "description": (
                "Spend additional time revising the concepts "
                "associated with difficult resources."
            ),
            "action": "Practice weak skills"
        })

    elif adaptation_status == "Needs Challenge":

        recommendations.append({
            "type": "difficulty_adjustment",
            "priority": "MEDIUM",
            "title": "Increase learning difficulty",
            "description": (
                "You found multiple resources too easy. "
                "More advanced resources and practical challenges "
                "are recommended."
            ),
            "action": "Move to advanced resources"
        })

        recommendations.append({
            "type": "project",
            "priority": "MEDIUM",
            "title": "Try a practical project",
            "description": (
                "Apply your current knowledge through a "
                "real-world project."
            ),
            "action": "Start an advanced project"
        })

    elif adaptation_status == "Needs Relevance":

        recommendations.append({
            "type": "content_filter",
            "priority": "HIGH",
            "title": "Improve resource relevance",
            "description": (
                "Several resources were marked as not relevant. "
                "Future recommendations should focus more closely "
                "on your learning goal."
            ),
            "action": "Prioritize goal-aligned resources"
        })

    elif adaptation_status == "Ready to Advance":

        recommendations.append({
            "type": "progression",
            "priority": "HIGH",
            "title": "Move to the next level",
            "description": (
                "Your current progress indicates that you are "
                "ready for more advanced learning material."
            ),
            "action": "Continue with advanced resources"
        })

        recommendations.append({
            "type": "project",
            "priority": "MEDIUM",
            "title": "Build a practical project",
            "description": (
                "Use your accumulated knowledge in a practical "
                "project to reinforce learning."
            ),
            "action": "Start a project"
        })

    else:

        recommendations.append({
            "type": "continue",
            "priority": "MEDIUM",
            "title": "Continue your current path",
            "description": (
                "Your learning progress is balanced. Continue "
                "following the recommended roadmap."
            ),
            "action": "Continue learning"
        })

    # ---------------------------------------------------------
    # 8. Get courses that need attention
    # ---------------------------------------------------------

    courses_needing_attention = []

    for record in progress_records:

        progress = float(
            record.progress_percentage or 0
        )

        if progress < 100:

            course = (
                db.query(Course)
                .filter(
                    Course.id == record.course_id
                )
                .first()
            )

            if course:

                courses_needing_attention.append({
                    "course_id": course.id,
                    "course_title": course.title,
                    "progress_percentage": progress,
                    "difficulty": course.difficulty,
                    "course_type": course.course_type
                })

    # ---------------------------------------------------------
    # 9. Return adaptive response
    # ---------------------------------------------------------

    return {
        "user_id": user_id,

        "adaptation_status":
            adaptation_status,

        "learning_statistics": {
            "total_courses":
                total_courses,

            "completed_courses":
                completed_courses,

            "average_progress":
                round(
                    average_progress,
                    2
                ),

            "feedback_summary":
                feedback_counts
        },

        "recommendations":
            recommendations,

        "courses_needing_attention":
            courses_needing_attention[:5]
    }