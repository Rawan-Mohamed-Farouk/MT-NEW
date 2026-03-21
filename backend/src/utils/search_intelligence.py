"""
Intelligent search utilities for better job matching
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from backend.src.db import models
from datetime import datetime
import re


# Skill synonyms and related terms for intelligent matching
SKILL_SYNONYMS = {
    "python": ["python", "py", "django", "flask", "pandas", "numpy"],
    "javascript": ["javascript", "js", "node", "react", "vue", "angular", "typescript"],
    "java": ["java", "spring", "hibernate", "jsp"],
    "developer": ["developer", "programmer", "coder", "engineer", "software engineer", "dev"],
    "designer": ["designer", "ui", "ux", "graphic designer", "web designer"],
    "writer": ["writer", "content writer", "copywriter", "blogger", "author"],
    "manager": ["manager", "supervisor", "lead", "director"],
    "analyst": ["analyst", "data analyst", "business analyst", "financial analyst"],
    "assistant": ["assistant", "admin", "administrative", "secretary"],
    "customer": ["customer service", "support", "help desk", "client service"],
    "remote": ["remote", "work from home", "wfh", "telecommute", "distributed"],
    "full-time": ["full-time", "fulltime", "ft", "permanent"],
    "part-time": ["part-time", "parttime", "pt", "casual"],
}


def extract_keywords(query: str) -> List[str]:
    """Extract meaningful keywords from search query - very flexible"""
    if not query:
        return []
    
    # Remove common stop words
    stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were"}
    
    # Extract ANY words (2+ characters) - more flexible
    # Allow numbers and special characters in words
    words = re.findall(r'\b[\w\d]{2,}\b', query.lower())
    keywords = [w for w in words if w not in stop_words]
    
    # If no keywords found, use the whole query (very flexible)
    if not keywords:
        # Remove special chars but keep the search term
        cleaned = re.sub(r'[^\w\s]', '', query.lower()).strip()
        if cleaned:
            keywords = [cleaned]
    
    return keywords


def get_synonyms(word: str) -> List[str]:
    """Get synonyms and related terms for a word"""
    word_lower = word.lower()
    synonyms = [word_lower]  # Include the word itself
    
    # Check skill synonyms
    for key, values in SKILL_SYNONYMS.items():
        if word_lower in values or word_lower == key:
            synonyms.extend(values)
    
    return list(set(synonyms))  # Remove duplicates


def calculate_word_match_score(text: str, keywords: List[str]) -> float:
    """Calculate how well text matches keywords (0.0 to 1.0) - very flexible matching"""
    if not text or not keywords:
        return 0.0
    
    text_lower = text.lower()
    total_score = 0.0
    
    for keyword in keywords:
        keyword_lower = keyword.lower()
        
        # Exact match (full word or substring)
        if keyword_lower in text_lower:
            total_score += 1.0
            continue
        
        # Check synonyms
        synonyms = get_synonyms(keyword_lower)
        found_synonym = False
        for synonym in synonyms:
            if synonym in text_lower:
                total_score += 0.8  # High credit for synonym match
                found_synonym = True
                break
        
        if found_synonym:
            continue
        
        # Very flexible partial matching - match any part of keyword
        if len(keyword_lower) >= 2:
            # Check if any word in text contains part of keyword
            for word in text_lower.split():
                # Match if keyword starts with word or word starts with keyword
                if len(keyword_lower) >= 3 and len(word) >= 3:
                    # Check first 3 characters match
                    if keyword_lower[:3] in word or word[:3] in keyword_lower:
                        total_score += 0.5
                        break
                    # Check if any 3+ char substring matches
                    if len(keyword_lower) >= 3:
                        for i in range(len(keyword_lower) - 2):
                            substr = keyword_lower[i:i+3]
                            if substr in word:
                                total_score += 0.4
                                break
                        if total_score > 0:
                            break
                # Very short keywords (2 chars) - exact match only
                elif len(keyword_lower) == 2 and keyword_lower in word:
                    total_score += 0.3
                    break
    
    # Normalize by number of keywords - more flexible scoring
    if len(keywords) > 0:
        score = total_score / len(keywords)
        # Lower threshold - accept more matches
        return min(score, 1.0)
    return 0.0


def calculate_relevance_score(job: models.Job, query: str, user_profile: Optional[Dict] = None) -> float:
    """
    Calculate intelligent relevance score for a job based on query and user profile
    Returns score between 0.0 and 1.0
    More flexible and intelligent than exact word matching
    """
    score = 0.0
    query_lower = query.lower() if query else ""
    
    if not query_lower:
        # If no query, score based on filters and user profile only
        base_score = 0.5
        if user_profile:
            # Boost if job matches user profile
            user_skills = [s.lower() for s in user_profile.get("skills", [])]
            job_requirements_text = " ".join([req.requirement.lower() for req in job.requirements])
            if any(skill in job_requirements_text for skill in user_skills):
                base_score += 0.2
            
            user_disabilities = [d.lower() for d in user_profile.get("disabilities", [])]
            job_disabilities = [d.name.lower() for d in job.disabilities_supported]
            if any(dis in job_disabilities for dis in user_disabilities):
                base_score += 0.3
        
        return min(base_score, 1.0)
    
    # Extract keywords from query
    keywords = extract_keywords(query_lower)
    
    # Title match (highest weight - 40%)
    title_score = calculate_word_match_score(job.title, keywords)
    score += title_score * 0.4
    
    # Description match (30%)
    desc_score = calculate_word_match_score(job.description[:500], keywords)  # First 500 chars
    score += desc_score * 0.3
    
    # Requirements match (20%)
    req_text = " ".join([req.requirement for req in job.requirements])
    req_score = calculate_word_match_score(req_text, keywords)
    score += req_score * 0.2
    
    # Company name match (5%)
    if job.company:
        company_score = calculate_word_match_score(job.company.name, keywords)
        score += company_score * 0.05
    
    # User profile matching (bonus points)
    if user_profile:
        # Match user skills with job requirements
        user_skills = [s.lower() for s in user_profile.get("skills", [])]
        job_requirements_text = " ".join([req.requirement.lower() for req in job.requirements])
        
        skill_matches = sum(1 for skill in user_skills if skill in job_requirements_text)
        if skill_matches > 0:
            score += min(skill_matches * 0.1, 0.15)  # Max 15% bonus
        
        # Match user disabilities with job support
        user_disabilities = [d.lower() for d in user_profile.get("disabilities", [])]
        job_disabilities = [d.name.lower() for d in job.disabilities_supported]
        if any(dis in job_disabilities for dis in user_disabilities):
            score += 0.15  # 15% bonus for disability match
        
        # Match preferred job type
        if user_profile.get("preferred_job_type"):
            pref_type = user_profile["preferred_job_type"].lower()
            if pref_type == job.employment_type.lower():
                score += 0.1  # 10% bonus
            if pref_type == job.remote_type.lower():
                score += 0.1  # 10% bonus
    
    # Normalize score to 0-1 range
    return min(score, 1.0)


def intelligent_job_search(
    db: Session,
    query: Optional[str] = None,
    disability_ids: Optional[List[int]] = None,
    skill_ids: Optional[List[int]] = None,
    employment_type: Optional[str] = None,
    remote_type: Optional[str] = None,
    user_profile: Optional[Dict] = None,
    limit: int = 20,
) -> List[Dict]:
    """
    Perform intelligent job search with relevance scoring
    Only returns results if at least one filter or query is provided
    """
    # Check if any filter or query is provided
    has_query = query and query.strip()
    # Only count filters if they have actual values (not "All" / empty)
    has_filters = bool(
        (disability_ids and len(disability_ids) > 0) or 
        (skill_ids and len(skill_ids) > 0) or 
        (employment_type and employment_type.strip()) or 
        (remote_type and remote_type.strip())
    )
    
    # If no query and no filters, return ALL jobs (when "All" is selected)
    if not has_query and not has_filters:
        # Return all jobs when no filters selected
        job_query = db.query(models.Job)
        jobs = job_query.limit(limit * 2).all()
        
        # Score all jobs (they'll all get similar scores)
        jobs_with_scores = []
        for job in jobs:
            score = calculate_relevance_score(job, "", user_profile)
            jobs_with_scores.append((job, score))
        
        # Sort by score (or posted_at if scores similar)
        jobs_with_scores.sort(key=lambda x: (x[1], x[0].posted_at or datetime.min), reverse=True)
        top_jobs = jobs_with_scores[:limit]
        
        # Format results
        results = []
        for job, score in top_jobs:
            requirements = [req.requirement for req in job.requirements]
            disability_support = [d.name for d in job.disabilities_supported]
            
            results.append({
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "company_name": job.company.name if job.company else None,
                "company_id": job.company_id,
                "location_city": job.location.city if job.location else None,
                "location_country": job.location.country if job.location else None,
                "location": f"{job.location.city}, {job.location.country}" if job.location else None,
                "employment_type": job.employment_type,
                "remote_type": job.remote_type,
                "required_skills": requirements,
                "disability_support": disability_support,
                "posted_at": job.posted_at.isoformat() if job.posted_at else None,
                "relevance_score": round(score, 2),
            })
        
        return results
    
    # Start with base query
    job_query = db.query(models.Job)
    
    # Apply filters
    if disability_ids:
        job_query = job_query.join(models.job_disability_support).filter(
            models.job_disability_support.c.disability_id.in_(disability_ids)
        )
    
    # Filter by skills (search in job requirements)
    if skill_ids:
        # Get skill names from skill IDs
        skills = db.query(models.Skill).filter(models.Skill.id.in_(skill_ids)).all()
        skill_names = [skill.name.lower() for skill in skills]
        
        if skill_names:
            # Join with requirements and filter by skill names
            job_query = job_query.join(models.JobRequirement).filter(
                or_(*[func.lower(models.JobRequirement.requirement).like(f"%{name}%") for name in skill_names])
            ).distinct()
    
    if employment_type:
        job_query = job_query.filter(models.Job.employment_type == employment_type)
    
    if remote_type:
        job_query = job_query.filter(models.Job.remote_type == remote_type)
    
    # More flexible text search - get all jobs if filters exist, or broader search if query exists
    # We'll score them all intelligently instead of strict filtering
    if has_query:
        # Extract keywords for flexible matching
        keywords = extract_keywords(query.strip())
        
        # Build flexible search - match any keyword in title or description
        if keywords:
            # Search for any keyword (OR logic) - more flexible
            search_conditions = []
            for keyword in keywords:
                search_term = f"%{keyword}%"
                search_conditions.extend([
                    models.Job.title.like(search_term),
                    models.Job.description.like(search_term)
                ])
                # Also search in requirements
                search_conditions.append(
                    models.JobRequirement.requirement.like(search_term)
                )
            
            # Join with requirements for flexible search
            job_query = job_query.outerjoin(models.JobRequirement).filter(
                or_(*search_conditions)
            ).distinct()
        else:
            # Fallback: simple search if no keywords extracted
            search_term = f"%{query.strip()}%"
            job_query = job_query.filter(
                or_(
                    models.Job.title.like(search_term),
                    models.Job.description.like(search_term)
                )
            )
    # If only filters (no query), get all jobs matching filters
    # They will be scored based on filters and user profile
    
    # Get MORE jobs to score intelligently (we'll filter by relevance score)
    # Increase limit when filters only (no query) to show more results
    fetch_limit = limit * 5 if has_query else limit * 10
    jobs = job_query.limit(fetch_limit).all()
    
    # Calculate relevance scores for all jobs
    jobs_with_scores = []
    for job in jobs:
        score = calculate_relevance_score(job, query or "", user_profile)
        # Very flexible - accept jobs with any match (lower threshold)
        min_score = 0.05 if has_query else 0.0  # Lower threshold for more results
        if score >= min_score:
            jobs_with_scores.append((job, score))
    
    # Sort by relevance score (descending) - most relevant first
    jobs_with_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Take top N jobs (most relevant appear first)
    top_jobs = jobs_with_scores[:limit]
    
    # Format results
    results = []
    for job, score in top_jobs:
        requirements = [req.requirement for req in job.requirements]
        disability_support = [d.name for d in job.disabilities_supported]
        
        results.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "company_name": job.company.name if job.company else None,
            "company_id": job.company_id,
            "location_city": job.location.city if job.location else None,
            "location_country": job.location.country if job.location else None,
            "location": f"{job.location.city}, {job.location.country}" if job.location else None,
            "employment_type": job.employment_type,
            "remote_type": job.remote_type,
            "required_skills": requirements,
            "disability_support": disability_support,
            "posted_at": job.posted_at.isoformat() if job.posted_at else None,
            "relevance_score": round(score, 2),  # Include relevance score
        })
    
    return results


def filter_jobs_for_chat(jobs: List[Dict], user_message: str, user_profile: Optional[Dict] = None) -> List[Dict]:
    """
    Intelligently filter jobs for chatbot context
    Prioritize jobs matching user's disabilities and exclude already applied jobs
    """
    if not jobs:
        return []
    
    # Extract keywords from user message
    message_lower = user_message.lower()
    keywords = [word for word in message_lower.split() if len(word) > 3]
    
    # Job-related keywords to look for
    job_keywords = [
        "python", "javascript", "developer", "programmer", "engineer",
        "remote", "full-time", "part-time", "contract",
        "data entry", "customer service", "writer", "designer",
        "manager", "assistant", "specialist", "analyst"
    ]
    
    # Check if user is asking about specific jobs
    is_job_query = any(keyword in message_lower for keyword in [
        "job", "position", "opening", "vacancy", "career", "work", "hire", "employment",
        "find", "search", "looking", "available", "opportunity", "recommend", "suggest"
    ])
    
    # Get user's applied job IDs to exclude (unless they ask about applications)
    applied_job_ids = []
    if user_profile and "applied_job_ids" in user_profile:
        applied_job_ids = user_profile["applied_job_ids"]
    
    asking_about_applications = any(word in message_lower for word in [
        "applied", "application", "my applications", "status"
    ])
    
    # Filter jobs based on relevance
    relevant_jobs = []
    for job in jobs:
        # Skip jobs user has already applied to (unless asking about applications)
        if not asking_about_applications and job.get("id") in applied_job_ids:
            continue
        
        relevance = 0
        
        # HIGHEST PRIORITY: Disability match
        if user_profile:
            user_disabilities = [d.lower() for d in user_profile.get("disabilities", [])]
            job_disabilities = [d.lower() for d in job.get("disability_support", [])]
            if user_disabilities and job_disabilities:
                # Check for matches
                matches = sum(1 for ud in user_disabilities 
                            if any(ud in jd or jd in ud for jd in job_disabilities))
                if matches > 0:
                    relevance += 10 * matches  # Very high weight for disability match
        
        # Check title match
        title_lower = job.get("title", "").lower()
        if any(kw in title_lower for kw in keywords):
            relevance += 2
        if any(jk in title_lower for jk in job_keywords if jk in message_lower):
            relevance += 1
        
        # Check description match
        desc_lower = job.get("description", "").lower()
        if any(kw in desc_lower for kw in keywords):
            relevance += 1
        
        # Check user profile match (skills)
        if user_profile:
            user_skills = [s.lower() for s in user_profile.get("skills", [])]
            job_skills = [s.lower() for s in job.get("required_skills", [])]
            if any(us in " ".join(job_skills).lower() for us in user_skills):
                relevance += 2
        
        # Only include jobs with some relevance
        if relevance > 0:
            relevant_jobs.append((job, relevance))
    
    # Sort by relevance (disability matches first) and take top 5
    relevant_jobs.sort(key=lambda x: x[1], reverse=True)
    return [job for job, _ in relevant_jobs[:5]]

