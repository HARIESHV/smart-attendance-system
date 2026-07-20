@echo off
echo.
echo ========================================
echo  Starting Smart Attendance System
echo ========================================
echo.

REM Start backend server in new window
echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak > nul

REM Start frontend client in new window  
echo Starting Frontend Client...
start "Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo  Smart Attendance System Started!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Close the terminal windows to stop the servers
echo.
pause
