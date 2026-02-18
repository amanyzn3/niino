@echo off
TITLE Nino Care Launcher
echo Starting Nino Care System...
echo --------------------------------

cd /d "%~dp0"

echo [1/3] Starting Backend Server...
start "Nino Backend" /min cmd /c "cd server && npm run dev"

echo [2/3] Starting Frontend Client...
start "Nino Frontend" /min cmd /c "npm run dev"

echo [3/3] Launching Application Window...
echo Waiting for servers to initialize...
timeout /t 5 >nul

:: try edge first, then chrome
start msedge --app=http://localhost:8080 || start chrome --app=http://localhost:8080

echo Done! The app is running.
echo Do not close the backend/frontend terminal windows while using the app.
