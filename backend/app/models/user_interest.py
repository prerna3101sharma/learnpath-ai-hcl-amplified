from sqlalchemy import Column, Integer, String, ForeignKey

from app.core.database import Base


class UserInterest(Base):
    __tablename__ = "user_interests"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    interest = Column(
        String(100),
        nullable=False
    )