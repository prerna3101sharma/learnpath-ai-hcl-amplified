from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.services.learning_path_service import (
    generate_learning_path
)


router = APIRouter(
    prefix="/api/learning-path",
    tags=["Learning Path"]
)


@router.get("/{user_id}")
def get_learning_path(
    user_id: int,

    weekly_hours: int = Query(
        default=10,
        ge=1,
        le=40
    ),

    max_courses: int = Query(
        default=10,
        ge=1,
        le=30
    ),

    db: Session = Depends(get_db)
):

    result = generate_learning_path(
        db=db,
        user_id=user_id,
        weekly_hours=weekly_hours,
        max_courses=max_courses
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Learner not found"
        )

    return result