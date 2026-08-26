from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.learner_profile import (
    LearnerProfileCreate
)

from app.services.profile_service import (
    create_learner_profile,
    get_learner_profile,
    generate_profile_summary
)


router = APIRouter(
    prefix="/api/profile",
    tags=["Learner Profile"]
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
def create_profile(
    profile: LearnerProfileCreate,
    db: Session = Depends(get_db)
):

    try:
        user = create_learner_profile(
            db,
            profile
        )

        return {
            "message": "Learner profile created successfully",
            "user_id": user.id
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get("/{user_id}")
def get_profile(
    user_id: int,
    db: Session = Depends(get_db)
):

    profile = get_learner_profile(
        db,
        user_id
    )

    if profile is None:

        raise HTTPException(
            status_code=404,
            detail="Learner profile not found"
        )

    return profile

@router.get("/{user_id}/summary")
def get_profile_summary(
    user_id: int,
    db: Session = Depends(get_db)
):

    summary = generate_profile_summary(
        db,
        user_id
    )

    if summary is None:

        raise HTTPException(
            status_code=404,
            detail="Learner profile not found"
        )

    return summary