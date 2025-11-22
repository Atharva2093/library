# Auto Push PowerShell Script - Every 3 Minutes
# Pushes 5 files every 3 minutes

Write-Host "⚡ Auto-Push Service for Windows PowerShell (Every 3 Minutes)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  - Files per push: 5" -ForegroundColor White
Write-Host "  - Push interval: Every 3 minutes" -ForegroundColor White
Write-Host "  - Repository: $(Get-Location)" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Schedule: 3min → 3min → 3min → ..." -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Red
Write-Host ""

# Navigate to the project root
Set-Location "f:\projects\library"

# Run the Python progressive auto-push script
try {
    Write-Host "Starting Python script..." -ForegroundColor Green
    python scripts\progressive_auto_push.py
} catch {
    Write-Host "Error running progressive auto-push script: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}