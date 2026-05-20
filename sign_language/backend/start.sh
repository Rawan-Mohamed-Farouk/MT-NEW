#!/bin/bash
# Backend Startup Script for Linux/Mac

echo "========================================"
echo "Starting EmpowerWork Backend Server"
echo "========================================"
echo ""

# Change to project root
cd "$(dirname "$0")/.."

# Set Python path
export PYTHONPATH=.

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed or not in PATH"
    exit 1
fi

# Start the server
echo "Starting server on http://localhost:8000"
echo "Press CTRL+C to stop"
echo ""
python3 -m uvicorn backend.src.main:app --reload --host 0.0.0.0 --port 8000

