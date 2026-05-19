from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload, selectinload

from backend.src.db.database import get_db
from backend.src.db import models
from backend.src.rag.rag_chat import chat_with_rag
from backend.src.utils.security import (
    sanitize_input, validate_string_length, validate_integer_id,
    check_rate_limit
)
from backend.src.utils.search_intelligence import filter_jobs_for_chat
from backend.src.config import settings
from groq import Groq


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/")
def chat(
    request: Request,
    user_id: Optional[int] = Query(None),
    message: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    # Security: Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"chat_{client_ip}", max_requests=20, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment before chatting again.")
    
    # Security: Input validation
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    message = sanitize_input(message, max_length=1000)
    if not validate_string_length(message, max_length=1000, min_length=1):
        raise HTTPException(status_code=400, detail="Invalid message length")
    
    if user_id and not validate_integer_id(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Get user profile and applications with eager loading
    user_profile = None
    user_applications = []
    try:
        if user_id:
            user = db.query(models.User)\
                .options(
                    selectinload(models.User.disabilities),
                    selectinload(models.User.skills)
                )\
                .filter(models.User.id == user_id).first()
            if user:
                # Get user's disabilities
                user_disabilities = [d.name for d in user.disabilities] if user.disabilities else []
                
                # Get user's applications with eager loading
                try:
                    applications = db.query(models.JobApplication)\
                        .options(
                            joinedload(models.JobApplication.job)
                        )\
                        .filter(
                            models.JobApplication.user_id == user_id
                        )\
                        .order_by(models.JobApplication.applied_at.desc())\
                        .limit(10)\
                        .all()
                except Exception as e:
                    print(f"Error loading applications: {e}")
                    applications = []
                
                applied_job_ids = [app.job_id for app in applications]
                applied_jobs_info = []
                for app in applications:
                    try:
                        if app.job:
                            applied_jobs_info.append({
                                "job_id": app.job_id,
                                "job_title": app.job.title,
                                "status": app.status,
                                "applied_at": app.applied_at.isoformat() if app.applied_at else None,
                            })
                    except Exception as e:
                        print(f"Error processing application {app.id}: {e}")
                        continue
                
                user_profile = {
                    "disabilities": user_disabilities,
                    "skills": [s.name for s in user.skills] if user.skills else [],
                    "location": user.location,
                    "preferred_job_type": user.preferred_job_type,
                    "applied_jobs": applied_jobs_info,
                    "applied_job_ids": applied_job_ids,
                }
    except Exception as e:
        print(f"Error loading user profile: {e}")
        user_profile = None
    
    # Get ALL jobs with eager loading to prevent N+1 queries
    try:
        all_jobs = db.query(models.Job)\
            .options(
                joinedload(models.Job.company),
                joinedload(models.Job.location),
                selectinload(models.Job.requirements),
                selectinload(models.Job.disabilities)
            )\
            .limit(50)\
            .all()
    except Exception as e:
        print(f"Error loading jobs: {e}")
        all_jobs = []
    
    jobs_data = []
    for job in all_jobs:
        try:
            requirements = [req.requirement for req in job.requirements] if job.requirements else []
            disability_support = [d.name for d in job.disabilities] if job.disabilities else []
            
            # Check if user has applied to this job
            has_applied = user_profile and job.id in user_profile.get("applied_job_ids", [])
            
            # Safely access location fields
            location_str = "Remote"
            if job.location:
                city = job.location.city or ""
                country = job.location.country or ""
                if city or country:
                    location_str = f"{city}, {country}".strip(", ")
            
            jobs_data.append({
                "id": job.id,
                "title": job.title or "Untitled",
                "description": job.description or "",
                "company": job.company.name if job.company else "Unknown",
                "location": location_str,
                "employment_type": job.employment_type or "full-time",
                "remote_type": job.remote_type or "remote",
                "requirements": requirements,
                "disability_support": disability_support,
                "has_applied": has_applied,
            })
        except Exception as e:
            print(f"Error processing job {job.id if job else 'unknown'}: {e}")
            continue
    
    # Intelligently filter jobs based on user message and profile
    # Prioritize jobs that match user's disabilities
    relevant_jobs = filter_jobs_for_chat(jobs_data, message, user_profile)
    
    # Use filtered jobs for chatbot
    answer = chat_with_rag(message, user_profile, relevant_jobs)
    return {"answer": answer}


@router.post("/speech-to-text")
async def speech_to_text(
    request: Request,
    file: UploadFile = File(...),
):
    """
    Convert uploaded speech audio to text using Groq Whisper.
    Expects a single audio file (e.g. webm/m4a) as multipart/form-data under field name 'file'.
    """
    # Rate limiting per IP for STT
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"chat_stt_{client_ip}", max_requests=20, window_seconds=60):
        raise HTTPException(
            status_code=429,
            detail="Too many speech requests. Please wait a moment and try again."
        )

    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured on the server.")

    # Basic content-type check (optional but helpful)
    if file.content_type and not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")

    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

        client = Groq(api_key=settings.GROQ_API_KEY)
        transcription = client.audio.transcriptions.create(
            file=(file.filename or "audio.webm", contents),
            model="whisper-large-v3-turbo",
            temperature=0,
            response_format="verbose_json",
        )

        # Groq Whisper returns an object with a .text attribute in verbose_json mode
        text = None
        if hasattr(transcription, "text"):
            text = transcription.text
        elif isinstance(transcription, dict):
            text = transcription.get("text")

        # Fallback: never fail hard just because text is empty
        if text is None:
            text = ""

        return {"text": text}
    except HTTPException:
        # Re-raise explicit HTTP errors
        raise
    except Exception as e:
        print(f"Groq STT error: {e}")
        raise HTTPException(status_code=500, detail="Error while processing audio. Please try again.")

