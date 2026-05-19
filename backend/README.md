# Backend - FastAPI Application

## 📁 Structure

```
backend/
├── src/                    # Source code
│   ├── main.py           # FastAPI app entry point
│   ├── config.py         # Configuration settings
│   ├── db/               # Database layer
│   │   ├── database.py   # Database connection
│   │   └── models.py     # SQLAlchemy models
│   ├── routes/           # API routes
│   │   ├── users.py      # User management
│   │   ├── jobs.py       # Job management
│   │   ├── applications.py # Application handling
│   │   ├── chat.py       # Chatbot endpoint
│   │   ├── disabilities.py # Disability management
│   │   └── tools.py       # Assistive tools
│   ├── rag/              # RAG chatbot
│   │   ├── rag_chat.py   # Chat logic
│   │   ├── embedder.py   # Text embeddings
│   │   └── retriever.py  # Vector retrieval
│   └── utils/            # Utilities
│       ├── security.py   # Security functions
│       ├── search_intelligence.py # Smart search
│       └── pdf_extractor.py # PDF processing
└── scripts/              # Database scripts
    ├── migrations/       # Migration scripts
    └── seeds/           # Seed data scripts
```

## 🚀 Getting Started

### Installation

```bash
pip install -r requirements.txt
```

### Configuration

Create `.env` file in project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=rag_jobs
OPENAI_API_KEY=your_key
GROQ_API_KEY=your_key
GROQ_MODEL=openai/gpt-oss-120b
```

### Running

```bash
uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000
```

## 📡 API Endpoints

### Users
- `POST /users/add_user` - Register user
- `POST /users/login` - User login
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user
- `GET /users` - List all users

### Jobs
- `POST /jobs/add_job` - Create job
- `POST /jobs/search_jobs` - Search jobs
- `GET /jobs/{id}` - Get job details
- `PUT /jobs/{id}` - Update job
- `DELETE /jobs/{id}` - Delete job
- `GET /jobs` - List all jobs

### Applications
- `POST /applications/apply` - Submit application
- `GET /applications/user/{user_id}` - User applications
- `GET /applications/pending` - Pending applications
- `PUT /applications/{id}/review` - Review application

### Chat
- `POST /chat` - Chat with AI assistant

### Disabilities
- `GET /disabilities` - List disabilities
- `POST /disabilities` - Add disability
- `PUT /disabilities/{id}` - Update disability
- `DELETE /disabilities/{id}` - Delete disability

### Tools
- `GET /tools` - List tools
- `GET /tools/for-user/{user_id}` - User recommendations
- `POST /tools` - Add tool
- `PUT /tools/{id}` - Update tool
- `DELETE /tools/{id}` - Delete tool

## 🔧 Technologies

- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **MySQL** - Database
- **Groq** - LLM
- **OpenAI** - Embeddings
- **Werkzeug** - Security

## 📝 Database Models

- `User` - User accounts
- `Disability` - Disability types
- `Skill` - Skills
- `Job` - Job listings
- `Company` - Companies
- `Location` - Locations
- `JobApplication` - Applications
- `AssistiveTool` - Assistive tools

## 🔒 Security

- Password hashing
- Input validation
- Rate limiting
- SQL injection prevention
- XSS protection

