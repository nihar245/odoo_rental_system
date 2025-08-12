@echo off
echo Starting Rental Management System...
echo.

echo Step 1: Starting Backend Server...
cd Backend
start "Backend Server" cmd /k "npm run dev"

echo Step 2: Starting Frontend Server...
cd ../Frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul
