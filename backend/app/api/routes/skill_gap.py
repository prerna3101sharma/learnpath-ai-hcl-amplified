from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.services.skill_gap_service import (
    analyze_skill_gap
)

from app.ai.goal_parser import extract_target_skills

router = APIRouter(
    prefix="/api/skill-gap",
    tags=["Skill Gap Analysis"]
)


@router.get("/{user_id}")
def get_skill_gap(
    user_id: int,
    db: Session = Depends(get_db)
):

    result = analyze_skill_gap(
        db,
        user_id
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Learner not found"
        )

    return result

@router.get("/goal/{user_id}")
def analyze_goal(
    user_id: int,
    db: Session = Depends(get_db)
):

    from app.models.user import User

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Learner not found"
        )

    target_skills = extract_target_skills(
        user.goal
    )

    return {
        "user_id": user.id,
        "goal": user.goal,
        "target_skills": target_skills
    }