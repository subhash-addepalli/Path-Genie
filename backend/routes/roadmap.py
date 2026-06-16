from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.roadmap_progress import RoadmapProgress
from models.user import User
from routes.auth import get_current_user
from pydantic import BaseModel
from groq import Groq
from typing import Optional
import os, json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL  = "llama-3.3-70b-versatile"


# ── AI Generation ─────────────────────────────────────────────────────────────

class RoadmapRequest(BaseModel):
    goal: str


@router.post("/generate")
async def generate_roadmap(req: RoadmapRequest):
    if not req.goal.strip():
        raise HTTPException(status_code=400, detail="Goal cannot be empty")

    prompt = f"""You are an expert career advisor for engineering and technology students.

Generate a detailed career roadmap for: "{req.goal}"

Return ONLY valid JSON. No markdown, no explanation, no code fences. Just raw JSON.

Format:
{{
  "title": "Career title e.g. Data Scientist",
  "summary": "2-3 sentence overview of this career path",
  "total_timeline": "e.g. 6-9 months",
  "avg_salary": "e.g. $90,000 - $130,000/year",
  "demand": "High | Medium | Low",
  "phases": [
    {{
      "phase": 1,
      "level": "Beginner",
      "duration": "0-2 months",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "description": "What you will learn in this phase."
    }},
    {{
      "phase": 2,
      "level": "Intermediate",
      "duration": "2-5 months",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "description": "What you will learn in this phase."
    }},
    {{
      "phase": 3,
      "level": "Advanced",
      "duration": "5-8 months",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "description": "What you will learn in this phase."
    }}
  ],
  "projects": [
    {{
      "name": "Project name",
      "description": "1 sentence description",
      "difficulty": "Beginner | Intermediate | Advanced",
      "tech_stack": ["Tech 1", "Tech 2"]
    }}
  ],
  "certifications": [
    {{
      "name": "Certification name",
      "provider": "Google | IBM | AWS | Microsoft | Coursera",
      "level": "Beginner | Intermediate | Advanced",
      "url": "https://..."
    }}
  ],
  "tools": ["Tool 1", "Tool 2", "Tool 3", "Tool 4", "Tool 5"],
  "job_roles": ["Role 1", "Role 2", "Role 3"]
}}

Rules:
- phases array must have exactly 3 items
- projects array must have 4 items
- certifications array must have 4 items
- tools array must have 5-8 items
- job_roles array must have 3-5 items

Return the JSON now:"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an expert career advisor. Always respond with valid JSON only."},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3000,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.rstrip("```").strip()

        roadmap = json.loads(raw)
        return {"roadmap": roadmap, "goal": req.goal}

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid data. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


# ── Bookmark / Save Roadmap ───────────────────────────────────────────────────

class SaveRoadmapRequest(BaseModel):
    goal        : str
    roadmap_data: dict


@router.post("/save")
async def save_roadmap(
    req: SaveRoadmapRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if already saved
    result = await db.execute(
        select(RoadmapProgress).where(
            RoadmapProgress.user_id == current_user.id,
            RoadmapProgress.goal    == req.goal
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Roadmap already saved")

    roadmap = RoadmapProgress(
        user_id          = current_user.id,
        goal             = req.goal,
        roadmap_data     = json.dumps(req.roadmap_data),
        current_phase    = 1,
        completed_topics = "[]",
        status           = "active",
    )
    db.add(roadmap)
    await db.commit()
    await db.refresh(roadmap)
    return {"message": "Roadmap saved!", "id": roadmap.id}


@router.get("/my-roadmaps")
async def get_my_roadmaps(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(RoadmapProgress)
        .where(RoadmapProgress.user_id == current_user.id)
        .order_by(RoadmapProgress.created_at.desc())
    )
    roadmaps = result.scalars().all()
    return {
        "roadmaps": [
            {
                "id":               r.id,
                "goal":             r.goal,
                "roadmap_data":     json.loads(r.roadmap_data),
                "current_phase":    r.current_phase,
                "completed_topics": json.loads(r.completed_topics),
                "status":           r.status,
                "created_at":       r.created_at.isoformat(),
            }
            for r in roadmaps
        ]
    }


class UpdateProgressRequest(BaseModel):
    current_phase    : Optional[int]  = None
    completed_topics : Optional[list] = None
    status           : Optional[str]  = None


@router.put("/update-progress/{roadmap_id}")
async def update_progress(
    roadmap_id: int,
    req: UpdateProgressRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(RoadmapProgress).where(
            RoadmapProgress.id      == roadmap_id,
            RoadmapProgress.user_id == current_user.id
        )
    )
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    if req.current_phase    is not None: roadmap.current_phase    = req.current_phase
    if req.completed_topics is not None: roadmap.completed_topics = json.dumps(req.completed_topics)
    if req.status           is not None: roadmap.status           = req.status

    await db.commit()
    return {"message": "Progress updated"}


@router.delete("/delete/{roadmap_id}")
async def delete_roadmap(
    roadmap_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(RoadmapProgress).where(
            RoadmapProgress.id      == roadmap_id,
            RoadmapProgress.user_id == current_user.id
        )
    )
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    await db.delete(roadmap)
    await db.commit()
    return {"message": "Roadmap deleted"}
