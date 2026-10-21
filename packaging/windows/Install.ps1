param([string]$ClientId)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($ClientId)) {
    $ClientId = Read-Host "Paste your Discord Application ID"
}
if ($ClientId -notmatch '^\d{17,20}$') {
    throw "The Discord Application ID must contain 17-20 digits."
}

$configDirectory = Join-Path $env:APPDATA "Apple Music Discord Presence"
$configFile = Join-Path $configDirectory "config.json"
New-Item -ItemType Directory -Force -Path $configDirectory | Out-Null
$config = [ordered]@{
    discordClientId = $ClientId
    pollIntervalMs = 1000
    showPaused = $true
    artwork = [ordered]@{ enabled = $true; country = "US" }
} | ConvertTo-Json -Depth 3
[System.IO.File]::WriteAllText($configFile, $config, (New-Object System.Text.UTF8Encoding($false)))

$startScript = Join-Path $root "Start.ps1"
$runCommand = "powershell.exe -NoLogo -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$startScript`""
$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
New-ItemProperty -Path $runKey -Name "AppleMusicDiscordPresence" -Value $runCommand -PropertyType String -Force | Out-Null
Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @("-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$startScript`"")
Write-Host "Installed and started. Keep this folder in place."
