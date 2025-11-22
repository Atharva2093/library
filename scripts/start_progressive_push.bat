@echo off
REM Auto Push Batch Script for Windows - Every 3 Minutes
REM Pushes 5 files every 3 minutes

echo ⚡ Auto-Push Service for Windows (Every 3 Minutes)
echo ================================================
echo.
echo 📋 Configuration:
echo   - Files per push: 5
echo   - Push interval: Every 3 minutes
echo   - Repository: %CD%
echo.
echo 🎯 Schedule: 3min → 3min → 3min → ...
echo.
echo Press Ctrl+C to stop the service
echo.

REM Navigate to the project root
cd /d "f:\projects\library"

REM Run the Python progressive auto-push script
echo Starting Python script...
python scripts\progressive_auto_push.py

pause