# RAG (Retrieval-Augmented Generation) System Explanation

## Overview

The RAG system in EmpowerWork is an intelligent chatbot that provides personalized job recommendations for people with disabilities. It combines **Retrieval** (fetching relevant data from the database) with **Augmented Generation** (using AI to generate contextual responses).

## What is RAG?

**RAG (Retrieval-Augmented Generation)** is a technique that:
1. **Retrieves** relevant information from a knowledge base (database)
2. **Augments** the AI's context with this retrieved information
3. **Generates** responses based on both the user's query and the retrieved data

This approach ensures the AI has access to up-to-date, relevant information rather than relying solely on its training data.

## How Our RAG System Works

### Architecture Overview

```
User Message
    ↓
[Retrieval Layer]
    ├── User Profile (Disabilities, Skills, History)
    ├── Job Database (50 jobs with relationships)
    └── Application History
    ↓
[Intelligence Layer]
    ├── Job Filtering (relevance scoring)
    ├── Disability Matching (priority)
    └── Context Formatting
    ↓
[Generation Layer]
    ├── Context Building
    ├── Prompt Construction
    └── Groq API Call
    ↓
[Post-Processing]
    ├── Emoji Removal
    ├── Word Limiting (100 words)
    └── Format Validation
    ↓
Response to User
```

## Detailed Workflow

### Step 1: User Message Reception
- User sends a message through the chat interface
- System validates input (length, sanitization)
- Rate limiting check (20 requests per 60 seconds)

### Step 2: Data Retrieval (Retrieval Phase)

#### 2.1 User Profile Retrieval
If `user_id` is provided:
- **Load User Data** with eager loading:
  - User disabilities (many-to-many relationship)
  - User skills (many-to-many relationship)
  - User location, preferred job type, experience level

- **Load Application History**:
  - Last 10 applications with job details
  - Extract applied job IDs
  - Build applied jobs info list

- **Build User Profile Dictionary**:
  ```python
  {
      "disabilities": ["Visual Impairment", "Hearing Loss"],
      "skills": ["Python", "JavaScript"],
      "location": "New York",
      "preferred_job_type": "remote",
      "applied_jobs": [...],
      "applied_job_ids": [1, 5, 10]
  }
  ```

#### 2.2 Job Database Retrieval
- **Load All Jobs** (limit 50) with eager loading:
  - Company information
  - Location information
  - Job requirements
  - Disability support information

- **Transform to Job Data List**:
  ```python
  {
      "id": 1,
      "title": "Software Developer",
      "company": "TechCorp",
      "location": "Remote",
      "requirements": ["Python", "Django"],
      "disability_support": ["Visual Impairment", "Mobility"],
      "has_applied": False
  }
  ```

### Step 3: Intelligent Filtering (Intelligence Layer)

#### 3.1 Job Filtering Function (`filter_jobs_for_chat`)
The system uses `search_intelligence.py` to filter jobs:

1. **Extract Keywords** from user message
   - Remove stop words
   - Extract meaningful terms (2+ characters)

2. **Calculate Relevance Score** for each job:
   - **Disability Match** (Highest Priority - 10 points per match):
     - Checks if job supports user's disabilities
     - Example: User has "Visual Impairment" → Job supports "Visual Impairment" = +10 points
   
   - **Title Match** (+2 points):
     - Keywords found in job title
   
   - **Description Match** (+1 point):
     - Keywords found in job description
   
   - **Skill Match** (+2 points):
     - User skills match job requirements

3. **Exclude Applied Jobs**:
   - Skip jobs user has already applied to
   - Exception: If user asks about applications, include them

4. **Sort by Relevance**:
   - Highest relevance first (disability matches prioritized)
   - Return top 5 most relevant jobs

#### 3.2 Job Formatting (`format_jobs_for_context`)
Format filtered jobs for AI context:

1. **Sort Jobs by Priority**:
   - Jobs matching user disabilities first
   - Applied jobs marked with "(Already Applied)"
   - Perfect matches marked with "PERFECT MATCH"

2. **Format Job Information**:
   ```
   PERFECT MATCH Job #1: Software Developer at TechCorp
   Location: Remote | Type: full-time (remote)
   Key Requirements: Python, Django, REST API
   Disability Support: Visual Impairment, Mobility
   ```

3. **Limit to Top 5 Jobs**:
   - Only most relevant jobs included
   - Reduces token usage
   - Focuses AI on best matches

### Step 4: Context Building (Augmentation Phase)

#### 4.1 User Context
Build user context string:
```
USER DISABILITIES: Visual Impairment, Hearing Loss
CRITICAL: Prioritize jobs that support these specific disabilities
User skills: Python, JavaScript, React
User location: New York
Preferred job type: remote
Jobs user has already applied to: Software Developer at TechCorp, Data Analyst at DataInc
NOTE: Don't recommend these jobs unless user specifically asks about them
```

#### 4.2 Job Context
Add formatted job listings:
```
Available Job Listings (sorted by relevance to user's disabilities):
PERFECT MATCH Job #1: Software Developer at TechCorp
Location: Remote | Type: full-time (remote)
Key Requirements: Python, Django, REST API
Disability Support: Visual Impairment, Mobility

Job #2: Frontend Developer at WebCorp
...
```

#### 4.3 System Prompt
Pre-defined system instructions:
```
You are a helpful job assistant for people with disabilities.
- Prioritize jobs that support the user's specific disabilities
- Don't recommend jobs they've already applied to
- Be concise (max 100 words, bullet points, no emojis)
- Recommend 2-3 best matching jobs
```

### Step 5: Prompt Construction

Final prompt sent to Groq API:
```
User Context:
[User profile information]
[Job listings]

User Question: [User's message]

CRITICAL RESPONSE FORMAT REQUIREMENTS:
- NO EMOJIS
- NO PARAGRAPHS
- BE CONCISE (max 100 words)
- Use bullet points

CRITICAL INSTRUCTIONS:
1. Prioritize jobs marked "PERFECT MATCH"
2. Don't recommend jobs marked "(Already Applied)"
3. Suggest 2-3 best matching jobs
4. Explain how each job accommodates their disability
```

### Step 6: AI Generation (Generation Phase)

#### 6.1 Groq API Call
- **Model**: Configured in settings (e.g., `openai/gpt-oss-120b`)
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 500 (ensures concise responses)
- **Messages**:
  - System message: System prompt
  - User message: Full prompt with context

#### 6.2 AI Response
Groq API returns a response based on:
- User's question
- User profile context
- Available job listings
- System instructions

### Step 7: Post-Processing

#### 7.1 Emoji Removal
- Remove all emoji patterns using regex
- Ensures clean, professional responses

#### 7.2 Word Limiting
- Count words in response
- If > 100 words, truncate to first 100 words
- Add "..." if truncated

#### 7.3 Format Validation
- Ensure bullet points format
- Verify no paragraphs
- Check conciseness

### Step 8: Response Delivery
- Return formatted response to frontend
- Display in chat interface
- User sees personalized job recommendations

## Key Features

### 1. Disability-Aware Recommendations
- **Highest Priority**: Jobs that support user's specific disabilities
- **Matching Logic**: Checks if user's disabilities match job's disability support
- **Marking**: "PERFECT MATCH" indicator for best matches

### 2. Application History Awareness
- **Tracks Applied Jobs**: Knows which jobs user has already applied to
- **Exclusion Logic**: Doesn't recommend applied jobs (unless asked)
- **Status Awareness**: Can discuss application status if asked

### 3. Intelligent Filtering
- **Relevance Scoring**: Multi-factor scoring system
- **Keyword Matching**: Flexible keyword extraction and matching
- **Skill Matching**: Considers user's skills vs job requirements

### 4. Contextual Responses
- **Personalized**: Uses user's profile, skills, location
- **Relevant**: Only includes top 5 most relevant jobs
- **Concise**: Limited to 100 words, bullet points

### 5. Response Format Control
- **No Emojis**: Professional, accessible format
- **Bullet Points**: Easy to read, scannable
- **Short Sentences**: Maximum 15-20 words per sentence

## Technical Implementation

### Components

1. **`rag_chat.py`**:
   - `chat_with_rag()`: Main RAG function
   - `format_jobs_for_context()`: Job formatting
   - System prompt definition
   - Post-processing functions

2. **`search_intelligence.py`**:
   - `filter_jobs_for_chat()`: Job filtering logic
   - Keyword extraction
   - Relevance scoring

3. **`routes/chat.py`**:
   - API endpoint handler
   - Data retrieval (user profile, jobs)
   - Integration with RAG system

### Database Queries

**Eager Loading** to prevent N+1 queries:
```python
# User with disabilities and skills
user = db.query(User)\
    .options(
        selectinload(User.disabilities),
        selectinload(User.skills)
    )\
    .filter(User.id == user_id).first()

# Jobs with all relationships
jobs = db.query(Job)\
    .options(
        joinedload(Job.company),
        joinedload(Job.location),
        selectinload(Job.requirements),
        selectinload(Job.disabilities)
    )\
    .limit(50)\
    .all()
```

### API Configuration

**Groq API Settings** (in `.env`):
```env
GROQ_API_KEY=your_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

**API Parameters**:
- Temperature: 0.7 (balanced)
- Max Completion Tokens: 500
- Top P: 1
- Stream: False

## Advantages of RAG Approach

1. **Up-to-Date Information**: Uses current database data, not training data
2. **Personalized**: Tailored to each user's profile and history
3. **Accurate**: Direct access to job listings and user data
4. **Efficient**: Only retrieves relevant information
5. **Controllable**: Can filter and format data before AI processing

## Limitations and Considerations

1. **Token Limits**: Limited to top 5 jobs to manage context size
2. **Rate Limiting**: 20 requests per 60 seconds per IP
3. **Database Dependency**: Requires database connection
4. **API Dependency**: Requires Groq API key and internet connection
5. **Response Length**: Fixed at 100 words maximum

## Future Enhancements

1. **Vector Embeddings**: Could use OpenAI embeddings for semantic search
2. **ChromaDB Integration**: Vector database for better job retrieval
3. **Conversation Memory**: Remember previous messages in conversation
4. **Multi-turn Dialogues**: Handle follow-up questions
5. **Feedback Loop**: Learn from user interactions

## Example Flow

**User Message**: "I'm looking for remote software jobs"

**System Process**:
1. Retrieves user profile (has Visual Impairment, knows Python)
2. Loads 50 jobs from database
3. Filters to jobs matching:
   - "remote" keyword
   - "software" keyword
   - Visual Impairment support
   - Python requirements
4. Scores and ranks jobs
5. Formats top 5 jobs for context
6. Builds prompt with user context + jobs
7. Sends to Groq API
8. Receives response
9. Removes emojis, limits to 100 words
10. Returns to user

**Response Example**:
```
• Software Developer at TechCorp (Remote)
  - Supports Visual Impairment
  - Requires Python, Django
  - Full-time remote position

• Frontend Developer at WebCorp (Remote)
  - Supports Visual Impairment
  - Requires JavaScript, React
  - Contract remote position
```

This RAG system ensures users get personalized, relevant, and up-to-date job recommendations based on their specific needs and disabilities.

