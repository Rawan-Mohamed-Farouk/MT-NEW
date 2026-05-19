"""
Security utilities for input validation, sanitization, and rate limiting
"""
import re
from typing import Optional
from fastapi import HTTPException
from datetime import datetime, timedelta
from collections import defaultdict

# Rate limiting storage (in production, use Redis)
rate_limit_store = defaultdict(list)

# Allowed characters for different input types
ALLOWED_EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
ALLOWED_NAME_PATTERN = re.compile(r'^[a-zA-Z\s\-\'\.]{1,100}$')
ALLOWED_PHONE_PATTERN = re.compile(r'^[\d\s\-\+\(\)]{7,20}$')
ALLOWED_SEARCH_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-\.,!?]{0,200}$')


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """Sanitize user input to prevent XSS and injection attacks"""
    if not text:
        return ""
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Limit length
    text = text[:max_length]
    
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&', ';', '|', '`', '$', '(', ')', '{', '}']
    for char in dangerous_chars:
        text = text.replace(char, '')
    
    # Strip whitespace
    text = text.strip()
    
    return text


def validate_email(email: str) -> bool:
    """Validate email format"""
    if not email or len(email) > 255:
        return False
    return bool(ALLOWED_EMAIL_PATTERN.match(email))


def validate_name(name: str) -> bool:
    """Validate name format"""
    if not name or len(name) < 1 or len(name) > 100:
        return False
    return bool(ALLOWED_NAME_PATTERN.match(name))


def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    if not phone:
        return True  # Optional field
    return bool(ALLOWED_PHONE_PATTERN.match(phone))


def validate_search_query(query: str) -> bool:
    """Validate search query"""
    if not query:
        return True  # Empty query is allowed
    if len(query) > 200:
        return False
    return bool(ALLOWED_SEARCH_PATTERN.match(query))


def check_rate_limit(identifier: str, max_requests: int = 10, window_seconds: int = 60) -> bool:
    """
    Simple rate limiting (in production, use Redis)
    Returns True if request is allowed, False if rate limited
    """
    now = datetime.now()
    window_start = now - timedelta(seconds=window_seconds)
    
    # Clean old entries
    rate_limit_store[identifier] = [
        req_time for req_time in rate_limit_store[identifier]
        if req_time > window_start
    ]
    
    # Check limit
    if len(rate_limit_store[identifier]) >= max_requests:
        return False
    
    # Add current request
    rate_limit_store[identifier].append(now)
    return True


def validate_integer_id(id_value: Optional[int], min_value: int = 1, max_value: int = 2147483647) -> bool:
    """Validate integer ID"""
    if id_value is None:
        return True  # Optional
    return isinstance(id_value, int) and min_value <= id_value <= max_value


def validate_string_length(text: Optional[str], max_length: int = 1000, min_length: int = 0) -> bool:
    """Validate string length"""
    if text is None:
        return True  # Optional
    return isinstance(text, str) and min_length <= len(text) <= max_length

