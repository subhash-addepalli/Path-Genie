from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
import os, json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL  = "llama-3.3-70b-versatile"


class ProjectRequest(BaseModel):
    goal: str  # e.g. "Data Scientist" or "I want to become a Full Stack Developer"


@router.post("/recommend")
async def recommend_projects(req: ProjectRequest):
    if not req.goal.strip():
        raise HTTPException(status_code=400, detail="Goal cannot be empty")

    prompt = f"""You are an expert project advisor for engineering and technology students.

Suggest exactly 9 hands-on projects for someone who wants to become: "{req.goal}"

Return ONLY valid JSON. No markdown, no explanation, no code fences. Just raw JSON.

Format:
{{
  "title": "Career role title e.g. Data Scientist",
  "goal": "{req.goal}",
  "projects": [
    {{
      "id": 1,
      "name": "Project name",
      "difficulty": "Beginner",
      "duration": "1-2 weeks",
      "description": "2-3 sentence description of what this project does.",
      "tech_stack": ["Tech1", "Tech2", "Tech3"],
      "what_you_learn": ["Skill 1", "Skill 2", "Skill 3"],
      "why_it_helps": "1 sentence explaining why this project is valuable for this role.",
      "github_search": "search query to find this project on GitHub"
    }}
  ]
}}

Rules:
- Return EXACTLY 9 projects
- First 3 projects must have difficulty "Beginner"
- Next 3 projects must have difficulty "Intermediate"
- Last 3 projects must have difficulty "Advanced"
- Each project must be unique and practical
- tech_stack must have 3-5 items
- what_you_learn must have 3-4 items
- Projects must be directly relevant to "{req.goal}"
- duration format: "1-2 weeks", "2-3 weeks", "1 month", etc.

Return the JSON now:"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an expert project advisor. Always respond with valid JSON only, no markdown, no explanation."},
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

        data = json.loads(raw)
        return data

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid data. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
