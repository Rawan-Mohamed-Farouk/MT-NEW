"""
Company routes for managing companies
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

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/")
def get_all_companies(
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
    db: Session = Depends(get_db),
):
    """Get all companies with pagination (optimized for dashboard)"""
    companies = db.query(models.Company)\
        .offset(offset)\
        .limit(limit)\
        .all()
    
    return [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "website": c.website,
            "logo": c.logo,
        }
        for c in companies
    ]


@router.get("/{company_id}")
def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get a single company by ID"""
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return {
        "id": company.id,
        "name": company.name,
        "description": company.description,
        "website": company.website,
        "logo": company.logo,
    }


@router.post("/")
def add_company(
    request: Request,
    name: str,
    description: Optional[str] = None,
    website: Optional[str] = None,
    logo: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Add a new company"""
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"add_company_{client_ip}", max_requests=10, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    
    # Input validation
    name = sanitize_input(name, max_length=255)
    if not validate_string_length(name, max_length=255, min_length=1):
        raise HTTPException(status_code=400, detail="Invalid company name")
    
    if description:
        description = sanitize_input(description, max_length=5000)
    
    if website:
        website = sanitize_input(website, max_length=500)
    
    if logo:
        logo = sanitize_input(logo, max_length=500)
    
    # Check if company already exists
    existing = db.query(models.Company).filter(models.Company.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company already exists")
    
    company = models.Company(
        name=name,
        description=description,
        website=website,
        logo=logo,
    )
    
    db.add(company)
    db.commit()
    db.refresh(company)
    
    return {
        "id": company.id,
        "name": company.name,
        "description": company.description,
        "website": company.website,
        "logo": company.logo,
    }


@router.put("/{company_id}")
def update_company(
    company_id: int,
    request: Request,
    name: Optional[str] = None,
    description: Optional[str] = None,
    website: Optional[str] = None,
    logo: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Update a company"""
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    if name:
        name = sanitize_input(name, max_length=255)
        if not validate_string_length(name, max_length=255, min_length=1):
            raise HTTPException(status_code=400, detail="Invalid company name")
        company.name = name
    
    if description is not None:
        description = sanitize_input(description, max_length=5000) if description else None
        company.description = description
    
    if website is not None:
        website = sanitize_input(website, max_length=500) if website else None
        company.website = website
    
    if logo is not None:
        logo = sanitize_input(logo, max_length=500) if logo else None
        company.logo = logo
    
    db.commit()
    db.refresh(company)
    
    return {
        "id": company.id,
        "name": company.name,
        "description": company.description,
        "website": company.website,
        "logo": company.logo,
    }


@router.delete("/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    """Delete a company"""
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(company)
    db.commit()
    return {"message": "Company deleted successfully"}

