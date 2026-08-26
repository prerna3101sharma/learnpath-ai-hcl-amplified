from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app import models
from app.api.routes.users import router as users_router
from app.api.routes.courses import router as courses_router

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