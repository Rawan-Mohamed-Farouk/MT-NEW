#!/bin/bash
# Cleanup script - removes __pycache__ directories and .pyc files

echo "Cleaning up Python cache files..."
echo ""

# Remove __pycache__ directories
find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null

# Remove .pyc files
find . -type f -name "*.pyc" -delete 2>/dev/null

echo ""
echo "Cleanup complete!"

