@echo off
cls
echo.
echo ================================================
echo   Smart Attendance System - Starting All
echo ================================================
echo.
echo 🔧 Checking for concurrently...
echo.

REM Check if concurrently is installed globally
where concurrently >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing concurrently globally...
    call npm install -g concurrently
)

echo.
echo ================================================
echo   Starting Frontend and Backend Servers
echo ================================================
echo.
echo 📦 Backend Server: http://localhost:5000
echo 🎨 Frontend Client: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo ================================================
echo.

REM Start both servers
cd /d "%~dp0"
concurrently -n "SERVER,CLIENT" -c "cyan,green" "cd server && npm run dev" "cd client && npm run dev"

pause
