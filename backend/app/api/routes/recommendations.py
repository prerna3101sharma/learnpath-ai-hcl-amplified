from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.services.recommendation_service import (
    generate_recommendations
)


router = APIRouter(
    prefix="/api/recommendations",
    tags=["Recommendations"]
)


@router.get("/{user_id}")
def get_recommendations(
    user_id: int,

    limit: int = Query(
        default=10,
        ge=1,
        le=50
    ),

    db: Session = Depends(get_db)
):

    result = generate_recommendations(
        db,
        user_id,
        limit
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="Learner not found"
        )

    return result