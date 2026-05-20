"""
Intrusion Detection System (IDS) Integration
This module provides utilities for integrating with your custom IDS model
"""
import os
import json
from typing import Optional, Dict, Any
from datetime import datetime

# Path to your IDS model (you'll upload this)
IDS_MODEL_PATH = os.getenv("IDS_MODEL_PATH", "models/ids_model.pkl")
IDS_ENABLED = os.getenv("IDS_ENABLED", "true").lower() == "true"


def load_ids_model():
    """
    Load your intrusion detection model
    You can modify this to load your specific model format (pickle, joblib, tensorflow, etc.)
    """
    if not IDS_ENABLED:
        return None
    
    if not os.path.exists(IDS_MODEL_PATH):
        print(f"Warning: IDS model not found at {IDS_MODEL_PATH}")
        return None
    
    try:
        # Example: Loading a pickle model
        # import pickle
        # with open(IDS_MODEL_PATH, 'rb') as f:
        #     model = pickle.load(f)
        # return model
        
        # For now, return None until you upload your model
        # You can implement your model loading logic here
        return None
    except Exception as e:
        print(f"Error loading IDS model: {e}")
        return None


def detect_threat(
    request_data: Dict[str, Any],
    ip_address: str,
    user_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Detect threats using your IDS model
    
    Args:
        request_data: Request data to analyze (headers, body, etc.)
        ip_address: Client IP address
        user_id: Optional user ID
    
    Returns:
        Dictionary with threat detection results:
        {
            'is_threat': bool,
            'threat_type': str,
            'severity': str,
            'confidence': float,
            'details': str,
            'blocked': bool
        }
    """
    if not IDS_ENABLED:
        return {
            'is_threat': False,
            'threat_type': None,
            'severity': 'info',
            'confidence': 0.0,
            'details': 'IDS disabled',
            'blocked': False
        }
    
    model = load_ids_model()
    if model is None:
        # Fallback to rule-based detection
        return rule_based_detection(request_data, ip_address, user_id)
    
    try:
        # Prepare features for your model
        features = extract_features(request_data, ip_address, user_id)
        
        # Run prediction (adjust based on your model)
        # prediction = model.predict([features])
        # probability = model.predict_proba([features])[0]
        
        # For now, use rule-based until model is uploaded
        return rule_based_detection(request_data, ip_address, user_id)
        
    except Exception as e:
        print(f"Error in threat detection: {e}")
        return {
            'is_threat': False,
            'threat_type': None,
            'severity': 'info',
            'confidence': 0.0,
            'details': f'Detection error: {str(e)}',
            'blocked': False
        }


def extract_features(request_data: Dict[str, Any], ip_address: str, user_id: Optional[int]) -> list:
    """
    Extract features from request data for IDS model
    Customize this based on your model's requirements
    """
    features = []
    
    # Example features (adjust based on your model)
    # - Request length
    # - Number of special characters
    # - SQL injection patterns
    # - XSS patterns
    # - Request frequency
    # - User agent anomalies
    # etc.
    
    return features


def rule_based_detection(
    request_data: Dict[str, Any],
    ip_address: str,
    user_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Rule-based threat detection (fallback when model not available)
    Detects common attack patterns
    """
    threat_patterns = {
        'sql_injection': [
            "union select", "drop table", "insert into", "delete from",
            "'; --", "1=1", "1' OR '1'='1", "exec(", "xp_cmdshell"
        ],
        'xss': [
            "<script>", "javascript:", "onerror=", "onload=",
            "eval(", "alert(", "<img src=x", "document.cookie"
        ],
        'path_traversal': [
            "../", "..\\", "/etc/passwd", "C:\\", "..%2F", "%2E%2E"
        ],
        'command_injection': [
            "; ls", "| cat", "&& whoami", "`", "$(", "<?php"
        ]
    }
    
    # Check request body/query for threats
    request_str = json.dumps(request_data).lower()
    
    for threat_type, patterns in threat_patterns.items():
        for pattern in patterns:
            if pattern.lower() in request_str:
                return {
                    'is_threat': True,
                    'threat_type': threat_type,
                    'severity': 'critical',
                    'confidence': 0.9,
                    'details': f'Detected {threat_type} pattern: {pattern}',
                    'blocked': True
                }
    
    return {
        'is_threat': False,
        'threat_type': None,
        'severity': 'info',
        'confidence': 0.0,
        'details': 'No threats detected',
        'blocked': False
    }


def analyze_request(request, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Analyze an incoming request for threats
    This is called from middleware or route handlers
    """
    client_ip = request.client.host if request.client else "unknown"
    
    # Extract request data
    request_data = {
        'method': request.method,
        'path': request.url.path,
        'headers': dict(request.headers),
        'query_params': dict(request.query_params),
    }
    
    # Try to get body if available
    try:
        if hasattr(request, 'json'):
            request_data['body'] = request.json()
    except:
        pass
    
    # Run detection
    result = detect_threat(request_data, client_ip, user_id)
    
    return result

