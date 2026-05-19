"""
Assistive Tools and Resources routes
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

router = APIRouter(prefix="/tools", tags=["tools"])


@router.get("/")
def get_all_tools(
    disability_id: Optional[int] = None,
    category: Optional[str] = None,
    platform: Optional[str] = None,
    cost: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get all assistive tools, optionally filtered by disability, category, platform, or cost"""
    query = db.query(models.AssistiveTool)
    
    if disability_id:
        query = query.join(models.disability_tools).filter(
            models.disability_tools.c.disability_id == disability_id
        )
    
    if category:
        query = query.filter(models.AssistiveTool.category == category)
    
    if platform:
        query = query.filter(
            (models.AssistiveTool.platform == platform) |
            (models.AssistiveTool.platform == "All") |
            (models.AssistiveTool.platform.contains(platform))
        )
    
    if cost:
        query = query.filter(models.AssistiveTool.cost == cost)
    
    tools = query.order_by(models.AssistiveTool.name).all()
    
    return [
        {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "category": t.category,
            "tool_type": t.tool_type,
            "platform": t.platform,
            "cost": t.cost,
            "website_url": t.website_url,
            "icon": t.icon,
            "features": t.features or [],
            "disabilities": [{"id": d.id, "name": d.name} for d in t.disabilities],
        }
        for t in tools
    ]


@router.get("/for-user/{user_id}")
def get_tools_for_user(user_id: int, db: Session = Depends(get_db)):
    """Get recommended tools based on user's disabilities"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's disabilities
    user_disability_ids = [d.id for d in user.disabilities]
    
    if not user_disability_ids:
        return {
            "tools": [],
            "message": "No disabilities selected. Please update your profile to get tool recommendations."
        }
    
    # Get tools that match user's disabilities
    tools = db.query(models.AssistiveTool).join(models.disability_tools).filter(
        models.disability_tools.c.disability_id.in_(user_disability_ids)
    ).distinct().order_by(models.AssistiveTool.name).all()
    
    # Group by category
    tools_by_category = {}
    for tool in tools:
        category = tool.category or "Other"
        if category not in tools_by_category:
            tools_by_category[category] = []
        tools_by_category[category].append({
            "id": tool.id,
            "name": tool.name,
            "description": tool.description,
            "tool_type": tool.tool_type,
            "platform": tool.platform,
            "cost": tool.cost,
            "website_url": tool.website_url,
            "icon": tool.icon,
            "features": tool.features or [],
            "disabilities": [{"id": d.id, "name": d.name} for d in tool.disabilities],
        })
    
    return {
        "tools_by_category": tools_by_category,
        "total_tools": len(tools),
        "user_disabilities": [{"id": d.id, "name": d.name} for d in user.disabilities],
    }


@router.get("/{tool_id}")
def get_tool(tool_id: int, db: Session = Depends(get_db)):
    """Get a single tool by ID"""
    tool = db.query(models.AssistiveTool).filter(models.AssistiveTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    return {
        "id": tool.id,
        "name": tool.name,
        "description": tool.description,
        "category": tool.category,
        "tool_type": tool.tool_type,
        "platform": tool.platform,
        "cost": tool.cost,
        "website_url": tool.website_url,
        "icon": tool.icon,
        "features": tool.features or [],
        "disabilities": [{"id": d.id, "name": d.name} for d in tool.disabilities],
    }


@router.post("/")
def add_tool(
    request: Request,
    name: str,
    description: Optional[str] = None,
    category: Optional[str] = None,
    tool_type: Optional[str] = None,
    platform: Optional[str] = None,
    cost: Optional[str] = None,
    website_url: Optional[str] = None,
    icon: Optional[str] = None,
    features: Optional[List[str]] = None,
    disability_ids: Optional[List[int]] = None,
    db: Session = Depends(get_db),
):
    """Add a new assistive tool (admin only)"""
    # Security: Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"add_tool_{client_ip}", max_requests=10, window_seconds=60):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    
    # Security: Input validation
    name = sanitize_input(name, max_length=255)
    if not validate_string_length(name, max_length=255, min_length=1):
        raise HTTPException(status_code=400, detail="Invalid tool name")
    
    if description:
        description = sanitize_input(description, max_length=2000)
    
    tool = models.AssistiveTool(
        name=name,
        description=description,
        category=category,
        tool_type=tool_type,
        platform=platform,
        cost=cost,
        website_url=website_url,
        icon=icon,
        features=features or [],
    )
    
    db.add(tool)
    db.flush()
    
    # Link to disabilities
    if disability_ids:
        disabilities = db.query(models.Disability).filter(
            models.Disability.id.in_(disability_ids)
        ).all()
        tool.disabilities.extend(disabilities)
    
    db.commit()
    db.refresh(tool)
    
    return {
        "id": tool.id,
        "name": tool.name,
        "message": "Tool added successfully",
    }


@router.put("/{tool_id}")
def update_tool(
    tool_id: int,
    request: Request,
    name: Optional[str] = None,
    description: Optional[str] = None,
    category: Optional[str] = None,
    tool_type: Optional[str] = None,
    platform: Optional[str] = None,
    cost: Optional[str] = None,
    website_url: Optional[str] = None,
    icon: Optional[str] = None,
    features: Optional[List[str]] = None,
    disability_ids: Optional[List[int]] = None,
    db: Session = Depends(get_db),
):
    """Update an assistive tool (admin only)"""
    tool = db.query(models.AssistiveTool).filter(models.AssistiveTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    if name is not None:
        tool.name = sanitize_input(name, max_length=255)
    if description is not None:
        tool.description = sanitize_input(description, max_length=2000)
    if category is not None:
        tool.category = category
    if tool_type is not None:
        tool.tool_type = tool_type
    if platform is not None:
        tool.platform = platform
    if cost is not None:
        tool.cost = cost
    if website_url is not None:
        tool.website_url = website_url
    if icon is not None:
        tool.icon = icon
    if features is not None:
        tool.features = features
    
    # Update disability associations
    if disability_ids is not None:
        tool.disabilities.clear()
        if disability_ids:
            disabilities = db.query(models.Disability).filter(
                models.Disability.id.in_(disability_ids)
            ).all()
            tool.disabilities.extend(disabilities)
    
    db.commit()
    db.refresh(tool)
    
    return {
        "id": tool.id,
        "name": tool.name,
        "message": "Tool updated successfully",
    }


@router.delete("/{tool_id}")
def delete_tool(tool_id: int, db: Session = Depends(get_db)):
    """Delete an assistive tool (admin only)"""
    tool = db.query(models.AssistiveTool).filter(models.AssistiveTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    db.delete(tool)
    db.commit()
    
    return {"message": "Tool deleted successfully"}

