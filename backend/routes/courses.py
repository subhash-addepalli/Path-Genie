from fastapi import APIRouter, HTTPException
from schemas import CourseSearchRequest, CourseSearchResponse
from groq import Groq
import os, json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL  = "llama-3.3-70b-versatile"


@router.post("/search", response_model=CourseSearchResponse)
async def search_courses(req: CourseSearchRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    mode_instruction = {
        "free": "Only suggest FREE courses (YouTube, Coursera audit, Khan Academy, freeCodeCamp, MIT OpenCourseWare, NPTEL, etc.).",
        "paid": "Only suggest PAID courses (Udemy, Coursera certificates, Pluralsight, LinkedIn Learning, etc.).",
        "both": "Suggest a mix of both FREE and PAID courses from various platforms.",
    }.get(req.mode, "Suggest both free and paid courses.")

    prompt = f"""You are an expert educational advisor for engineering and degree students.

Find 6 highly relevant online courses for: "{req.prompt}"

{mode_instruction}

Return ONLY a valid JSON array. No markdown, no explanation, no code fences. Just raw JSON.

Each object must have exactly these fields:
- title (string)
- platform (string: e.g. Udemy, Coursera, YouTube, NPTEL, Khan Academy)
- instructor (string)
- duration (string: e.g. "20 hours", "6 weeks")
- level (string: Beginner | Intermediate | Advanced)
- price (string: "Free" or e.g. "$12.99")
- rating (number: 0.0 to 5.0)
- url (string: real valid URL)
- description (string: 1-2 sentences)
- tags (array of strings: 3-5 tags)
- mode (string: "free" or "paid")

Example of ONE object:
{{"title":"Python for Everybody","platform":"Coursera","instructor":"Dr. Chuck","duration":"8 weeks","level":"Beginner","price":"Free","rating":4.8,"url":"https://www.coursera.org/specializations/python","description":"Learn Python programming from scratch with hands-on projects.","tags":["python","programming","beginner"],"mode":"free"}}

Return the array of 6 such objects now:"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an expert educational advisor. Always respond with valid JSON only, no markdown, no explanation."},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
        )

        raw = response.choices[0].message.content.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.rstrip("```").strip()

        courses = json.loads(raw)
        return CourseSearchResponse(courses=courses, query=req.prompt, mode=req.mode)

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid data. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
