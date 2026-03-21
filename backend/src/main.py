from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.src.db.database import engine, Base
from backend.src.routes import jobs, users, chat, applications, disabilities, tools, security, companies
from sqlalchemy.exc import OperationalError
import os

try:
    Base.metadata.create_all(bind=engine)
except OperationalError as e:
    print(f"\n⚠️  Warning: Could not create database tables: {e}")
    print("   The application will start, but database operations may fail.")
    print("   Please check your database connection settings.\n")

app = FastAPI(title="EmpowerWork - Job Assistance System")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Security Middleware (optional - uncomment to enable automatic threat detection)
# from backend.src.middleware.security_middleware import SecurityMiddleware
# app.add_middleware(SecurityMiddleware)

# Include routers
app.include_router(jobs.router)
app.include_router(users.router)
app.include_router(chat.router)
app.include_router(applications.router)
app.include_router(disabilities.router)
app.include_router(tools.router)
app.include_router(security.router)
app.include_router(companies.router)

# Serve static files (profile photos and CVs)
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok", "message": "EmpowerWork API is running"}


@app.get("/")
def root():
    return {
        "message": "EmpowerWork API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
