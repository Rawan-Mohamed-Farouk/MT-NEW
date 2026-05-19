@echo off
REM Backend Startup Script for Windows
echo ========================================
echo Starting EmpowerWork Backend Server
echo ========================================
echo.

REM Change to project root
cd /d "%~dp0\.."

REM Set Python path
set PYTHONPATH=.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Start the server
echo Starting server on http://localhost:8000
echo Press CTRL+C to stop
echo.
python -m uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000

pause

