# 📁 Professional Project Structure

## 🏗️ Complete Directory Tree

```
k-main/
├── README.md                          # Main project documentation
├── PROJECT_STRUCTURE.md               # This file
├── requirements.txt                   # Python dependencies
├── .env                               # Environment variables (not in git)
├── .gitignore                         # Git ignore rules
│
├── docs/                              # 📚 All Documentation
│   ├── README.md                      # Documentation index
│   ├── setup/                         # Setup guides
│   │   ├── XAMPP_SETUP.md
│   │   └── SETUP_COMPLETE.md
│   ├── features/                     # Feature documentation
│   │   ├── ACCESSIBILITY_FEATURES.md
│   │   ├── APPLICATION_SYSTEM.md
│   │   ├── ASSISTIVE_TOOLS_GUIDE.md
│   │   ├── CHATBOT_INTELLIGENCE_UPDATE.md
│   │   ├── DISABILITY_SYSTEM_GUIDE.md
│   │   ├── FEATURES_SUMMARY.md
│   │   ├── INTELLIGENT_FEATURES.md
│   │   ├── INTELLIGENT_SEARCH_UPDATE.md
│   │   └── SECURITY_FEATURES.md
│   └── guides/                       # User guides
│       └── ADMIN_LOGIN_GUIDE.md
│
├── backend/                           # 🐍 FastAPI Backend
│   ├── README.md                      # Backend overview
│   └── src/                           # Source code
│       ├── README.md                  # Source code documentation
│       ├── main.py                    # FastAPI app entry point
│       ├── config.py                  # Configuration
│       │
│       ├── db/                        # Database layer
│       │   ├── README.md              # Database documentation
│       │   ├── database.py            # DB connection
│       │   └── models.py              # SQLAlchemy models
│       │
│       ├── routes/                    # API routes
│       │   ├── README.md              # Routes documentation
│       │   ├── users.py               # User management
│       │   ├── jobs.py                # Job management
│       │   ├── applications.py        # Applications
│       │   ├── chat.py                # Chatbot
│       │   ├── disabilities.py        # Disabilities
│       │   └── tools.py               # Assistive tools
│       │
│       ├── rag/                       # RAG chatbot
│       │   ├── README.md              # RAG documentation
│       │   ├── rag_chat.py            # Chat logic
│       │   ├── embedder.py            # Embeddings
│       │   └── retriever.py           # Vector retrieval
│       │
│       └── utils/                     # Utilities
│           ├── README.md              # Utils documentation
│           ├── security.py            # Security functions
│           ├── search_intelligence.py  # Smart search
│           └── pdf_extractor.py       # PDF processing
│
│   └── scripts/                       # Database scripts
│       ├── README.md                  # Scripts documentation
│       ├── create_admin_user.py       # Admin creation
│       ├── migrations/                # Migration scripts
│       │   ├── migrate_disabilities.py
│       │   ├── migrate_tools.py
│       │   └── migrate_applications_table.py
│       └── seeds/                     # Seed scripts
│           ├── seed_disabilities.py
│           ├── seed_assistive_tools.py
│           └── seed_jobs.py
│
├── frontend/                          # ⚛️ React Frontend
│   ├── README.md                      # Frontend overview
│   ├── package.json                   # Dependencies
│   ├── vite.config.js                 # Vite config
│   ├── tailwind.config.js             # Tailwind config
│   │
│   ├── public/                        # Static assets
│   │   └── vite.svg
│   │
│   └── src/                           # Source code
│       ├── README.md                  # Source documentation
│       ├── main.jsx                   # Entry point
│       ├── App.jsx                    # Main app
│       ├── index.css                  # Global styles
│       │
│       ├── components/                 # React components
│       │   ├── README.md              # Components docs
│       │   ├── AccessibilityControls.jsx
│       │   ├── ApplicationModal.jsx
│       │   ├── ChatBox.jsx
│       │   ├── Footer.jsx
│       │   ├── JobCard.jsx
│       │   ├── JobForm.jsx
│       │   ├── Navbar.jsx
│       │   ├── Table.jsx
│       │   └── UserForm.jsx
│       │
│       ├── pages/                     # Page components
│       │   ├── README.md              # Pages docs
│       │   ├── Home.jsx
│       │   ├── Profile.jsx
│       │   ├── Chat.jsx
│       │   ├── Tools.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminUsers.jsx
│       │   ├── AdminJobs.jsx
│       │   ├── AdminCompanies.jsx
│       │   ├── AdminApplications.jsx
│       │   └── AdminDisabilities.jsx
│       │
│       ├── api/                       # API client
│       │   └── api.js
│       │
│       ├── context/                   # React context
│       │   └── AuthContext.jsx
│       │
│       └── utils/                     # Utilities
│           └── accessibility.js
│
└── uploads/                           # 📁 User Uploads
    ├── README.md                      # Uploads documentation
    ├── profiles/                      # Profile photos
    │   └── .gitkeep
    └── cvs/                           # CV files
        └── .gitkeep
```

## 🔗 Folder Connections

### Backend → Frontend
- Backend API serves frontend via CORS
- Frontend calls backend API endpoints
- Shared data models (User, Job, etc.)

### Backend Internal
- `main.py` → imports all routes
- Routes → use `db` and `utils`
- RAG → uses `db` for job data
- Utils → used by routes

### Frontend Internal
- `App.jsx` → imports all pages
- Pages → use components and API
- Components → reusable UI elements
- API → centralized HTTP client

## 📝 File Organization Rules

1. **Backend**: All Python code in `backend/src/`
2. **Frontend**: All React code in `frontend/src/`
3. **Scripts**: Database scripts in `backend/scripts/`
4. **Docs**: All documentation in `docs/`
5. **Uploads**: User files in `uploads/`

## 🗑️ Removed Files/Folders

- ❌ `backend/api/` (old unused API)
- ❌ `backend/models/` (old models)
- ❌ `backend/server/` (old server)
- ❌ `backend/src/` (old ML code)
- ❌ `backend/modal_app.py` (unused)
- ❌ `frontend/` (old HTML/CSS frontend)
- ❌ `ml notbooks/` (typo, unused)
- ❌ `index.html` (root level, unused)
- ❌ `package.json` (root level, unused)

## ✅ Clean Structure

- Clear separation of backend/frontend
- Organized documentation
- Scripts in dedicated folder
- README in every folder
- No unnecessary files
- Professional organization

