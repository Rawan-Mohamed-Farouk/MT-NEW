from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload, selectinload

from backend.src.db.database import get_db
from backend.src.db import models
from backend.src.utils.security import (
    sanitize_input, validate_search_query, validate_integer_id,
    check_rate_limit, validate_string_length
)
from backend.src.utils.search_intelligence import intelligent_job_search
# Embedding imports removed - using Groq only


router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/add_job")
def add_job(
    request: Request,
    title: str,
    description: str,
    employment_type: Optional[str] = "full-time",
    remote_type: Optional[str] = "remote",
    company_id: Optional[int] = None,
    location_id: Optional[int] = None,
    requirements: Optional[List[str]] = None,
    disabilities: Optional[List[int]] = None,
    db: Session = Depends(get_db),
):
    # Security: Input validation
    title = sanitize_input(title, max_length=255)
    if not validate_string_length(title, max_length=255, min_length=1):
        raise HTTPException(status_code=400, detail="Invalid job title")
    
    description = sanitize_input(description, max_length=5000)
    if not validate_string_length(description, max_length=5000, min_length=10):
        raise HTTPException(status_code=400, detail="Job description must be between 10 and 5000 characters")
    
    if employment_type not in ["full-time", "part-time", "contract", "internship"]:
        raise HTTPException(status_code=400, detail="Invalid employment type")
    
    if remote_type not in ["remote", "on-site", "hybrid"]:
        raise HTTPException(status_code=400, detail="Invalid remote type")
    
    if company_id and not validate_integer_id(company_id):
        raise HTTPException(status_code=400, detail="Invalid company ID")
    
    if location_id and not validate_integer_id(location_id):
        raise HTTPException(status_code=400, detail="Invalid location ID")
    
    if requirements:
        for req in requirements:
            req_sanitized = sanitize_input(req, max_length=255)
            if not validate_string_length(req_sanitized, max_length=255, min_length=1):
                raise HTTPException(status_code=400, detail="Invalid requirement format")
    
    if disabilities:
        for did in disabilities:
            if not validate_integer_id(did):
                raise HTTPException(status_code=400, detail=f"Invalid disability ID: {did}")
    company = db.query(models.Company).get(company_id) if company_id else None
    location = db.query(models.Location).get(location_id) if location_id else None

    job = models.Job(
        title=title,
        description=description,
        employment_type=employment_type,
        remote_type=remote_type,
        company=company,
        location=location,
    )
    db.add(job)
    db.flush()  # get job.id

    if requirements:
        for req in requirements:
            req_sanitized = sanitize_input(req, max_length=255)
            db.add(models.JobRequirement(job_id=job.id, requirement=req_sanitized))

    if disabilities:
        dis_objs = db.query(models.Disability).filter(models.Disability.id.in_(disabilities)).all()
        job.disabilities.extend(dis_objs)

    # Skip embedding creation since we're using Groq only
    # Embeddings are optional and can be added later if needed

    db.commit()
    db.refresh(job)
    return {"job_id": job.id, "message": "Job created and embedded"}


@router.post("/search_jobs")
def search_jobs(
    request: Request,
    user_id: Optional[int] = None,
    disability_ids: Optional[List[int]] = None,
    disability_id: Optional[int] = None,
    skills: Optional[List[str]] = None,
    skill_id: Optional[int] = None,
    query: Optional[str] = None,
    employment_type: Optional[str] = None,
    remote_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    # Security: Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"search_{client_ip}", max_requests=30, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    
    # Security: Input validation
    if query:
        query = sanitize_input(query, max_length=200)
        if not validate_search_query(query):
            raise HTTPException(status_code=400, detail="Invalid search query")
    
    if user_id and not validate_integer_id(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    if disability_id and not validate_integer_id(disability_id):
        raise HTTPException(status_code=400, detail="Invalid disability ID")
    
    if employment_type and not validate_string_length(employment_type, max_length=50):
        raise HTTPException(status_code=400, detail="Invalid employment type")
    
    if remote_type and not validate_string_length(remote_type, max_length=50):
        raise HTTPException(status_code=400, detail="Invalid remote type")
    
    # Handle single ID parameters
    if disability_id and not disability_ids:
        disability_ids = [disability_id]
    
    # Handle skill_id - convert to skill_ids list
    skill_ids = None
    if skill_id:
        if not validate_integer_id(skill_id):
            raise HTTPException(status_code=400, detail="Invalid skill ID")
        skill_ids = [skill_id]
    elif skills:
        # If skills is a list of IDs, convert to integers
        try:
            skill_ids = [int(s) for s in skills if str(s).isdigit()]
        except:
            skill_ids = None
    
    # Validate disability IDs
    if disability_ids:
        for did in disability_ids:
            if not validate_integer_id(did):
                raise HTTPException(status_code=400, detail=f"Invalid disability ID: {did}")
    
    # Validate skill IDs
    if skill_ids:
        for sid in skill_ids:
            if not validate_integer_id(sid):
                raise HTTPException(status_code=400, detail=f"Invalid skill ID: {sid}")
    
    # Get user profile if user_id provided
    user_profile = None
    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user_profile = {
                "disabilities": [d.name for d in user.disabilities],
                "skills": [s.name for s in user.skills],
                "location": user.location,
                "preferred_job_type": user.preferred_job_type,
            }
    
    # Use intelligent search
    results = intelligent_job_search(
        db=db,
        query=query,
        disability_ids=disability_ids,
        skill_ids=skill_ids,
        employment_type=employment_type,
        remote_type=remote_type,
        user_profile=user_profile,
        limit=20
    )

    return {"results": results, "count": len(results)}


@router.get("/")
def get_all_jobs(
    limit: Optional[int] = 50,
    offset: Optional[int] = 0,
    db: Session = Depends(get_db),
):
    """Get all jobs with pagination (optimized with eager loading)"""
    # Use eager loading to prevent N+1 queries
    jobs = db.query(models.Job)\
        .options(
            joinedload(models.Job.company),
            joinedload(models.Job.location),
            selectinload(models.Job.requirements),
            selectinload(models.Job.disabilities)
        )\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    results = []
    for job in jobs:
        requirements = [req.requirement for req in job.requirements]
        disability_support = [d.name for d in job.disabilities]
        
        results.append(
            {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "company_name": job.company.name if job.company else None,
                "company_id": job.company_id,
                "location_city": job.location.city if job.location else None,
                "location_country": job.location.country if job.location else None,
                "employment_type": job.employment_type,
                "remote_type": job.remote_type,
                "required_skills": requirements,
                "disability_support": disability_support,
                "posted_at": job.posted_at.isoformat() if job.posted_at else None,
            }
        )
    return {"results": results, "count": len(results)}


@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a single job by ID"""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    requirements = [req.requirement for req in job.requirements]
    disability_support = [d.name for d in job.disabilities]
    
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "company_name": job.company.name if job.company else None,
        "company_id": job.company_id,
        "location_city": job.location.city if job.location else None,
        "location_country": job.location.country if job.location else None,
        "employment_type": job.employment_type,
        "remote_type": job.remote_type,
        "required_skills": requirements,
        "disability_support": disability_support,
        "posted_at": job.posted_at.isoformat() if job.posted_at else None,
    }


@router.put("/{job_id}")
def update_job(
    job_id: int,
    request: Request,
    title: str,
    description: str,
    employment_type: Optional[str] = None,
    remote_type: Optional[str] = None,
    company_id: Optional[int] = None,
    location_id: Optional[int] = None,
    requirements: Optional[List[str]] = None,
    disabilities: Optional[List[int]] = None,
    db: Session = Depends(get_db),
):
    """Update a job"""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Security: Input validation
    title = sanitize_input(title, max_length=255)
    if not validate_string_length(title, max_length=255, min_length=1):
        raise HTTPException(status_code=400, detail="Invalid job title")
    
    description = sanitize_input(description, max_length=5000)
    if not validate_string_length(description, max_length=5000, min_length=10):
        raise HTTPException(status_code=400, detail="Job description must be between 10 and 5000 characters")
    
    # Update job fields
    job.title = title
    job.description = description
    
    if employment_type:
        if employment_type not in ["full-time", "part-time", "contract", "internship"]:
            raise HTTPException(status_code=400, detail="Invalid employment type")
        job.employment_type = employment_type
    
    if remote_type:
        if remote_type not in ["remote", "on-site", "hybrid"]:
            raise HTTPException(status_code=400, detail="Invalid remote type")
        job.remote_type = remote_type
    
    if company_id:
        company = db.query(models.Company).get(company_id)
        if company:
            job.company = company
    
    if location_id:
        location = db.query(models.Location).get(location_id)
        if location:
            job.location = location
    
    # Update requirements
    if requirements is not None:
        # Delete old requirements
        db.query(models.JobRequirement).filter(models.JobRequirement.job_id == job_id).delete()
        # Add new requirements
        for req in requirements:
            req_sanitized = sanitize_input(req, max_length=255)
            db.add(models.JobRequirement(job_id=job.id, requirement=req_sanitized))
    
    # Update disabilities
    if disabilities is not None:
        job.disabilities.clear()
        if disabilities:
            dis_objs = db.query(models.Disability).filter(models.Disability.id.in_(disabilities)).all()
            job.disabilities.extend(dis_objs)
    
    db.commit()
    db.refresh(job)
    return {"job_id": job.id, "message": "Job updated successfully"}


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    """Delete a job"""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}

