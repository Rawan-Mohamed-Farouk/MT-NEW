# EmpowerWork - Job Assistance Platform for People with Disabilities

## 🎯 Project Overview

EmpowerWork is a comprehensive job assistance platform designed specifically for people with disabilities. It provides intelligent job matching, personalized recommendations, assistive tools, an AI-powered chatbot, and accessibility-first UI to support inclusive employment.

## 👥 Project Team

- **Khaled Ghalwash**
- **Rawan mohamed**
- **Mohamed Gamal**
- **Mohamed Hassen**
- **Mazen**
- **Nadeen**

## 🏗️ Project Structure

```
k-main/
├── README.md                 # This file - Main project documentation
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (create from .env.example)
├── docs/                     # All project documentation
│   ├── setup/               # Setup guides
│   ├── features/            # Feature documentation
│   └── guides/              # User and admin guides
├── backend/                 # FastAPI Backend
│   ├── src/                # Source code
│   │   ├── main.py        # FastAPI application entry point
│   │   ├── config.py      # Configuration settings
│   │   ├── db/            # Database models and connection
│   │   ├── routes/        # API route handlers
│   │   ├── rag/           # RAG chatbot implementation
│   │   └── utils/         # Utility functions
│   └── scripts/            # Database scripts
│       ├── migrations/    # Database migration scripts
│       └── seeds/         # Data seeding scripts
├── frontend/               # React Frontend
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client
│   │   ├── context/       # React context providers
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── uploads/               # User uploads (profiles, CVs)
    ├── profiles/          # Profile photos
    └── cvs/               # CV files
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- XAMPP (MySQL/MariaDB)
- MySQL running on localhost

### Backend Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run Migrations**
   ```bash
   python backend/scripts/migrations/migrate_disabilities.py
   python backend/scripts/migrations/migrate_tools.py
   ```

4. **Seed Database**
   ```bash
   python backend/scripts/seeds/seed_disabilities.py
   python backend/scripts/seeds/seed_assistive_tools.py
   python backend/scripts/seeds/seed_jobs.py
   ```

5. **Start Backend**
   ```bash
   uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup (React + Vite)

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

> **Note**: Make sure MySQL is running in XAMPP and `.env` is configured (copied from `env.khaled` without committing secrets to Git).

## 📚 Documentation

- **[Setup Guide](docs/setup/)** - Installation and configuration
- **[Features](docs/features/)** - Feature documentation
- **[User Guides](docs/guides/)** - User and admin guides

## 🛠️ Technologies

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **MySQL/MariaDB** - Database (via XAMPP)
- **Groq** - LLM for intelligent chatbot
- **OpenAI** - Embeddings for semantic search
- **Werkzeug** - Password hashing
- **PyPDF2** - PDF processing

### Frontend
- **React.js** - UI framework
- **TailwindCSS** - Utility-first CSS
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### AI & Intelligence
- **Groq Whisper (whisper-large-v3-turbo)** - Speech-to-text for voice input
- **Groq LLM** - Personalized job recommendations in the chatbot
- **OpenAI Embeddings** - Semantic search and future vector search
- **ChromaDB** - Vector store (for RAG and semantic retrieval)

## ✨ Key Features

- **Intelligent Job Matching** - AI-powered job recommendations based on disabilities
- **Disability Management** - Comprehensive disability system with 25+ types
- **Assistive Tools** - 24+ tools and resources for various disabilities
- **Accessible Design** - WCAG AA compliant with accessibility controls
- **Admin Dashboard** - Complete admin interface for managing the platform
- **Chatbot Assistant** - Intelligent chatbot with disability-aware recommendations
- **Application System** - Job application tracking with CV processing
- **Voice Interaction** - Speech-to-text for sending messages and text-to-speech for reading chatbot replies

## 🔐 Security Features

- Password hashing (Werkzeug)
- Input sanitization and validation
- Rate limiting
- SQL injection prevention
- XSS protection
- CORS configuration

## 📝 License

This project is proprietary software.

## 📩 Support & Contact

For issues and questions, please refer to the documentation in the `docs/` folder.

For academic or technical inquiries about this graduation project, please contact the project team (Khaled Ghalwash). 
