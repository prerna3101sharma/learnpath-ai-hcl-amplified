from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


# =========================================================
# Request schema
# =========================================================

class UserCreate(BaseModel):

    name: str
    email: EmailStr
    experience_level: str = "Beginner"
    goal: str | None = None
    weekly_hours: int | None = None


# =========================================================
# GET ALL LEARNERS
# =========================================================

@router.get("/")
def get_users(
    db: Session = Depends(get_db)
):

    users = (
        db.query(User)
        .order_by(User.id.asc())
        .all()
    )

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "experience_level": user.experience_level,
            "goal": user.goal,
            "weekly_hours": user.weekly_hours,
        }
        for user in users
    ]


# =========================================================
# GET SINGLE LEARNER
# =========================================================

@router.get("/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):

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

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "experience_level": user.experience_level,
        "goal": user.goal,
        "weekly_hours": user.weekly_hours,
    }


# =========================================================
# CREATE NEW LEARNER
# =========================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):

    # Check duplicate email

    existing_user = (
        db.query(User)
        .filter(
            User.email == user_data.email
        )
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=409,
            detail="A learner with this email already exists."
        )


    # Validate name

    if not user_data.name.strip():

        raise HTTPException(
            status_code=400,
            detail="Name is required."
        )


    # Validate weekly hours

    if (
        user_data.weekly_hours is not None
        and user_data.weekly_hours <= 0
    ):

        raise HTTPException(
            status_code=400,
            detail="Weekly hours must be greater than 0."
        )


    # Create user

    user = User(

        name=user_data.name.strip(),

        email=str(
            user_data.email
        ).lower(),

        experience_level=(
            user_data.experience_level
            or "Beginner"
        ),

        goal=(
            user_data.goal.strip()
            if user_data.goal
            else None
        ),

        weekly_hours=(
            user_data.weekly_hours
        )
    )


    db.add(user)

    db.commit()

    db.refresh(user)


    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "experience_level": user.experience_level,
        "goal": user.goal,
        "weekly_hours": user.weekly_hours,
        "message": "Learner created successfully"
    }