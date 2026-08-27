from sqlalchemy.orm import Session

from app.models.user import User

from app.services.skill_gap_service import (
    analyze_skill_gap
)

from app.services.recommendation_service import (
    generate_recommendations
)

from app.services.learning_path_service import (
    generate_learning_path
)


def build_learner_context(
    db: Session,
    user_id: int
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        return None

    # --------------------------------------------------------
    # Skill gaps
    # --------------------------------------------------------

    gap_result = analyze_skill_gap(
        db,
        user_id
    )

    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    recommendation_result = (
        generate_recommendations(
            db,
            user_id,
            limit=10
        )
    )

    # --------------------------------------------------------
    # Learning path
    # --------------------------------------------------------

    learning_path = generate_learning_path(
        db,
        user_id,
        weekly_hours=10,
        max_courses=10
    )

    return {

        "learner": {

            "id": user.id,

            "name": getattr(
                user,
                "name",
                None
            ),

            "goal": getattr(
                user,
                "goal",
                None
            ),

            "experience_level":
                getattr(
                    user,
                    "experience_level",
                    None
                )
        },

        "skill_gaps":
            gap_result,

        "recommendations":
            recommendation_result,

        "learning_path":
            learning_path
    }