# A-CAM Server Management Script

Write-Host "🚀 Starting A-CAM Production Suite..." -ForegroundColor Cyan

# 1. Start the App Server on Port 3000
Start-Process powershell -ArgumentList "-Command", "python -m http.server 3000 > app_output.log 2>&1"
Write-Host "✅ App Server launched at http://localhost:3000 (Logging to app_output.log)" -ForegroundColor Green

# 2. Start the CORS Bridge on Port 8001
Start-Process powershell -ArgumentList "-Command", "python cors_bridge.py > bridge_output.log 2>&1"
Write-Host "✅ CORS Bridge launched at http://localhost:8001 (Logging to bridge_output.log)" -ForegroundColor Green

Write-Host "🎬 System Ready. Please reload your browser on Port 3000." -ForegroundColor Yellow
