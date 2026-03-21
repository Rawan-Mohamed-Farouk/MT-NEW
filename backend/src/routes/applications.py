"""
Job application routes with CV upload and admin approval
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session, joinedload
from pathlib import Path
import os
import shutil
import json
from datetime import datetime

from backend.src.db.database import get_db
from backend.src.db import models
from backend.src.utils.pdf_extractor import extract_cv_info
from backend.src.utils.security import (
    sanitize_input, validate_integer_id, validate_string_length,
    check_rate_limit
)

router = APIRouter(prefix="/applications", tags=["applications"])

# Create uploads directory for CVs
CV_UPLOAD_DIR = Path("uploads/cvs")
CV_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/apply_manual")
async def apply_for_job_manual(
    request: Request,
    job_id: int = Form(...),
    user_id: int = Form(...),
    cover_letter: Optional[str] = Form(None),
    manual_info: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Apply for a job with manual entry (no CV upload)
    """
    # Security: Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"apply_{client_ip}", max_requests=10, window_seconds=300):
        raise HTTPException(status_code=429, detail="Too many applications. Please try again later.")
    
    # Validation
    if not validate_integer_id(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    
    if not validate_integer_id(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Check if job exists
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already applied
    existing = db.query(models.JobApplication).filter(
        models.JobApplication.job_id == job_id,
        models.JobApplication.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")
    
    # Parse manual info
    import json
    extracted_info = {}
    if manual_info:
        try:
            extracted_info = json.loads(manual_info)
        except:
            extracted_info = {"manual_entry": True}
    else:
        extracted_info = {"manual_entry": True}
    
    # Sanitize cover letter
    cover_letter_clean = sanitize_input(cover_letter, max_length=2000) if cover_letter else None
    
    # Serialize extracted_info to JSON string if it's a dict
    cv_extracted_info_str = json.dumps(extracted_info) if extracted_info and isinstance(extracted_info, dict) else None
    
    # Create application
    application = models.JobApplication(
        job_id=job_id,
        user_id=user_id,
        cover_letter=cover_letter_clean,
        cv_file_path=None,  # No CV file
        cv_extracted_info=cv_extracted_info_str,
        status="pending"
    )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return {
        "application_id": application.id,
        "status": application.status,
        "message": "Application submitted successfully. Waiting for admin approval.",
        "extracted_info": extracted_info
    }


@router.post("/apply")
async def apply_for_job(
    request: Request,
    job_id: int = Form(...),
    user_id: int = Form(...),
    cover_letter: Optional[str] = Form(None),
    cv: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Apply for a job with CV upload
    Application status starts as 'pending' waiting for admin approval
    """
    # Security: Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"apply_{client_ip}", max_requests=10, window_seconds=300):
        raise HTTPException(status_code=429, detail="Too many applications. Please try again later.")
    
    # Validation
    if not validate_integer_id(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    
    if not validate_integer_id(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Check if job exists
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already applied
    existing = db.query(models.JobApplication).filter(
        models.JobApplication.job_id == job_id,
        models.JobApplication.user_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")
    
    # Validate CV file
    if not cv.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="CV must be a PDF file")
    
    if cv.size > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="CV file too large (max 5MB)")
    
    # Save CV file
    safe_filename = f"{user_id}_{job_id}_{int(datetime.utcnow().timestamp())}.pdf"
    cv_path = CV_UPLOAD_DIR / safe_filename
    
    with open(cv_path, "wb") as buffer:
        shutil.copyfileobj(cv.file, buffer)
    
    cv_file_path = f"/uploads/cvs/{safe_filename}"
    
    # Extract information from CV
    cv.file.seek(0)  # Reset file pointer
    extracted_info = extract_cv_info(cv.file)
    
    # Sanitize cover letter
    cover_letter_clean = sanitize_input(cover_letter, max_length=2000) if cover_letter else None
    
    # Serialize extracted_info to JSON string if it's a dict
    cv_extracted_info_str = json.dumps(extracted_info) if extracted_info and isinstance(extracted_info, dict) else None
    
    # Create application
    application = models.JobApplication(
        job_id=job_id,
        user_id=user_id,
        cover_letter=cover_letter_clean,
        cv_file_path=cv_file_path,
        cv_extracted_info=cv_extracted_info_str,
        status="pending"  # Waiting for admin approval
    )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return {
        "application_id": application.id,
        "status": application.status,
        "message": "Application submitted successfully. Waiting for admin approval.",
        "extracted_info": extracted_info
    }


@router.get("/user/{user_id}")
def get_user_applications(
    user_id: int,
    db: Session = Depends(get_db),
):
    """Get all applications for a user"""
    applications = db.query(models.JobApplication).filter(
        models.JobApplication.user_id == user_id
    ).order_by(models.JobApplication.applied_at.desc()).all()
    
    results = []
    for app in applications:
        results.append({
            "id": app.id,
            "job_id": app.job_id,
            "job_title": app.job.title if app.job else None,
            "status": app.status,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            "reviewed_at": app.reviewed_at.isoformat() if app.reviewed_at else None,
            "admin_notes": app.admin_notes,
        })
    
    return {"applications": results, "count": len(results)}


@router.get("/job/{job_id}")
def get_job_applications(
    job_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get all applications for a job (admin only)"""
    query = db.query(models.JobApplication).filter(
        models.JobApplication.job_id == job_id
    )
    
    if status:
        query = query.filter(models.JobApplication.status == status)
    
    applications = query.order_by(models.JobApplication.applied_at.desc()).all()
    
    results = []
    for app in applications:
        results.append({
            "id": app.id,
            "user_id": app.user_id,
            "user_name": app.user.name if app.user else None,
            "user_email": app.user.email if app.user else None,
            "cover_letter": app.cover_letter,
            "cv_file_path": app.cv_file_path,
            "cv_extracted_info": app.cv_extracted_info_dict if app.cv_extracted_info else None,
            "status": app.status,
            "admin_notes": app.admin_notes,
            "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            "reviewed_at": app.reviewed_at.isoformat() if app.reviewed_at else None,
        })
    
    return {"applications": results, "count": len(results)}


@router.get("/pending")
def get_pending_applications(
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
    db: Session = Depends(get_db),
):
    """Get all pending applications (admin queue) - optimized with eager loading"""
    try:
        # Use eager loading to prevent N+1 queries
        applications = db.query(models.JobApplication)\
            .options(
                joinedload(models.JobApplication.job),
                joinedload(models.JobApplication.user)
            )\
            .filter(
                models.JobApplication.status == "pending"
            )\
            .order_by(models.JobApplication.applied_at.asc())\
            .offset(offset)\
            .limit(limit)\
            .all()  # Oldest first (queue)
        
        results = []
        for app in applications:
            results.append({
                "id": app.id,
                "job_id": app.job_id,
                "job_title": app.job.title if app.job else None,
                "user_id": app.user_id,
                "user_name": app.user.name if app.user else None,
                "user_email": app.user.email if app.user else None,
                "cover_letter": app.cover_letter,
                "cv_file_path": app.cv_file_path,
                "cv_extracted_info": app.cv_extracted_info_dict if app.cv_extracted_info else None,
                "applied_at": app.applied_at.isoformat() if app.applied_at else None,
            })
        
        return {"applications": results, "count": len(results)}
    except Exception as e:
        # Return empty list if error (e.g., table doesn't exist yet)
        return {"applications": [], "count": 0, "error": str(e)}


@router.put("/{application_id}/review")
def review_application(
    application_id: int,
    request: Request,
    status: str = Form(...),  # approved, rejected
    admin_notes: Optional[str] = Form(None),
    reviewer_id: int = Form(...),  # Admin user ID
    db: Session = Depends(get_db),
):
    """
    Admin reviews and approves/rejects an application
    """
    application = db.query(models.JobApplication).filter(
        models.JobApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.status != "pending":
        raise HTTPException(status_code=400, detail="Application already reviewed")
    
    if status not in ["approved", "rejected", "reviewing"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # Update application
    application.status = status
    application.admin_notes = sanitize_input(admin_notes, max_length=1000) if admin_notes else None
    application.reviewed_at = datetime.utcnow()
    application.reviewed_by = reviewer_id
    
    db.commit()
    db.refresh(application)
    
    return {
        "application_id": application.id,
        "status": application.status,
        "message": f"Application {status} successfully"
    }


@router.get("/{application_id}")
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
):
    """Get a single application by ID"""
    application = db.query(models.JobApplication).filter(
        models.JobApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {
        "id": application.id,
        "job_id": application.job_id,
        "job_title": application.job.title if application.job else None,
        "user_id": application.user_id,
        "user_name": application.user.name if application.user else None,
        "user_email": application.user.email if application.user else None,
        "cover_letter": application.cover_letter,
        "cv_file_path": application.cv_file_path,
        "cv_extracted_info": application.cv_extracted_info,
        "status": application.status,
        "admin_notes": application.admin_notes,
        "applied_at": application.applied_at.isoformat() if application.applied_at else None,
        "reviewed_at": application.reviewed_at.isoformat() if application.reviewed_at else None,
    }

