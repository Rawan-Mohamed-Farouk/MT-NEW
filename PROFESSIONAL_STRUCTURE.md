# 🏗️ Professional Project Structure

## ✅ Completed Organization

The project has been reorganized into a professional, maintainable structure.

## 📁 Final Structure

```
k-main/
├── README.md                    # Main project documentation
├── PROJECT_STRUCTURE.md         # Complete structure documentation
├── SETUP_INSTRUCTIONS.md        # Quick setup guide
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables (gitignored)
├── .gitignore                   # Git ignore rules
├── run_backend.py              # Backend startup script
│
├── docs/                        # 📚 Documentation
│   ├── README.md               # Documentation index
│   ├── setup/                  # Setup guides
│   │   ├── README.md
│   │   ├── XAMPP_SETUP.md
│   │   └── SETUP_COMPLETE.md
│   ├── features/               # Feature documentation
│   │   ├── README.md
│   │   └── [All feature docs]
│   └── guides/                 # User guides
│       ├── README.md
│       └── ADMIN_LOGIN_GUIDE.md
│
├── backend/                     # 🐍 FastAPI Backend
│   ├── README.md               # Backend overview
│   ├── src/                    # Source code
│   │   ├── README.md           # Source documentation
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app
│   │   ├── config.py           # Configuration
│   │   ├── db/                 # Database
│   │   │   ├── README.md
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   ├── routes/             # API routes
│   │   │   ├── README.md
│   │   │   ├── __init__.py
│   │   │   ├── users.py
│   │   │   ├── jobs.py
│   │   │   ├── applications.py
│   │   │   ├── chat.py
│   │   │   ├── disabilities.py
│   │   │   └── tools.py
│   │   ├── rag/                # RAG chatbot
│   │   │   ├── README.md
│   │   │   ├── __init__.py
│   │   │   ├── rag_chat.py
│   │   │   ├── embedder.py
│   │   │   └── retriever.py
│   │   └── utils/              # Utilities
│   │       ├── README.md
│   │       ├── __init__.py
│   │       ├── security.py
│   │       ├── search_intelligence.py
│   │       └── pdf_extractor.py
│   └── scripts/                # Database scripts
│       ├── README.md
│       ├── create_admin_user.py
│       ├── migrations/         # Migration scripts
│       │   ├── migrate_disabilities.py
│       │   ├── migrate_tools.py
│       │   └── migrate_applications_table.py
│       └── seeds/              # Seed scripts
│           ├── seed_disabilities.py
│           ├── seed_assistive_tools.py
│           └── seed_jobs.py
│
├── frontend/                    # ⚛️ React Frontend
│   ├── README.md               # Frontend overview
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/                    # Source code
│   │   ├── README.md
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/         # React components
│   │   │   ├── README.md
│   │   │   └── [All components]
│   │   ├── pages/              # Page components
│   │   │   ├── README.md
│   │   │   └── [All pages]
│   │   ├── api/                # API client
│   │   │   ├── README.md
│   │   │   └── api.js
│   │   ├── context/            # React context
│   │   │   ├── README.md
│   │   │   └── AuthContext.jsx
│   │   └── utils/              # Utilities
│   │       ├── README.md
│   │       └── accessibility.js
│   └── public/                 # Static assets
│
└── uploads/                     # 📁 User Uploads
    ├── README.md
    ├── profiles/               # Profile photos
    │   └── .gitkeep
    └── cvs/                    # CV files
        └── .gitkeep
```

## 🔗 Folder Connections

### Backend Structure
- `main.py` → imports all routes
- Routes → use `db` models and `utils` functions
- RAG → uses `db` for job data
- Utils → shared utilities for routes

### Frontend Structure
- `App.jsx` → imports all pages
- Pages → use components and API
- Components → reusable UI elements
- API → centralized HTTP client
- Context → shared state management

### Cross-Connections
- Frontend API → Backend routes
- Backend routes → Database models
- Scripts → Database models
- Documentation → Explains all features

## 📝 README Files

Every folder has a README explaining:
- Purpose of the folder
- Files and their functions
- How to use the code
- Technologies used
- Key features

## 🗑️ Removed Files

- ❌ Old `backend/api/` folder
- ❌ Old `backend/models/` folder
- ❌ Old `backend/server/` folder
- ❌ Old `frontend/` HTML/CSS folder
- ❌ `ml notbooks/` folder (typo)
- ❌ Root level `index.html`
- ❌ Root level `package.json`
- ❌ All `__pycache__/` folders
- ❌ All `.pyc` files

## ✅ Professional Standards

- Clear folder structure
- Consistent naming
- README in every folder
- Proper imports
- Clean organization
- No unnecessary files
- Well-documented code

## 🚀 Running the Project

### Backend
```bash
python run_backend.py
# OR
uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

## 📚 Documentation

All documentation is organized in `docs/`:
- Setup guides
- Feature documentation
- User guides
- API documentation

