param([string]$ClientId)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$configDirectory = Join-Path $env:APPDATA "Apple Music Discord Presence"
$configFile = Join-Path $configDirectory "config.json"

if (-not [string]::IsNullOrWhiteSpace($ClientId) -and $ClientId -notmatch '^\d{17,20}$') {
    throw "The optional Discord application ID must contain 17-20 digits."
}

New-Item -ItemType Directory -Force -Path $configDirectory | Out-Null
if (-not (Test-Path $configFile)) {
    $config = [ordered]@{
        pollIntervalMs = 1000
        showPaused = $false
        presence = [ordered]@{
            showAlbum = $true
            showTimeRemaining = $true
            showButton = $true
            displayOrder = "artist-album"
        }
        artwork = [ordered]@{ enabled = $true; country = "US" }
    }
    if (-not [string]::IsNullOrWhiteSpace($ClientId)) { $config.discordClientId = $ClientId }
    $config = $config | ConvertTo-Json -Depth 4
    [System.IO.File]::WriteAllText($configFile, $config, (New-Object System.Text.UTF8Encoding($false)))
}

$startScript = Join-Path $root "Start.ps1"
$arguments = "-STA -NoLogo -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$startScript`""
$shortcutPath = Join-Path ([Environment]::GetFolderPath('Programs')) 'Apple Music Discord Presence.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$shortcut.Arguments = $arguments
$shortcut.WorkingDirectory = $root
$shortcut.Save()
# Preserve an existing login preference while replacing the old background-only command.
$runKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
if (Get-ItemProperty -Path $runKey -Name 'AppleMusicDiscordPresence' -ErrorAction SilentlyContinue) {
    New-ItemProperty -Path $runKey -Name 'AppleMusicDiscordPresence' -Value "powershell.exe $arguments" -PropertyType String -Force | Out-Null
}
Start-Process powershell.exe -WindowStyle Hidden -ArgumentList $arguments
Write-Host "Installed in the Start menu. Use the tray icon to open Settings or enable launch at login. Keep this folder in place."
