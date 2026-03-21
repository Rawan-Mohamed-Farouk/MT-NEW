from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from werkzeug.security import generate_password_hash, check_password_hash
import os
import shutil
from pathlib import Path

from backend.src.db.database import get_db
from backend.src.db import models
from backend.src.utils.security import (
    sanitize_input, validate_email, validate_name, validate_phone,
    validate_string_length, validate_integer_id, check_rate_limit
)

router = APIRouter(prefix="/users", tags=["users"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/profiles")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/add_user")
async def add_user(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    password: Optional[str] = Form(None),
    user_type: str = Form("user"),
    phone: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    gender: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    experience_level: Optional[str] = Form(None),
    preferred_job_type: Optional[str] = Form(None),
    disabilities: Optional[str] = Form(None),  # JSON string or comma-separated IDs
    skills: Optional[str] = Form(None),  # JSON string or comma-separated IDs
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Security: Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"register_{client_ip}", max_requests=5, window_seconds=300):
        raise HTTPException(status_code=429, detail="Too many registration attempts. Please try again later.")
    
    # Security: Input validation
    name = sanitize_input(name, max_length=100)
    if not validate_name(name):
        raise HTTPException(status_code=400, detail="Invalid name format")
    
    email = sanitize_input(email, max_length=255)
    if not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if password:
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        if len(password) > 128:
            raise HTTPException(status_code=400, detail="Password too long")
    
    if user_type not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid user type")
    
    if phone:
        phone = sanitize_input(phone, max_length=50)
        if not validate_phone(phone):
            raise HTTPException(status_code=400, detail="Invalid phone format")
    
    if location:
        location = sanitize_input(location, max_length=255)
    
    if age is not None and (age < 13 or age > 120):
        raise HTTPException(status_code=400, detail="Invalid age")
    
    # Check if user exists
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password if provided
    hashed_password = None
    if password:
        hashed_password = generate_password_hash(password)
    
    # Handle photo upload
    photo_path = None
    if photo:
        file_ext = os.path.splitext(photo.filename)[1]
        safe_filename = f"{email}_{int(os.urandom(4).hex(), 16)}{file_ext}"
        photo_path = str(UPLOAD_DIR / safe_filename)
        with open(photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_path = f"/uploads/profiles/{safe_filename}"
    
    # Parse disabilities and skills
    disability_ids = []
    if disabilities:
        try:
            import json
            disability_ids = json.loads(disabilities) if disabilities.startswith('[') else [int(d) for d in disabilities.split(',') if d.strip()]
        except:
            pass
    
    skill_ids = []
    if skills:
        try:
            import json
            skill_ids = json.loads(skills) if skills.startswith('[') else [int(s) for s in skills.split(',') if s.strip()]
        except:
            pass
    
    user = models.User(
        name=name,
        email=email,
        password=hashed_password,
        user_type=user_type,
        photo=photo_path,
        phone=phone,
        age=age,
        gender=gender,
        location=location,
        experience_level=experience_level,
        preferred_job_type=preferred_job_type,
    )
    db.add(user)
    db.flush()

    if disability_ids:
        dis_objs = db.query(models.Disability).filter(models.Disability.id.in_(disability_ids)).all()
        user.disabilities.extend(dis_objs)

    if skill_ids:
        skill_objs = db.query(models.Skill).filter(models.Skill.id.in_(skill_ids)).all()
        user.skills.extend(skill_objs)

    db.commit()
    db.refresh(user)
    
    # Return user without password
    user_dict = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "user_type": user.user_type,
        "photo": user.photo,
        "phone": user.phone,
        "age": user.age,
        "gender": user.gender,
        "location": user.location,
        "experience_level": user.experience_level,
        "preferred_job_type": user.preferred_job_type,
        "disabilities": [{"id": d.id, "name": d.name} for d in user.disabilities],
        "skills": [{"id": s.id, "name": s.name} for s in user.skills],
    }
    return {"user": user_dict, "message": "User created"}


@router.post("/login")
def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    # Security: Rate limiting (stricter for login)
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"login_{client_ip}", max_requests=5, window_seconds=300):
        raise HTTPException(status_code=429, detail="Too many login attempts. Please try again in 5 minutes.")
    
    # Security: Input validation
    email = sanitize_input(email, max_length=255)
    if not validate_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if not password or len(password) < 8 or len(password) > 128:
        raise HTTPException(status_code=400, detail="Invalid password")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not check_password_hash(user.password, password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Return user without password
    user_dict = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "user_type": user.user_type,
        "photo": user.photo,
        "phone": user.phone,
        "age": user.age,
        "gender": user.gender,
        "location": user.location,
        "experience_level": user.experience_level,
        "preferred_job_type": user.preferred_job_type,
    }
    return {"user": user_dict, "message": "Login successful"}


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "user_type": user.user_type,
        "photo": user.photo,
        "phone": user.phone,
        "age": user.age,
        "gender": user.gender,
        "location": user.location,
        "experience_level": user.experience_level,
        "preferred_job_type": user.preferred_job_type,
        "disabilities": [{"id": d.id, "name": d.name} for d in user.disabilities],
        "skills": [{"id": s.id, "name": s.name} for s in user.skills],
    }


@router.put("/{user_id}")
async def update_user(
    user_id: int,
    name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    gender: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    experience_level: Optional[str] = Form(None),
    preferred_job_type: Optional[str] = Form(None),
    disabilities: Optional[str] = Form(None),
    skills: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if name:
        user.name = name
    if email:
        user.email = email
    if password:
        user.password = generate_password_hash(password)
    if phone is not None:
        user.phone = phone
    if age is not None:
        user.age = age
    if gender is not None:
        user.gender = gender
    if location is not None:
        user.location = location
    if experience_level is not None:
        user.experience_level = experience_level
    if preferred_job_type is not None:
        user.preferred_job_type = preferred_job_type
    
    # Handle photo upload
    if photo:
        # Delete old photo if exists
        if user.photo and os.path.exists(user.photo.lstrip('/')):
            try:
                os.remove(user.photo.lstrip('/'))
            except:
                pass
        
        file_ext = os.path.splitext(photo.filename)[1]
        safe_filename = f"{user.email}_{int(os.urandom(4).hex(), 16)}{file_ext}"
        photo_path = str(UPLOAD_DIR / safe_filename)
        with open(photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        user.photo = f"/uploads/profiles/{safe_filename}"
    
    # Update disabilities
    if disabilities is not None:
        user.disabilities.clear()
        try:
            import json
            disability_ids = json.loads(disabilities) if disabilities.startswith('[') else [int(d) for d in disabilities.split(',') if d.strip()]
            if disability_ids:
                dis_objs = db.query(models.Disability).filter(models.Disability.id.in_(disability_ids)).all()
                user.disabilities.extend(dis_objs)
        except:
            pass
    
    # Update skills
    if skills is not None:
        user.skills.clear()
        try:
            import json
            skill_ids = json.loads(skills) if skills.startswith('[') else [int(s) for s in skills.split(',') if s.strip()]
            if skill_ids:
                skill_objs = db.query(models.Skill).filter(models.Skill.id.in_(skill_ids)).all()
                user.skills.extend(skill_objs)
        except:
            pass
    
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "user_type": user.user_type,
        "photo": user.photo,
        "phone": user.phone,
        "age": user.age,
        "gender": user.gender,
        "location": user.location,
        "experience_level": user.experience_level,
        "preferred_job_type": user.preferred_job_type,
        "disabilities": [{"id": d.id, "name": d.name} for d in user.disabilities],
        "skills": [{"id": s.id, "name": s.name} for s in user.skills],
    }


@router.get("/")
def get_all_users(
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
    db: Session = Depends(get_db)
):
    """Get all users with pagination (optimized for dashboard)"""
    # For dashboard stats, we only need count, so limit to 1
    # But if limit is provided, use it for full list
    if limit is None:
        limit = 100
    
    users = db.query(models.User).offset(offset).limit(limit).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "user_type": u.user_type,
            "photo": u.photo,
            "phone": u.phone,
            "age": u.age,
            "gender": u.gender,
            "location": u.location,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete photo if exists
    if user.photo and os.path.exists(user.photo.lstrip('/')):
        try:
            os.remove(user.photo.lstrip('/'))
        except:
            pass
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


@router.get("/uploads/profiles/{filename}")
def get_profile_photo(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Photo not found")
    return FileResponse(file_path)
