from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app import models
from app.api.routes.users import router as users_router
from app.api.routes.courses import router as courses_router
from app.api.routes.profile import router as profile_router
from app.api.routes.skill_gap import router as skill_gap_router
from app.api.routes.progress import router as progress_router
from app.api.routes.feedback import router as feedback_router
from app.api.routes.recommendations import (
    router as recommendations_router
)
from app.api.routes.learning_path import (
    router as learning_path_router
)
from app.api.routes.chat import (
    router as chat_router
)
from app.api.users import router as users_router

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="LearnPath AI",
    description="AI-Powered Personalized Learning Path Recommender",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to LearnPath AI",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LearnPath AI Backend"
    }

app.include_router(users_router)
app.include_router(courses_router)
app.include_router(profile_router)
app.include_router(skill_gap_router)
app.include_router(
    recommendations_router
)

app.include_router(
    learning_path_router
)
app.include_router(
    chat_router
)
app.include_router(users_router)
app.include_router(progress_router)
app.include_router(feedback_router)