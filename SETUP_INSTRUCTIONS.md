# 🚀 Setup Instructions

## Quick Start Guide

### 1. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.k .env
# Edit .env with your settings

# Run migrations
python backend/scripts/migrations/migrate_disabilities.py
python backend/scripts/migrations/migrate_tools.py

# Seed database
python backend/scripts/seeds/seed_disabilities.py
python backend/scripts/seeds/seed_assistive_tools.py
python backend/scripts/seeds/seed_jobs.py

# Create admin user
python backend/scripts/create_admin_user.py admin@test.com admin123456

# Start backend
uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for complete structure.

## 📚 Documentation

- [Main README](README.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Documentation Index](docs/README.md)

