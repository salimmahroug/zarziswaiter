# This script starts both frontend and backend servers with the WiFi IP address
# making the application accessible from mobile devices on the same network

# Define the IP address
$IP_ADDRESS = "192.168.100.145"

Write-Host "Starting servers with IP address: $IP_ADDRESS" -ForegroundColor Green
Write-Host ""
Write-Host "==================================================================="
Write-Host "🔗 You'll be able to access the app on your phone at:" -ForegroundColor Cyan
Write-Host "   http://$($IP_ADDRESS):8080" -ForegroundColor Yellow
Write-Host "==================================================================="
Write-Host ""

# Start the backend server in a new PowerShell window
$backendCommand = "cd '$PSScriptRoot\backend' ; node server.cjs"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand -WindowStyle Normal

# Wait a moment for the backend to start
Start-Sleep -Seconds 2

# Start the frontend server with the specified host
$frontendCommand = "cd '$PSScriptRoot' ; npm run dev -- --host ""$IP_ADDRESS"""
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand -WindowStyle Normal

Write-Host "✅ Servers started!" -ForegroundColor Green
Write-Host "   - Backend API: http://$($IP_ADDRESS):5001/api"
Write-Host "   - Frontend:    http://$($IP_ADDRESS):8080"
Write-Host ""
Write-Host "⚠️  Make sure your phone is connected to the same WiFi network." -ForegroundColor Yellow
Write-Host "   You may need to allow the application through your firewall."
Write-Host ""
