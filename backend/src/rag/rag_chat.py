from typing import Optional, List, Dict
from groq import Groq

from backend.src.config import settings


SYSTEM_PROMPT = """You are a helpful job assistant for people with disabilities. 
You have access to the user's profile, their application history, and a curated list of relevant job listings.

CRITICAL RESPONSE FORMAT:
- NO EMOJIS - Never use emojis in your responses
- NO PARAGRAPHS - Use bullet points, short sentences, or concise summaries
- BE CONCISE - Keep responses brief and to the point
- USE BULLET POINTS - Format information as lists when possible
- SHORT SENTENCES - Maximum 15-20 words per sentence

IMPORTANT GUIDELINES:
- Prioritize jobs that support the user's specific disabilities
- Consider the user's application history - don't recommend jobs they've already applied to (unless they ask)
- Match jobs to user's skills and preferences
- Be personalized and specific - mention why each job is good for their disability
- Recommend 2-3 best matching jobs with specific details (title, company, key requirements)
- Explain how each job accommodates their disability in brief points
- Be friendly, supportive, and informative but concise
- Always mention specific job titles and companies when recommending jobs
- Don't overwhelm the user with too many options - quality over quantity
- Format responses as bullet points or short summary sentences"""


def format_jobs_for_context(jobs: List[Dict], user_disabilities: Optional[List[str]] = None) -> str:
    """Format jobs data into a concise, readable context string, prioritizing disability matches"""
    if not jobs:
        return "No matching jobs found in the database."
    
    # Sort jobs: prioritize those matching user's disabilities
    if user_disabilities:
        def job_priority(job):
            disability_support = [d.lower() for d in job.get('disability_support', [])]
            user_dis_lower = [d.lower() for d in user_disabilities]
            # Count how many user disabilities are supported
            matches = sum(1 for ud in user_dis_lower if any(ud in ds or ds in ud for ds in disability_support))
            # Also check if user has applied (lower priority)
            applied_penalty = 1 if job.get('has_applied') else 0
            return (matches, -applied_penalty)
        
        jobs = sorted(jobs, key=job_priority, reverse=True)
    
    # Limit to top 5 most relevant jobs
    job_list = []
    for job in jobs[:5]:
        disability_support = job.get('disability_support', [])
        has_disability_match = False
        if user_disabilities and disability_support:
            user_dis_lower = [d.lower() for d in user_disabilities]
            dis_support_lower = [d.lower() for d in disability_support]
            has_disability_match = any(ud in ds or ds in ud for ud in user_dis_lower for ds in dis_support_lower)
        
        match_indicator = "PERFECT MATCH" if has_disability_match else ""
        applied_indicator = " (Already Applied)" if job.get('has_applied') else ""
        
        job_info = f"""{match_indicator}Job #{job.get('id', 'N/A')}: {job.get('title', 'N/A')} at {job.get('company', 'Unknown')}{applied_indicator}
Location: {job.get('location', 'Not specified')} | Type: {job.get('employment_type', 'N/A')} ({job.get('remote_type', 'N/A')})
Key Requirements: {', '.join(job.get('requirements', [])[:3])}
Disability Support: {', '.join(disability_support[:3]) if disability_support else 'Not specified'}
"""
        job_list.append(job_info)
    
    return "\n".join(job_list)


def chat_with_rag(message: str, user_profile: Optional[dict], jobs_data: Optional[List[Dict]] = None) -> str:
    """
    Chat with Groq AI assistant with access to job database.
    """
    if not settings.GROQ_API_KEY:
        return "GROQ_API_KEY is not configured. Please set it in your .env file."

    try:
        # Build context from user profile if available
        context_parts = []
        
        # Add user profile context
        if user_profile:
            # User disabilities - VERY IMPORTANT for recommendations
            if user_profile.get("disabilities"):
                disabilities_list = ', '.join(user_profile['disabilities'])
                context_parts.append(f"USER DISABILITIES: {disabilities_list}")
                context_parts.append("CRITICAL: Prioritize jobs that support these specific disabilities")
            
            # User's application history
            if user_profile.get("applied_jobs"):
                applied_titles = [app.get('job_title', 'Unknown') for app in user_profile['applied_jobs'][:5]]
                context_parts.append(f"Jobs user has already applied to: {', '.join(applied_titles)}")
                context_parts.append("NOTE: Don't recommend these jobs unless user specifically asks about them")
            
            if user_profile.get("skills"):
                context_parts.append(f"User skills: {', '.join(user_profile['skills'])}")
            if user_profile.get("location"):
                context_parts.append(f"User location: {user_profile['location']}")
            if user_profile.get("preferred_job_type"):
                context_parts.append(f"Preferred job type: {user_profile['preferred_job_type']}")
        
        # Add jobs database context (only relevant jobs are passed)
        user_disabilities = user_profile.get("disabilities") if user_profile else None
        if jobs_data:
            jobs_context = format_jobs_for_context(jobs_data, user_disabilities)
            context_parts.append(f"\nAvailable Job Listings (sorted by relevance to user's disabilities):\n{jobs_context}")
        else:
            context_parts.append("\nNote: No matching jobs found in the database.")
        
        # Build the prompt
        user_context = "\n".join(context_parts) if context_parts else ""
        
        prompt = f"""User Context:
{user_context}

User Question: {message}

CRITICAL RESPONSE FORMAT REQUIREMENTS:
- NO EMOJIS - Do not use any emojis in your response
- NO PARAGRAPHS - Use bullet points or short sentences only
- BE CONCISE - Keep response brief and summary-style
- MAXIMUM 100 words total response length
- Use bullet points for job recommendations
- One short sentence per point

CRITICAL INSTRUCTIONS:
1. Disability Matching: Prioritize jobs marked "PERFECT MATCH" - these support the user's specific disabilities
2. Application History: Don't recommend jobs marked "(Already Applied)" unless user specifically asks about them
3. Personalization: Briefly explain why each job matches their disability
4. Recommendations: Suggest 2-3 best matching jobs that support their disabilities
5. Be Specific: Mention job title, company, and accommodation in brief points
6. Be Supportive: Acknowledge their disability briefly
7. Keep Focused: Don't list all jobs - only the best matches
8. Format: Use bullet points, no paragraphs, no emojis, concise summary style"""

        # Call Groq API
        client = Groq(api_key=settings.GROQ_API_KEY)
        completion = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_completion_tokens=500,  # Reduced for concise responses
            top_p=1,
            stream=False,
        )
        
        response = completion.choices[0].message.content
        
        # Post-process to ensure no emojis and concise format
        # Remove any emojis that might have been included
        import re
        # Remove emoji patterns
        emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags
            u"\U00002702-\U000027B0"
            u"\U000024C2-\U0001F251"
            "]+", flags=re.UNICODE)
        response = emoji_pattern.sub('', response)
        
        # Ensure response is concise (limit to ~100 words)
        words = response.split()
        if len(words) > 100:
            response = ' '.join(words[:100]) + '...'
        
        return response
        
    except Exception as e:
        error_msg = str(e)
        print(f"Groq API Error: {error_msg}")
        return (
            f"I'm sorry, I encountered an error: {error_msg}. "
            "Please check your GROQ_API_KEY in the .env file and try again."
        )

