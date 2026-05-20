# ⚡ Quick Run Commands

## 🚀 Fastest Way to Start (Every Time)

### Terminal 1 - Backend:
```powershell
cd C:\xampp\htdocs\k-main\backend
.\start.bat
```

### Terminal 2 - Frontend:
```powershell
cd C:\xampp\htdocs\k-main\frontend
npm run dev
```

---

## 📋 First Time Setup

### 1. Start MySQL
- Open **XAMPP Control Panel** → Start MySQL

### 2. Create Database
```bash
mysql -u root -p -e "CREATE DATABASE rag_jobs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. Install Dependencies
```bash
# Python dependencies
pip install -r requirements.txt

# Frontend dependencies
cd frontend
npm install
```

### 4. Setup Database
```bash
# Create tables
mysql -u root -p rag_jobs < docs/database/DDL.sql

# Insert sample data (optional)
mysql -u root -p rag_jobs < docs/database/DML.sql
```

### 5. Start Services
- Backend: `cd backend && .\start.bat`
- Frontend: `cd frontend && npm run dev`

---

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

---

## 🔧 Common Commands

| Task | Command |
|------|---------|
| Start Backend | `cd backend && .\start.bat` |
| Start Frontend | `cd frontend && npm run dev` |
| Clean Cache | `cd backend && .\cleanup.bat` |
| Fix Database | `cd backend && python scripts\migrations\fix_all_database_issues.py` |
| Create Admin | `cd backend && python scripts\create_admin_user.py` |

---

For detailed commands, see: **[docs/RUN_COMMANDS.md](docs/RUN_COMMANDS.md)**













