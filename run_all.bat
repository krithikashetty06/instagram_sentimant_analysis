@echo off
echo ========================================================
echo   SocialPulse - Launching Full Stack Application
echo ========================================================
echo.

start "SocialPulse Backend (Port 8000)" cmd /k "start_backend.bat"
timeout /t 2 /nobreak >nul
start "SocialPulse Frontend (Port 5173)" cmd /k "start_frontend.bat"

echo Application launched!
echo Backend:  http://127.0.0.1:8000 (API Docs: http://127.0.0.1:8000/docs)
echo Frontend: http://127.0.0.1:5173
echo.
timeout /t 3 /nobreak >nul
start http://127.0.0.1:5173
