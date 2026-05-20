# Utility Functions

## 📁 Files

### `security.py`
Security utilities:
- **sanitize_input()**: XSS prevention
- **validate_email()**: Email validation
- **validate_name()**: Name validation
- **validate_phone()**: Phone validation
- **check_rate_limit()**: Rate limiting
- **validate_integer_id()**: ID validation
- **validate_string_length()**: Length validation

### `search_intelligence.py`
Intelligent search utilities:
- **extract_keywords()**: Extract keywords from query
- **get_synonyms()**: Get synonyms for words
- **calculate_word_match_score()**: Fuzzy matching score
- **calculate_relevance_score()**: Job relevance scoring
- **intelligent_job_search()**: Main search function
- **filter_jobs_for_chat()**: Chat-specific filtering

**Key Features:**
- Fuzzy matching
- Synonym support
- Relevance scoring
- Disability prioritization

### `pdf_extractor.py`
PDF processing utilities:
- **extract_text_from_pdf()**: Extract text from PDF
- **extract_cv_info()**: Extract structured CV data
- **parse_skills()**: Extract skills from text
- **parse_experience()**: Extract experience years

**Key Features:**
- PDF text extraction
- Structured data parsing
- Error handling
- Multiple format support

## 🔧 Usage

```python
from backend.src.utils.security import sanitize_input, validate_email
from backend.src.utils.search_intelligence import intelligent_job_search

# Sanitize input
clean_text = sanitize_input(user_input)

# Validate email
if validate_email(email):
    # Process email
    pass

# Intelligent search
results = intelligent_job_search(db, query="developer", user_profile=profile)
```

## 🛡️ Security Features

- Input sanitization
- XSS prevention
- SQL injection prevention
- Rate limiting
- Input validation

