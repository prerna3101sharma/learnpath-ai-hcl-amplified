from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.post("/")
def create_user(
    name: str,
    email: str,
    experience_level: str = "Beginner",
    goal: str | None = None,
    weekly_hours: int | None = None,
    db: Session = Depends(get_db)
):
    user = User(
        name=name,
        email=email,
        experience_level=experience_level,
        goal=goal,
        weekly_hours=weekly_hours
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.get("")
def get_users(
    db: Session = Depends(get_db)
):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
        for user in users
    ]