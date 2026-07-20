@echo off
cls
echo.
echo ================================================
echo   Starting Smart Attendance System
echo ================================================
echo.
echo 🚀 Installing concurrently if needed...
echo.

REM Install concurrently in root
call npm install -g concurrently

echo.
echo 🚀 Starting both Frontend and Backend...
echo.
echo 📦 Backend Server: http://localhost:5000
echo 🎨 Frontend Client: http://localhost:5173
echo.
echo ================================================
echo.

REM Start both servers using concurrently
concurrently -n "SERVER,CLIENT" -c "cyan,green" "cd server && npm run dev" "cd client && npm run dev"

pause
