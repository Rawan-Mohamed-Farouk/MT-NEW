# Intelligent Search & Chatbot Features

## 🧠 Intelligent Search

### How It Works
1. **Relevance Scoring**: Each job gets a score (0.0 to 1.0) based on:
   - Title match: 40% weight
   - Description match: 30% weight  
   - Requirements match: 10% weight
   - User profile matching: 20% weight
     - Skills match: +10%
     - Disability support match: +20%
     - Preferred job type match: +15%

2. **Smart Filtering**: Jobs are sorted by relevance score (highest first)

3. **Personalized Results**: User profile boosts matching jobs

### Example
- User searches: "Python developer"
- User has skills: ["Python", "JavaScript"]
- User has disability: "Visual Impairment"
- Results show:
  1. "Remote Python Developer" (score: 0.9) - matches Python + remote preference
  2. "Frontend Web Developer" (score: 0.6) - matches JavaScript skill
  3. "Data Entry Specialist" (score: 0.3) - matches disability support

## 🤖 Intelligent Chatbot

### How It Works
1. **Message Analysis**: Extracts keywords from user message
2. **Job Filtering**: Only selects relevant jobs (not all jobs)
3. **Smart Context**: Sends only top 5 most relevant jobs to Groq
4. **Focused Responses**: Chatbot recommends 2-3 best matches

### Filtering Logic
- Checks if user is asking about jobs (keywords: "job", "position", "career", etc.)
- Matches keywords with job titles and descriptions
- Considers user profile (skills, disabilities, preferences)
- Only includes jobs with relevance score > 0

### Example Conversation
**User**: "I'm looking for remote Python jobs"

**Chatbot Response** (before):
- Lists all 8 jobs from database
- Overwhelming and not helpful

**Chatbot Response** (now):
- "I found 2 great remote Python positions for you:
  1. Remote Python Developer at RemoteFirst Inc - Fully remote, supports Visual Impairment
  2. Frontend Web Developer at TechAccess Solutions - Remote, uses Python and JavaScript
  Both positions match your skills and offer remote work options."

## 🔒 Security Features

### Input Validation
- All user inputs sanitized and validated
- Prevents XSS attacks
- Prevents SQL injection (using SQLAlchemy ORM)
- Length limits on all inputs

### Rate Limiting
- Search: 30 requests/minute
- Chat: 20 requests/minute  
- Login: 5 attempts/5 minutes
- Registration: 5 attempts/5 minutes

### Password Security
- Bcrypt hashing
- Minimum 8 characters
- Never stored in plain text

## 📈 Benefits

1. **Better User Experience**: Users see most relevant jobs first
2. **Faster Responses**: Chatbot doesn't process unnecessary data
3. **Lower Costs**: Less data sent to Groq API
4. **More Secure**: Protected against common attacks
5. **Personalized**: Results match user profile

## 🎯 Usage

### Search Jobs
- Go to http://localhost:3000
- Enter search query (e.g., "Python", "remote", "developer")
- Results sorted by relevance
- Each job shows relevance score

### Chatbot
- Go to http://localhost:3000/chat
- Ask: "Find me remote Python jobs"
- Chatbot filters and recommends only relevant jobs
- Responses are concise and focused

