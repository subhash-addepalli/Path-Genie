from sqlalchemy import String, DateTime, Integer, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class RoadmapProgress(Base):
    __tablename__ = "roadmap_progress"

    id               : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id          : Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal             : Mapped[str] = mapped_column(String(500), nullable=False)
    roadmap_data     : Mapped[str] = mapped_column(Text, nullable=False)       # full JSON
    current_phase    : Mapped[int] = mapped_column(Integer, default=1)         # 1, 2, 3
    completed_topics : Mapped[str] = mapped_column(Text, default="[]")         # JSON array
    status           : Mapped[str] = mapped_column(String(20), default="active")  # active | completed
    created_at       : Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at       : Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="roadmaps")
