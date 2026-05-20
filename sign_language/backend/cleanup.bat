@echo off
REM Cleanup script - removes __pycache__ directories and .pyc files
echo Cleaning up Python cache files...
echo.

REM Remove __pycache__ directories
for /d /r . %%d in (__pycache__) do @if exist "%%d" (
    echo Removing %%d
    rd /s /q "%%d" 2>nul
)

REM Remove .pyc files
for /r . %%f in (*.pyc) do @if exist "%%f" (
    echo Removing %%f
    del /q "%%f" 2>nul
)

echo.
echo Cleanup complete!
pause

