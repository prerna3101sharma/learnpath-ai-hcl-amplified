from sqlalchemy import (
    Column,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey
)

from app.core.database import Base


class LearningHistory(Base):
    __tablename__ = "learning_history"

    id = Column(
        Integer,
        primary_key=True
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

    progress = Column(
        Float,
        default=0
    )

    score = Column(
        Float,
        nullable=True
    )

    completed = Column(
        Boolean,
        default=False
    )

    started_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )