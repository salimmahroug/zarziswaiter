@echo off
echo.
echo =======================================================
echo 🚀 Démarrage des serveurs - Waiter of Zarzis
echo =======================================================
echo.
echo 📍 Adresse IP: 192.168.100.145
echo.
echo ⚠️  IMPORTANT: Configuration du pare-feu nécessaire
echo    Si ça ne marche pas sur téléphone, suivez ces étapes:
echo.
echo 1. Ouvrir PowerShell en tant qu'ADMINISTRATEUR
echo 2. Exécuter ces commandes:
echo    netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=8080
echo    netsh advfirewall firewall add rule name="Node API Server" dir=in action=allow protocol=TCP localport=5001
echo.
echo =======================================================
echo.

echo Démarrage du backend...
start "Backend API" cmd /k "cd backend && node server.cjs"

timeout /t 3 /nobreak > nul

echo Démarrage du frontend...
start "Frontend Vite" cmd /k "npm run dev-network"

echo.
echo ✅ Serveurs démarrés!
echo.
echo 📱 URL pour téléphone: http://192.168.100.145:8080
echo 🖥️  URL pour PC: http://localhost:8080
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause > nul
