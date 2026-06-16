from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models.quiz_history import QuizHistory
from models.user import User
from routes.auth import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SaveQuizRequest(BaseModel):
    topic: str
    difficulty: str
    score: int
    total: int
    percentage: int
    grade: str


@router.post("/quiz/save")
async def save_quiz(
    req: SaveQuizRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = QuizHistory(
        user_id    = current_user.id,
        topic      = req.topic,
        difficulty = req.difficulty,
        score      = req.score,
        total      = req.total,
        percentage = req.percentage,
        grade      = req.grade,
    )
    db.add(history)
    await db.commit()
    await db.refresh(history)
    return {"message": "Quiz saved successfully", "id": history.id}


@router.get("/quiz/history")
async def get_quiz_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(QuizHistory)
        .where(QuizHistory.user_id == current_user.id)
        .order_by(QuizHistory.created_at.desc())
        .limit(50)
    )
    history = result.scalars().all()

    return {
        "history": [
            {
                "id":         h.id,
                "topic":      h.topic,
                "difficulty": h.difficulty,
                "score":      h.score,
                "total":      h.total,
                "percentage": h.percentage,
                "grade":      h.grade,
                "created_at": h.created_at.isoformat(),
            }
            for h in history
        ]
    }


@router.get("/quiz/stats")
async def get_quiz_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(QuizHistory).where(QuizHistory.user_id == current_user.id)
    )
    history = result.scalars().all()

    if not history:
        return {
            "total_quizzes":  0,
            "avg_percentage": 0,
            "best_grade":     "N/A",
            "avg_score":      0,
            "strong_topics":  [],
            "weak_topics":    [],
            "grade_counts":   {},
            "recent":         [],
        }

    total       = len(history)
    avg_pct     = round(sum(h.percentage for h in history) / total)
    avg_score   = round(sum(h.score / h.total * 100 for h in history) / total)

    # Grade distribution
    grade_counts = {}
    for h in history:
        grade_counts[h.grade] = grade_counts.get(h.grade, 0) + 1

    # Best grade
    grade_order = ["A", "B", "C", "D", "F"]
    best_grade  = next((g for g in grade_order if g in grade_counts), "F")

    # Strong topics (avg >= 75%)
    topic_scores = {}
    for h in history:
        if h.topic not in topic_scores:
            topic_scores[h.topic] = []
        topic_scores[h.topic].append(h.percentage)

    strong_topics = [t for t, scores in topic_scores.items() if sum(scores)/len(scores) >= 75]
    weak_topics   = [t for t, scores in topic_scores.items() if sum(scores)/len(scores) < 50]

    # Recent 5
    recent = sorted(history, key=lambda h: h.created_at, reverse=True)[:5]

    return {
        "total_quizzes":  total,
        "avg_percentage": avg_pct,
        "best_grade":     best_grade,
        "avg_score":      avg_score,
        "strong_topics":  strong_topics[:5],
        "weak_topics":    weak_topics[:5],
        "grade_counts":   grade_counts,
        "recent": [
            {
                "topic":      h.topic,
                "grade":      h.grade,
                "percentage": h.percentage,
                "created_at": h.created_at.isoformat(),
            }
            for h in recent
        ],
    }
