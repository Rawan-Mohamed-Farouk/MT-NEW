"""
Security middleware for automatic threat detection
"""
import json
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from backend.src.utils.ids_detector import analyze_request
from backend.src.db.database import get_db
from backend.src.routes.security import log_security_event


class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware to detect and log security threats"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip security check for health and docs endpoints
        if request.url.path in ['/health', '/docs', '/openapi.json', '/']:
            return await call_next(request)
        
        # Analyze request for threats
        try:
            threat_result = analyze_request(request)
            
            if threat_result.get('is_threat'):
                # Get database session
                db = next(get_db())
                
                # Log the threat
                log_security_event(
                    db=db,
                    ip_address=request.client.host if request.client else "unknown",
                    action=request.method + " " + request.url.path,
                    severity=threat_result.get('severity', 'warning'),
                    threat_type=threat_result.get('threat_type'),
                    details=threat_result.get('details', ''),
                    detected_by='ids_model' if threat_result.get('confidence', 0) > 0.5 else 'system',
                    blocked=threat_result.get('blocked', False)
                )
                
                # Block if critical threat
                if threat_result.get('blocked', False) or threat_result.get('severity') == 'critical':
                    return Response(
                        content=json.dumps({
                            "detail": "Request blocked due to security threat",
                            "threat_type": threat_result.get('threat_type')
                        }),
                        status_code=403,
                        media_type="application/json"
                    )
        except Exception as e:
            # Don't block on detection errors, just log
            print(f"Security detection error: {e}")
        
        # Continue with request
        response = await call_next(request)
        return response

