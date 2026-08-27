from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    ForeignKey
)

from datetime import datetime

from app.core.database import Base


class LearningProgress(Base):

    __tablename__ = "learning_progress"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    progress_percentage = Column(
        Float,
        default=0
    )

    status = Column(
        String,
        default="Not Started"
    )

    feedback = Column(
        String,
        nullable=True
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )