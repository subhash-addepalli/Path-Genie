from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routes.auth      import router as auth_router
from routes.courses   import router as courses_router
from routes.quiz      import router as quiz_router
from routes.roadmap   import router as roadmap_router
from routes.history   import router as history_router
from routes.bookmarks import router as bookmarks_router
from routes.projects  import router as projects_router
import os
from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("✅ PostgreSQL tables ready")
    yield
    print("👋 PathGenie shutting down")


app = FastAPI(
    title       = "PathGenie API",
    description = "AI-powered course finder, quiz generator, career roadmap and project recommender",
    version     = "5.0.0",
    lifespan    = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "http://localhost"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

app.include_router(auth_router,      prefix="/api/auth",       tags=["Authentication"])
app.include_router(courses_router,   prefix="/api/courses",    tags=["Courses"])
app.include_router(quiz_router,      prefix="/api/quiz",       tags=["Quiz"])
app.include_router(roadmap_router,   prefix="/api/roadmap",    tags=["Roadmap"])
app.include_router(history_router,   prefix="/api/progress",   tags=["Progress"])
app.include_router(bookmarks_router, prefix="/api/bookmarks",  tags=["Bookmarks"])
app.include_router(projects_router,  prefix="/api/projects",   tags=["Projects"])


@app.get("/")
def root():
    return {"message": "PathGenie API 🧞", "version": "5.0.0", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}
