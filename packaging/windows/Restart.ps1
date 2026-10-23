$ErrorActionPreference = "Stop"
Start-Process powershell.exe -WindowStyle Hidden -ArgumentList "-STA -NoProfile -ExecutionPolicy Bypass -File `"$(Join-Path $PSScriptRoot 'Start.ps1')`""
Write-Host "Choose Reconnect from the tray menu to restart the connection."
