from sqlalchemy import String, DateTime, Float, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id          : Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id     : Mapped[int]   = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title       : Mapped[str]   = mapped_column(String(500), nullable=False)
    platform    : Mapped[str]   = mapped_column(String(100), nullable=False)
    url         : Mapped[str]   = mapped_column(String(1000), nullable=False)
    price       : Mapped[str]   = mapped_column(String(50),  nullable=True)
    level       : Mapped[str]   = mapped_column(String(50),  nullable=True)
    rating      : Mapped[float] = mapped_column(Float,       nullable=True)
    description : Mapped[str]   = mapped_column(String(1000),nullable=True)
    mode        : Mapped[str]   = mapped_column(String(10),  nullable=True)
    instructor  : Mapped[str]   = mapped_column(String(200), nullable=True)
    created_at  : Mapped[str]   = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="bookmarks")
