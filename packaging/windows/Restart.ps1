$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$pidFile = Join-Path $env:LOCALAPPDATA "Apple Music Discord Presence\Logs\app.pid"

if (Test-Path $pidFile) {
    $runningPid = 0
    if ([int]::TryParse((Get-Content $pidFile -Raw).Trim(), [ref]$runningPid)) {
        Stop-Process -Id $runningPid -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

$startScript = Join-Path $root "Start.ps1"
Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @("-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$startScript`"")
Write-Host "Restarted with the latest settings."
