# API Routes

## 📁 Route Handlers

### `users.py`
User management endpoints:
- Registration with photo upload
- Login with authentication
- Profile management
- User CRUD operations

**Key Features:**
- Password hashing (Werkzeug)
- Photo upload handling
- Disability and skill associations
- Input validation

### `jobs.py`
Job management endpoints:
- Job creation and editing
- Intelligent job search
- Job filtering and sorting
- Relevance scoring

**Key Features:**
- Fuzzy matching
- Synonym support
- Disability-based matching
- User profile integration

### `applications.py`
Job application endpoints:
- Application submission
- CV upload and extraction
- Manual entry option
- Application review (admin)

**Key Features:**
- PDF processing
- CV information extraction
- Application status tracking
- Admin review workflow

### `chat.py`
Chatbot endpoint:
- AI-powered job assistant
- Disability-aware recommendations
- Application history awareness
- Personalized responses

**Key Features:**
- Groq integration
- Context-aware responses
- Job filtering for chat
- User profile integration

### `disabilities.py`
Disability management endpoints:
- Disability CRUD operations
- Category filtering
- Safety checks for deletion

**Key Features:**
- Category organization
- Description and icon support
- Validation and sanitization

### `tools.py`
Assistive tools endpoints:
- Tool CRUD operations
- User-specific recommendations
- Category and platform filtering

**Key Features:**
- Disability-tool associations
- Personalized recommendations
- Platform filtering
- Cost information

## 🔐 Security

All routes include:
- Input validation
- Rate limiting
- SQL injection prevention
- XSS protection
- Error handling

## 📝 Request/Response Format

All endpoints follow RESTful conventions:
- `GET` - Retrieve data
- `POST` - Create data
- `PUT` - Update data
- `DELETE` - Delete data

Responses are JSON format with consistent error handling.

