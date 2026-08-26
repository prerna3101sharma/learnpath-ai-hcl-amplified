from sqlalchemy import (
    Column,
    Integer,
    ForeignKey
)

from app.core.database import Base


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=False
    )

    proficiency = Column(
        Integer,
        nullable=False,
        default=1
    )