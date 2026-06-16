from pydantic import BaseModel, EmailStr
from typing import Optional, List


# ── Auth ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    name: str
    email: str

class UserOut(BaseModel):
    name: str
    email: str


# ── Courses ───────────────────────────────────────────────────────────────────

class CourseSearchRequest(BaseModel):
    prompt: str
    mode: str = "both"   # free | paid | both

class Course(BaseModel):
    title: str
    platform: str
    instructor: Optional[str] = ""
    duration: Optional[str] = ""
    level: Optional[str] = "Beginner"
    price: Optional[str] = "Free"
    rating: Optional[float] = 0.0
    url: str
    description: str
    tags: Optional[List[str]] = []
    mode: str = "free"

class CourseSearchResponse(BaseModel):
    courses: List[Course]
    query: str
    mode: str


# ── Quiz ──────────────────────────────────────────────────────────────────────

class QuizGenerateRequest(BaseModel):
    topic: str
    difficulty: str = "medium"    # easy | medium | hard
    num_questions: int = 10

class QuizOption(BaseModel):
    A: str
    B: str
    C: str
    D: str

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: QuizOption

class QuizQuestionFull(QuizQuestion):
    correct_answer: str
    explanation: str

class QuizGenerateResponse(BaseModel):
    quiz_id: str
    title: str
    topic: str
    difficulty: str
    time_limit: int
    questions: List[QuizQuestion]
    _answers: List[QuizQuestionFull] = []

class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: dict
    questions: List[dict]

class QuizResult(BaseModel):
    id: int
    question: str
    user_answer: str
    correct_answer: str
    explanation: str
    is_correct: bool

class QuizSubmitResponse(BaseModel):
    score: int
    total: int
    percentage: int
    grade: str
    results: List[QuizResult]
