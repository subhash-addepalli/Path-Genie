from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from database import get_db
from models.bookmark import Bookmark
from models.user import User
from routes.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class BookmarkRequest(BaseModel):
    title      : str
    platform   : str
    url        : str
    price      : Optional[str] = "Free"
    level      : Optional[str] = "Beginner"
    rating     : Optional[float] = 0.0
    description: Optional[str] = ""
    mode       : Optional[str] = "free"
    instructor : Optional[str] = ""


@router.post("/add")
async def add_bookmark(
    req: BookmarkRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if already bookmarked
    result = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == current_user.id,
            Bookmark.url     == req.url
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Course already bookmarked")

    bookmark = Bookmark(
        user_id     = current_user.id,
        title       = req.title,
        platform    = req.platform,
        url         = req.url,
        price       = req.price,
        level       = req.level,
        rating      = req.rating,
        description = req.description,
        mode        = req.mode,
        instructor  = req.instructor,
    )
    db.add(bookmark)
    await db.commit()
    await db.refresh(bookmark)
    return {"message": "Course bookmarked!", "id": bookmark.id}


@router.delete("/remove/{bookmark_id}")
async def remove_bookmark(
    bookmark_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Bookmark).where(
            Bookmark.id      == bookmark_id,
            Bookmark.user_id == current_user.id
        )
    )
    bookmark = result.scalar_one_or_none()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    await db.delete(bookmark)
    await db.commit()
    return {"message": "Bookmark removed"}


@router.get("/list")
async def list_bookmarks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Bookmark)
        .where(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
    )
    bookmarks = result.scalars().all()
    return {
        "bookmarks": [
            {
                "id":          b.id,
                "title":       b.title,
                "platform":    b.platform,
                "url":         b.url,
                "price":       b.price,
                "level":       b.level,
                "rating":      b.rating,
                "description": b.description,
                "mode":        b.mode,
                "instructor":  b.instructor,
                "created_at":  b.created_at.isoformat(),
            }
            for b in bookmarks
        ]
    }


@router.get("/ids")
async def get_bookmarked_ids(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns list of bookmarked URLs for the current user — used to show filled star on course cards."""
    result = await db.execute(
        select(Bookmark.url, Bookmark.id).where(Bookmark.user_id == current_user.id)
    )
    rows = result.all()
    return {"bookmarked": {row.url: row.id for row in rows}}
