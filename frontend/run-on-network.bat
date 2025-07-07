@echo off
echo Starting servers with IP address: 192.168.100.145
echo.
echo ===================================================================
echo 🔗 You'll be able to access the app on your phone at:
echo    http://192.168.100.145:8080
echo ===================================================================
echo.

echo Starting backend server...
start cmd /k "cd backend && node server.cjs"

timeout /t 2 /nobreak > nul

echo Starting frontend server...
start cmd /k "npm run dev -- --host 192.168.100.145"

echo.
echo ✅ Servers started!
echo    - Backend API: https://zarziswaiter-2.onrender.com
echo    - Frontend:    https://zarziswaiter-3.onrender.com
echo.
echo ⚠️  Make sure your phone is connected to the same WiFi network.
echo    You may need to allow the application through your firewall.
echo.
