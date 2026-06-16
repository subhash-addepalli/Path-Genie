from sqlalchemy import String, DateTime, Integer, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class QuizHistory(Base):
    __tablename__ = "quiz_history"

    id         : Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id    : Mapped[int]   = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    topic      : Mapped[str]   = mapped_column(String(255), nullable=False)
    difficulty : Mapped[str]   = mapped_column(String(20),  nullable=False)
    score      : Mapped[int]   = mapped_column(Integer,     nullable=False)
    total      : Mapped[int]   = mapped_column(Integer,     nullable=False)
    percentage : Mapped[int]   = mapped_column(Integer,     nullable=False)
    grade      : Mapped[str]   = mapped_column(String(2),   nullable=False)
    created_at : Mapped[str]   = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="quiz_history")

    def __repr__(self):
        return f"<QuizHistory user={self.user_id} topic={self.topic} grade={self.grade}>"
