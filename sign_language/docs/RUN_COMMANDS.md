# 🚀 EmpowerWork - Run Commands Guide

Complete guide with all commands to run the EmpowerWork project.

---

## 📋 Prerequisites

Before running, ensure you have:
- ✅ **XAMPP** installed and MySQL running
- ✅ **Python 3.11+** installed
- ✅ **Node.js 16+** installed (for frontend)
- ✅ **Database** `rag_jobs` created

---

## 🗄️ Database Setup (First Time Only)

### Step 1: Start MySQL
- Open **XAMPP Control Panel**
- Click **"Start"** on MySQL (should turn green)

### Step 2: Create Database

**Option A: Using phpMyAdmin**
1. Open: http://localhost/phpmyadmin
2. Click "New" → Database name: `rag_jobs` → Create

**Option B: Using MySQL Command Line**
```bash
mysql -u root -p
CREATE DATABASE rag_jobs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 3: Create Tables (DDL)

**Option A: Using SQL Script**
```bash
mysql -u root -p rag_jobs < docs/database/DDL.sql
```

**Option B: Using Python (Auto-creates on startup)**
- Tables are automatically created when you start the backend

### Step 4: Insert Sample Data (DML - Optional)

```bash
mysql -u root -p rag_jobs < docs/database/DML.sql
```

**OR** use Python seed scripts:
```bash
# Navigate to project root
cd C:\xampp\htdocs\k-main

# Seed disabilities
python backend/scripts/seeds/seed_disabilities.py

# Seed assistive tools
python backend/scripts/seeds/seed_assistive_tools.py

# Seed jobs
python backend/scripts/seeds/seed_jobs.py
```

---

## 🔧 Backend Setup (First Time Only)

### Install Python Dependencies

```bash
# Navigate to project root
cd C:\xampp\htdocs\k-main

# Install dependencies
pip install -r requirements.txt
```

### Configure Environment

Create `.env` file in project root (if not exists):

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=rag_jobs
OPENAI_API_KEY=your_openai_key_here
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

### Run Database Migrations (First Time)

```bash
cd C:\xampp\htdocs\k-main\backend
python scripts\migrations\fix_all_database_issues.py
```

### Create Admin User (Optional)

```bash
cd C:\xampp\htdocs\k-main\backend
python scripts\create_admin_user.py
```

---

## 🚀 Running the Backend

### Windows (PowerShell/CMD)

**Option 1: Using Startup Script (Recommended)**
```powershell
cd C:\xampp\htdocs\k-main\backend
.\start.bat
```

**Option 2: Using Python Script**
```powershell
cd C:\xampp\htdocs\k-main
python run_backend.py
```

**Option 3: Direct Command**
```powershell
cd C:\xampp\htdocs\k-main
set PYTHONPATH=.
python -m uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000
```

### Linux/Mac

**Option 1: Using Startup Script**
```bash
cd /path/to/k-main/backend
chmod +x start.sh
./start.sh
```

**Option 2: Using Python Script**
```bash
cd /path/to/k-main
python3 run_backend.py
```

**Option 3: Direct Command**
```bash
cd /path/to/k-main
export PYTHONPATH=.
python3 -m uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000
```

### Backend URLs

Once running, access:
- **API Root**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## ⚛️ Running the Frontend

### First Time Setup

```bash
# Navigate to frontend directory
cd C:\xampp\htdocs\k-main\frontend

# Install dependencies
npm install
```

### Start Development Server

```bash
# From frontend directory
npm run dev
```

**OR** from project root:
```bash
cd C:\xampp\htdocs\k-main\frontend
npm run dev
```

### Frontend URLs

- **Frontend App**: http://localhost:3000 (or port shown in terminal)
- **API URL**: Configured in `.env` or `vite.config.js` (default: http://localhost:8000)

---

## 🎯 Complete Startup Sequence

### Quick Start (Every Time)

**Terminal 1 - Backend:**
```powershell
cd C:\xampp\htdocs\k-main\backend
.\start.bat
```

**Terminal 2 - Frontend:**
```powershell
cd C:\xampp\htdocs\k-main\frontend
npm run dev
```

### Full Setup (First Time)

```powershell
# 1. Start MySQL in XAMPP Control Panel

# 2. Create database (if not exists)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rag_jobs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Install Python dependencies
cd C:\xampp\htdocs\k-main
pip install -r requirements.txt

# 4. Run database migrations
cd backend
python scripts\migrations\fix_all_database_issues.py

# 5. Seed database (optional)
python scripts\seeds\seed_disabilities.py
python scripts\seeds\seed_assive_tools.py
python scripts\seeds\seed_jobs.py

# 6. Install frontend dependencies
cd ..\frontend
npm install

# 7. Start backend (Terminal 1)
cd ..\backend
.\start.bat

# 8. Start frontend (Terminal 2)
cd ..\frontend
npm run dev
```

---

## 🛠️ Utility Commands

### Clean Cache (Backend)

**Windows:**
```powershell
cd C:\xampp\htdocs\k-main\backend
.\cleanup.bat
```

**Linux/Mac:**
```bash
cd /path/to/k-main/backend
chmod +x cleanup.sh
./cleanup.sh
```

### Test Database Connection

```bash
cd C:\xampp\htdocs\k-main\backend
python test_db_connection.py
```

### Check Python Version

```bash
python --version
# Should be Python 3.11 or higher
```

### Check Node.js Version

```bash
node --version
# Should be Node.js 16 or higher
```

### View Database in phpMyAdmin

1. Open: http://localhost/phpmyadmin
2. Select database: `rag_jobs`
3. Browse tables

---

## 🔍 Verification Commands

### Check Backend is Running

```bash
# Test health endpoint
curl http://localhost:8000/health

# OR open in browser
# http://localhost:8000/health
```

Expected response:
```json
{"status": "ok", "message": "EmpowerWork API is running"}
```

### Check Frontend is Running

Open browser: http://localhost:3000

### Check Database Connection

```bash
cd C:\xampp\htdocs\k-main\backend
python test_db_connection.py
```

---

## 🐛 Troubleshooting Commands

### Database Connection Issues

```bash
# Check MySQL is running
# Open XAMPP Control Panel and verify MySQL is green

# Test MySQL connection
mysql -u root -p -e "SELECT 1;"

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'rag_jobs';"

# Check .env file
cd C:\xampp\htdocs\k-main
type .env
```

### Module/Import Errors

```bash
# Clean Python cache
cd C:\xampp\htdocs\k-main\backend
.\cleanup.bat

# Reinstall dependencies
cd C:\xampp\htdocs\k-main
pip install -r requirements.txt --force-reinstall
```

### Port Already in Use

**Backend (Port 8000):**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# OR change port in command
python -m uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8001
```

**Frontend (Port 3000):**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# OR Vite will automatically use next available port
```

### Database Migration Issues

```bash
cd C:\xampp\htdocs\k-main\backend
python scripts\migrations\fix_all_database_issues.py
```

### Reset Database (⚠️ Deletes All Data)

```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS rag_jobs;"
mysql -u root -p -e "CREATE DATABASE rag_jobs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Recreate tables
mysql -u root -p rag_jobs < docs/database/DDL.sql

# Reinsert sample data
mysql -u root -p rag_jobs < docs/database/DML.sql
```

---

## 📦 Build Commands

### Build Frontend for Production

```bash
cd C:\xampp\htdocs\k-main\frontend
npm run build
```

Output will be in `frontend/dist/`

### Preview Production Build

```bash
cd C:\xampp\htdocs\k-main\frontend
npm run preview
```

---

## 🔐 Admin User Commands

### Create Admin User

```bash
cd C:\xampp\htdocs\k-main\backend
python scripts\create_admin_user.py
```

Follow prompts to enter:
- Email/Username
- Password
- Name

---

## 📊 Database Management Commands

### Backup Database

```bash
mysqldump -u root -p rag_jobs > backup_rag_jobs_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
mysql -u root -p rag_jobs < backup_rag_jobs_YYYYMMDD_HHMMSS.sql
```

### View All Tables

```bash
mysql -u root -p rag_jobs -e "SHOW TABLES;"
```

### Count Records in Tables

```bash
mysql -u root -p rag_jobs -e "
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'job_applications', COUNT(*) FROM job_applications
UNION ALL
SELECT 'disabilities', COUNT(*) FROM disabilities
UNION ALL
SELECT 'assistive_tools', COUNT(*) FROM assistive_tools;
"
```

---

## 🎯 Quick Reference Table

| Task | Windows Command | Linux/Mac Command |
|------|----------------|-------------------|
| **Start Backend** | `cd backend && .\start.bat` | `cd backend && ./start.sh` |
| **Start Frontend** | `cd frontend && npm run dev` | `cd frontend && npm run dev` |
| **Clean Cache** | `cd backend && .\cleanup.bat` | `cd backend && ./cleanup.sh` |
| **Fix Database** | `cd backend && python scripts\migrations\fix_all_database_issues.py` | `cd backend && python3 scripts/migrations/fix_all_database_issues.py` |
| **Test DB Connection** | `cd backend && python test_db_connection.py` | `cd backend && python3 test_db_connection.py` |
| **Create Admin** | `cd backend && python scripts\create_admin_user.py` | `cd backend && python3 scripts/create_admin_user.py` |
| **Seed Disabilities** | `python backend\scripts\seeds\seed_disabilities.py` | `python3 backend/scripts/seeds/seed_disabilities.py` |
| **Install Python Deps** | `pip install -r requirements.txt` | `pip3 install -r requirements.txt` |
| **Install Node Deps** | `cd frontend && npm install` | `cd frontend && npm install` |

---

## 🌐 Access URLs

Once everything is running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React application |
| **Backend API** | http://localhost:8000 | FastAPI server |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **Health Check** | http://localhost:8000/health | API health status |
| **phpMyAdmin** | http://localhost/phpmyadmin | Database management |

---

## ✅ Success Checklist

Before considering the project fully running, verify:

- [ ] MySQL is running in XAMPP (green status)
- [ ] Database `rag_jobs` exists
- [ ] Backend starts without errors (http://localhost:8000/health returns OK)
- [ ] Frontend starts without errors (http://localhost:3000 loads)
- [ ] API documentation accessible (http://localhost:8000/docs)
- [ ] Can access frontend and see login/register page
- [ ] Database tables exist (check in phpMyAdmin)

---

## 📝 Notes

1. **Always start MySQL first** before running the backend
2. **Keep two terminals open** - one for backend, one for frontend
3. **Backend must run before frontend** - frontend depends on backend API
4. **Check .env file** - ensure all API keys and database credentials are correct
5. **Port conflicts** - if ports 8000 or 3000 are in use, change them in the commands

---

## 🆘 Need Help?

If you encounter issues:

1. Check **Troubleshooting Commands** section above
2. Review error messages in terminal
3. Check database connection: `python backend/test_db_connection.py`
4. Verify MySQL is running in XAMPP
5. Check `.env` file configuration
6. Review logs in terminal output













