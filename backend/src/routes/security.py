"""
Security monitoring and intrusion detection routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timedelta

from backend.src.db.database import get_db
from backend.src.db import models
from backend.src.utils.security import check_rate_limit

router = APIRouter(prefix="/security", tags=["security"])


def log_security_event(
    db: Session,
    ip_address: str,
    action: str,
    severity: str = 'info',
    threat_type: Optional[str] = None,
    details: Optional[str] = None,
    user_id: Optional[int] = None,
    detected_by: str = 'system',
    blocked: bool = False
):
    """Log a security event to the database"""
    security_log = models.SecurityLog(
        user_id=user_id,
        ip_address=ip_address,
        action=action,
        severity=severity,
        threat_type=threat_type,
        details=details,
        detected_by=detected_by,
        blocked=blocked
    )
    db.add(security_log)
    db.commit()
    return security_log


@router.get("/logs")
def get_security_logs(
    request: Request,
    limit: int = 100,
    offset: int = 0,
    severity: Optional[str] = None,
    threat_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get security logs (admin only)"""
    query = db.query(models.SecurityLog)
    
    if severity:
        query = query.filter(models.SecurityLog.severity == severity)
    if threat_type:
        query = query.filter(models.SecurityLog.threat_type == threat_type)
    
    logs = query.order_by(desc(models.SecurityLog.created_at)).offset(offset).limit(limit).all()
    total = query.count()
    
    return {
        "logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "ip_address": log.ip_address,
                "action": log.action,
                "severity": log.severity,
                "threat_type": log.threat_type,
                "details": log.details,
                "detected_by": log.detected_by,
                "blocked": log.blocked,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/stats")
def get_security_stats(
    request: Request,
    days: int = 7,
    db: Session = Depends(get_db),
):
    """Get security statistics (admin only)"""
    since = datetime.utcnow() - timedelta(days=days)
    
    total_logs = db.query(models.SecurityLog).filter(
        models.SecurityLog.created_at >= since
    ).count()
    
    critical_logs = db.query(models.SecurityLog).filter(
        models.SecurityLog.created_at >= since,
        models.SecurityLog.severity == 'critical'
    ).count()
    
    blocked_attempts = db.query(models.SecurityLog).filter(
        models.SecurityLog.created_at >= since,
        models.SecurityLog.blocked == True
    ).count()
    
    # Group by threat type
    threat_types = db.query(
        models.SecurityLog.threat_type,
        func.count(models.SecurityLog.id).label('count')
    ).filter(
        models.SecurityLog.created_at >= since,
        models.SecurityLog.threat_type.isnot(None)
    ).group_by(models.SecurityLog.threat_type).all()
    
    # Group by severity
    severity_counts = db.query(
        models.SecurityLog.severity,
        func.count(models.SecurityLog.id).label('count')
    ).filter(
        models.SecurityLog.created_at >= since
    ).group_by(models.SecurityLog.severity).all()
    
    return {
        "total_logs": total_logs,
        "critical_logs": critical_logs,
        "blocked_attempts": blocked_attempts,
        "threat_types": {threat: count for threat, count in threat_types},
        "severity_counts": {severity: count for severity, count in severity_counts},
        "period_days": days
    }


@router.post("/detect")
async def detect_threat(
    request: Request,
    data: dict,
    db: Session = Depends(get_db),
):
    """
    Endpoint for intrusion detection model to report threats
    This will be called by your IDS model
    """
    client_ip = request.client.host if request.client else "unknown"
    
    # Extract threat information from model response
    threat_type = data.get('threat_type', 'unknown')
    severity = data.get('severity', 'warning')
    details = data.get('details', '')
    user_id = data.get('user_id')
    blocked = data.get('blocked', False)
    action = data.get('action', 'suspicious_activity')
    
    # Log the threat
    log = log_security_event(
        db=db,
        ip_address=client_ip,
        action=action,
        severity=severity,
        threat_type=threat_type,
        details=details,
        user_id=user_id,
        detected_by='ids_model',
        blocked=blocked
    )
    
    return {
        "id": log.id,
        "message": "Threat logged successfully",
        "blocked": blocked
    }


@router.delete("/logs/{log_id}")
def delete_security_log(
    log_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """Delete a security log (admin only)"""
    log = db.query(models.SecurityLog).filter(models.SecurityLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Security log not found")
    
    db.delete(log)
    db.commit()
    return {"message": "Security log deleted successfully"}

