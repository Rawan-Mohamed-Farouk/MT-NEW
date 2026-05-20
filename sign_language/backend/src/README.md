# Backend Source Code

## 📁 Directory Structure

### `main.py`
FastAPI application entry point. Configures CORS, includes routers, and serves static files.

### `config.py`
Configuration settings loaded from environment variables:
- Database connection settings
- API keys (OpenAI, Groq)
- ChromaDB settings

### `db/`
Database layer:
- **database.py**: Database connection and session management
- **models.py**: SQLAlchemy ORM models for all database tables

### `routes/`
API route handlers:
- **users.py**: User registration, login, profile management
- **jobs.py**: Job CRUD operations and intelligent search
- **applications.py**: Job application submission and review
- **chat.py**: Chatbot endpoint with RAG integration
- **disabilities.py**: Disability management (CRUD)
- **tools.py**: Assistive tools management

### `rag/`
RAG (Retrieval-Augmented Generation) chatbot:
- **rag_chat.py**: Main chat logic using Groq
- **embedder.py**: Text embedding generation (OpenAI)
- **retriever.py**: Vector database retrieval (ChromaDB)

### `utils/`
Utility functions:
- **security.py**: Input validation, sanitization, rate limiting
- **search_intelligence.py**: Intelligent job search with fuzzy matching
- **pdf_extractor.py**: PDF text extraction for CVs

## 🔄 Data Flow

1. **Request** → FastAPI route handler
2. **Validation** → Security utilities
3. **Database** → SQLAlchemy models
4. **Processing** → Business logic
5. **Response** → JSON response

## 🛠️ Key Features

- RESTful API design
- Input validation and sanitization
- Rate limiting
- Error handling
- Database transactions
- File upload handling

