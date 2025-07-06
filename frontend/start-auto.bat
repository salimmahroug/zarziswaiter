@echo off
setlocal enabledelayedexpansion

echo.
echo =======================================================
echo 🚀 Démarrage automatique - Waiter of Zarzis
echo =======================================================
echo.

echo 🔍 Détection de l'adresse IP...

:: Obtenir l'adresse IP Wi-Fi actuelle
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"Adresse IPv4"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    if not "!ip!"=="" (
        if not "!ip!"=="127.0.0.1" (
            echo ✅ Adresse IP détectée: !ip!
            goto :found_ip
        )
    )
)

echo ❌ Impossible de détecter l'adresse IP
pause
exit /b 1

:found_ip
echo.
echo 📝 Mise à jour de la configuration...

:: Mettre à jour package.json
powershell -Command "(Get-Content 'package.json') -replace '192\.168\.\d+\.\d+', '!ip!' | Set-Content 'package.json'"

:: Mettre à jour vite.config.ts
powershell -Command "(Get-Content 'vite.config.ts') -replace '192\.168\.\d+\.\d+', '!ip!' | Set-Content 'vite.config.ts'"

:: Mettre à jour api.ts
powershell -Command "(Get-Content 'src/services/api.ts') -replace '192\.168\.\d+\.\d+', '!ip!' | Set-Content 'src/services/api.ts'"

:: Mettre à jour start-with-ip.js
powershell -Command "(Get-Content 'start-with-ip.js') -replace '192\.168\.\d+\.\d+', '!ip!' | Set-Content 'start-with-ip.js'"

echo ✅ Configuration mise à jour avec l'IP: !ip!
echo.
echo ===================================================================
echo 🔗 Votre application sera accessible à:
echo    💻 PC: http://localhost:8080
echo    📱 Téléphone: http://!ip!:8080
echo ===================================================================
echo.

echo 🚀 Démarrage du backend...
start "Backend API" cmd /k "cd backend && node server.cjs"

timeout /t 3 /nobreak > nul

echo 🚀 Démarrage du frontend...
start "Frontend Vite" cmd /k "npm run dev-network"

echo.
echo ✅ Serveurs démarrés!
echo.
echo 📋 URLs importantes:
echo    - Frontend: http://!ip!:8080
echo    - Backend API: http://!ip!:5001/api
echo    - Pour mobile: http://!ip!:8080
echo.
echo ⚠️  Important:
echo    1. Assurez-vous que votre téléphone est sur le même WiFi
echo    2. Vous devrez peut-être autoriser les connexions dans le pare-feu
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause > nul
