$ErrorActionPreference = "SilentlyContinue"
$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
Remove-ItemProperty -Path $runKey -Name "AppleMusicDiscordPresence"
$needle = Join-Path $PSScriptRoot "dist\src\index.js"
Get-CimInstance Win32_Process |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains($needle) } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Write-Host "Stopped and removed from login. Configuration and logs were kept."
