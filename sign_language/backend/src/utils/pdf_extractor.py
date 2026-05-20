"""
PDF CV extraction utility
Extracts information from uploaded CV PDFs
"""
import re
from typing import Dict, Optional
import PyPDF2
import io


def extract_text_from_pdf(pdf_file) -> str:
    """Extract text content from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""


def extract_email(text: str) -> Optional[str]:
    """Extract email address from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    matches = re.findall(email_pattern, text)
    return matches[0] if matches else None


def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text"""
    # Various phone number patterns
    patterns = [
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # US format
        r'\b\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b',  # International
        r'\b\d{10,}\b',  # 10+ digits
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text)
        if matches:
            return matches[0]
    return None


def extract_name(text: str) -> Optional[str]:
    """Extract name from CV (usually first line or after 'Name:' pattern)"""
    lines = text.split('\n')[:10]  # Check first 10 lines
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Look for "Name:" pattern
        if 'name:' in line.lower():
            name = line.split(':', 1)[1].strip()
            if len(name.split()) >= 2:  # First and last name
                return name
        # Check if line looks like a name (2-4 words, capitalized)
        words = line.split()
        if 2 <= len(words) <= 4:
            if all(word[0].isupper() for word in words if word):
                return line
    
    return None


def extract_skills(text: str) -> list:
    """Extract skills from CV"""
    # Common skill keywords
    skill_keywords = [
        'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
        'react', 'vue', 'angular', 'node', 'django', 'flask', 'spring',
        'sql', 'mysql', 'postgresql', 'mongodb',
        'html', 'css', 'sass', 'bootstrap',
        'git', 'docker', 'kubernetes', 'aws', 'azure',
        'machine learning', 'ai', 'data science', 'analytics',
        'project management', 'agile', 'scrum',
        'communication', 'leadership', 'teamwork', 'problem solving'
    ]
    
    text_lower = text.lower()
    found_skills = []
    for skill in skill_keywords:
        if skill in text_lower:
            found_skills.append(skill.title())
    
    return list(set(found_skills))  # Remove duplicates


def extract_experience(text: str) -> Optional[str]:
    """Extract years of experience"""
    patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
        r'experience[:\s]+(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*in',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def extract_education(text: str) -> list:
    """Extract education information"""
    education_keywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'university', 'college']
    lines = text.split('\n')
    education = []
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in education_keywords):
            # Get the line and next few lines as context
            context = ' '.join(lines[max(0, i-1):i+3])
            education.append(context.strip())
    
    return education[:3]  # Return top 3


def extract_cv_info(pdf_file) -> Dict:
    """
    Extract structured information from CV PDF
    Returns dictionary with extracted information
    """
    text = extract_text_from_pdf(pdf_file)
    
    if not text:
        return {
            "error": "Could not extract text from PDF",
            "raw_text": ""
        }
    
    info = {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "experience_years": extract_experience(text),
        "education": extract_education(text),
        "raw_text": text[:2000],  # First 2000 chars for reference
        "extraction_success": True
    }
    
    return info

