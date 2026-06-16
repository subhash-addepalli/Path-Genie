from sqlalchemy import String, DateTime, Integer, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id          : Mapped[int]  = mapped_column(Integer, primary_key=True, autoincrement=True)
    name        : Mapped[str]  = mapped_column(String(100), nullable=False)
    email       : Mapped[str]  = mapped_column(String(255), unique=True, nullable=False, index=True)
    password    : Mapped[str]  = mapped_column(String(255), nullable=False)
    is_verified : Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    otp_code    : Mapped[str]  = mapped_column(String(6),   nullable=True)
    otp_expires : Mapped[str]  = mapped_column(DateTime(timezone=True), nullable=True)
    created_at  : Mapped[str]  = mapped_column(DateTime(timezone=True), server_default=func.now())

    quiz_history = relationship("QuizHistory",     back_populates="user", cascade="all, delete-orphan")
    bookmarks    = relationship("Bookmark",         back_populates="user", cascade="all, delete-orphan")
    roadmaps     = relationship("RoadmapProgress",  back_populates="user", cascade="all, delete-orphan")
