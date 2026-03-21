# 🚀 How to Start the Project

## Prerequisites

1. **XAMPP** - Make sure MySQL/MariaDB is running
2. **Python 3.11+** - Installed and in PATH
3. **Node.js** (for frontend) - Optional if only running backend

## Quick Start Commands

### Windows (PowerShell/CMD)

```powershell
# 1. Navigate to project root
cd C:\xampp\htdocs\k-main

# 2. Clean cache (optional, first time or after errors)
cd backend
.\cleanup.bat
cd ..

# 3. Run database migration (first time only)
cd backend
python scripts\migrations\fix_all_database_issues.py
cd ..

# 4. Start Backend Server
cd backend
.\start.bat
```

**OR use direct command:**
```powershell
cd C:\xampp\htdocs\k-main
set PYTHONPATH=.
python -m uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000
```

### Linux/Mac

```bash
# 1. Navigate to project root
cd /path/to/k-main

# 2. Clean cache (optional)
cd backend
chmod +x cleanup.sh
./cleanup.sh
cd ..

# 3. Run database migration (first time only)
cd backend
python3 scripts/migrations/fix_all_database_issues.py
cd ..

# 4. Start Backend Server
cd backend
chmod +x start.sh
./start.sh
```

**OR use direct command:**
```bash
cd /path/to/k-main
export PYTHONPATH=.
python3 -m uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000
```

## Step-by-Step Guide

### First Time Setup

1. **Start MySQL in XAMPP**
   - Open XAMPP Control Panel
   - Click "Start" on MySQL

2. **Create Database** (if not exists)
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Create database: `rag_jobs`

3. **Run Database Migration**
   ```powershell
   cd backend
   python scripts\migrations\fix_all_database_issues.py
   ```

4. **Install Dependencies** (if needed)
   ```powershell
   pip install -r requirements.txt
   ```

5. **Start Backend**
   ```powershell
   cd backend
   .\start.bat
   ```

### Every Time You Run

**Option 1: Use the startup script (Recommended)**
```powershell
cd C:\xampp\htdocs\k-main\backend
.\start.bat
```

**Option 2: Use direct command**
```powershell
cd C:\xampp\htdocs\k-main
set PYTHONPATH=.
python -m uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend (Optional)

If you want to run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend will run on: http://localhost:3000

## Troubleshooting

### Database Connection Error
1. Make sure MySQL is running in XAMPP
2. Check `.env` file has correct database settings:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=rag_jobs
   ```

### Module Not Found Error
1. Run cleanup: `backend\cleanup.bat`
2. Reinstall dependencies: `pip install -r requirements.txt`

### Port Already in Use
- Change port in `start.bat` or command: `--port 8001`

## API Endpoints

Once running, access:
- **API Root**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Quick Reference

| Task | Command |
|------|---------|
| Start Backend | `cd backend && .\start.bat` |
| Clean Cache | `cd backend && .\cleanup.bat` |
| Fix Database | `cd backend && python scripts\migrations\fix_all_database_issues.py` |
| Check DB Connection | `cd backend && python test_db_connection.py` |

