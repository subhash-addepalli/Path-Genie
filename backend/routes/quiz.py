from fastapi import APIRouter, HTTPException
from schemas import QuizGenerateRequest, QuizSubmitRequest, QuizSubmitResponse
from groq import Groq
import os, json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL  = "llama-3.3-70b-versatile"


@router.post("/generate")
async def generate_quiz(req: QuizGenerateRequest):
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    if not (5 <= req.num_questions <= 20):
        raise HTTPException(status_code=400, detail="Questions must be between 5 and 20")

    prompt = f"""You are an expert quiz generator for engineering and degree students.

Generate a {req.difficulty} difficulty quiz on: "{req.topic}"
Number of questions: {req.num_questions}

Return ONLY valid JSON. No markdown, no explanation, no code fences.

Format:
{{
  "title": "Quiz title here",
  "topic": "{req.topic}",
  "difficulty": "{req.difficulty}",
  "time_limit": {req.num_questions * 90},
  "questions": [
    {{
      "id": 0,
      "question": "Question text here?",
      "options": {{
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      }},
      "correct_answer": "A",
      "explanation": "Explanation of why A is correct."
    }}
  ]
}}

Rules:
- id must start at 0 and increment
- correct_answer must be exactly "A", "B", "C", or "D"
- All {req.num_questions} questions must be unique and relevant to {req.topic}
- For {req.difficulty} level: {"use basic conceptual questions" if req.difficulty == "easy" else "use application and analysis questions" if req.difficulty == "medium" else "use advanced problem-solving questions"}

Return the JSON now:"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an expert quiz generator. Always respond with valid JSON only, no markdown, no explanation."},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000,
        )

        raw = response.choices[0].message.content.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.rstrip("```").strip()

        quiz_data = json.loads(raw)

        safe_questions = []
        full_questions = []

        for q in quiz_data["questions"]:
            safe_questions.append({
                "id":       q["id"],
                "question": q["question"],
                "options":  q["options"],
            })
            full_questions.append({
                "id":             q["id"],
                "question":       q["question"],
                "options":        q["options"],
                "correct_answer": q["correct_answer"],
                "explanation":    q.get("explanation", ""),
            })

        return {
            "quiz_id":    f"cg_{req.topic[:12].replace(' ','_')}_{req.difficulty}",
            "title":      quiz_data.get("title", f"{req.topic} Quiz"),
            "topic":      quiz_data.get("topic", req.topic),
            "difficulty": quiz_data.get("difficulty", req.difficulty),
            "time_limit": quiz_data.get("time_limit", req.num_questions * 90),
            "questions":  safe_questions,
            "_answers":   full_questions,
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid quiz data. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@router.post("/submit", response_model=QuizSubmitResponse)
async def submit_quiz(req: QuizSubmitRequest):
    correct = 0
    results = []

    for q in req.questions:
        qid      = str(q["id"])
        user_ans = req.answers.get(qid, "")
        is_right = user_ans == q.get("correct_answer", "")
        if is_right:
            correct += 1
        results.append({
            "id":             q["id"],
            "question":       q["question"],
            "user_answer":    user_ans,
            "correct_answer": q.get("correct_answer", ""),
            "explanation":    q.get("explanation", ""),
            "is_correct":     is_right,
        })

    total = len(req.questions)
    pct   = round((correct / total) * 100) if total > 0 else 0
    grade = "A" if pct >= 90 else "B" if pct >= 75 else "C" if pct >= 60 else "D" if pct >= 50 else "F"

    return QuizSubmitResponse(
        score=correct, total=total, percentage=pct, grade=grade, results=results
    )
