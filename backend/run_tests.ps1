# PowerShell test runner for OutbreakIQ backend
Write-Host "Running OutbreakIQ backend test suite across all 12 modules..." -ForegroundColor Cyan
py -m pytest -v
