"""
Disability management routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from backend.src.db.database import get_db
from backend.src.db import models
from backend.src.utils.security import (
    sanitize_input, validate_string_length, validate_integer_id,
    check_rate_limit
)

router = APIRouter(prefix="/disabilities", tags=["disabilities"])


@router.get("/")
def get_all_disabilities(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get all disabilities, optionally filtered by category"""
    query = db.query(models.Disability)
    
    if category:
        query = query.filter(models.Disability.category == category)
    
    disabilities = query.order_by(models.Disability.name).all()
    
    return [
        {
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "category": d.category,
            "icon": d.icon,
            "severity": d.severity,
        }
        for d in disabilities
    ]


@router.get("/{disability_id}")
def get_disability(disability_id: int, db: Session = Depends(get_db)):
    """Get a single disability by ID"""
    disability = db.query(models.Disability).filter(models.Disability.id == disability_id).first()
    if not disability:
        raise HTTPException(status_code=404, detail="Disability not found")
    
    return {
        "id": disability.id,
        "name": disability.name,
        "description": disability.description,
        "category": disability.category,
        "icon": disability.icon,
        "severity": disability.severity,
    }


@router.post("/")
def add_disability(
    request: Request,
    name: str,
    description: Optional[str] = None,
    category: Optional[str] = None,
    icon: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Add a new disability (admin only)"""
    # Security: Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"add_disability_{client_ip}", max_requests=10, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    
    # Security: Input validation
    name = sanitize_input(name, max_length=255)
    if not validate_string_length(name, max_length=255, min_length=1):
        raise HTTPException(status_code=400, detail="Invalid disability name")
    
    if description:
        description = sanitize_input(description, max_length=1000)
    
    if category:
        category = sanitize_input(category, max_length=100)
        if category not in ["Sensory", "Cognitive", "Physical", "Mental Health", "Other"]:
            raise HTTPException(status_code=400, detail="Invalid category")
    
    if icon:
        icon = sanitize_input(icon, max_length=100)
    
    if severity:
        severity = sanitize_input(severity, max_length=50)
        if severity not in ["mild", "moderate", "severe"]:
            raise HTTPException(status_code=400, detail="Invalid severity")
    
    # Check if disability already exists
    existing = db.query(models.Disability).filter(models.Disability.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Disability already exists")
    
    disability = models.Disability(
        name=name,
        description=description,
        category=category,
        icon=icon,
        severity=severity,
    )
    
    db.add(disability)
    db.commit()
    db.refresh(disability)
    
    return {
        "id": disability.id,
        "name": disability.name,
        "description": disability.description,
        "category": disability.category,
        "icon": disability.icon,
        "severity": disability.severity,
        "message": "Disability added successfully",
    }


@router.put("/{disability_id}")
def update_disability(
    disability_id: int,
    request: Request,
    name: Optional[str] = None,
    description: Optional[str] = None,
    category: Optional[str] = None,
    icon: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Update a disability (admin only)"""
    disability = db.query(models.Disability).filter(models.Disability.id == disability_id).first()
    if not disability:
        raise HTTPException(status_code=404, detail="Disability not found")
    
    # Security: Input validation
    if name is not None:
        name = sanitize_input(name, max_length=255)
        if not validate_string_length(name, max_length=255, min_length=1):
            raise HTTPException(status_code=400, detail="Invalid disability name")
        
        # Check if name is already taken by another disability
        existing = db.query(models.Disability).filter(
            models.Disability.name == name,
            models.Disability.id != disability_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Disability name already exists")
        
        disability.name = name
    
    if description is not None:
        disability.description = sanitize_input(description, max_length=1000)
    
    if category is not None:
        category = sanitize_input(category, max_length=100)
        if category not in ["Sensory", "Cognitive", "Physical", "Mental Health", "Other"]:
            raise HTTPException(status_code=400, detail="Invalid category")
        disability.category = category
    
    if icon is not None:
        disability.icon = sanitize_input(icon, max_length=100)
    
    if severity is not None:
        severity = sanitize_input(severity, max_length=50)
        if severity not in ["mild", "moderate", "severe", None]:
            raise HTTPException(status_code=400, detail="Invalid severity")
        disability.severity = severity
    
    db.commit()
    db.refresh(disability)
    
    return {
        "id": disability.id,
        "name": disability.name,
        "description": disability.description,
        "category": disability.category,
        "icon": disability.icon,
        "severity": disability.severity,
        "message": "Disability updated successfully",
    }


@router.delete("/{disability_id}")
def delete_disability(disability_id: int, db: Session = Depends(get_db)):
    """Delete a disability (admin only)"""
    disability = db.query(models.Disability).filter(models.Disability.id == disability_id).first()
    if not disability:
        raise HTTPException(status_code=404, detail="Disability not found")
    
    # Check if any users have this disability
    users_with_disability = db.query(models.User).join(models.user_disabilities).filter(
        models.user_disabilities.c.disability_id == disability_id
    ).count()
    
    if users_with_disability > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete disability. {users_with_disability} user(s) have this disability."
        )
    
    # Check if any jobs support this disability
    jobs_with_disability = db.query(models.Job).join(models.job_disability_support).filter(
        models.job_disability_support.c.disability_id == disability_id
    ).count()
    
    if jobs_with_disability > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete disability. {jobs_with_disability} job(s) support this disability."
        )
    
    db.delete(disability)
    db.commit()
    
    return {"message": "Disability deleted successfully"}


@router.get("/categories/list")
def get_disability_categories():
    """Get list of available disability categories"""
    return {
        "categories": [
            {"value": "Sensory", "label": "Sensory Disabilities"},
            {"value": "Cognitive", "label": "Cognitive Disabilities"},
            {"value": "Physical", "label": "Physical Disabilities"},
            {"value": "Mental Health", "label": "Mental Health Conditions"},
            {"value": "Other", "label": "Other"},
        ]
    }

