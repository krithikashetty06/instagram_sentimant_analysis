@echo off
echo ========================================================
echo   SocialPulse - Starting Backend FastAPI Server
echo ========================================================
echo.

set PYTHONPATH=backend
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload

pause
