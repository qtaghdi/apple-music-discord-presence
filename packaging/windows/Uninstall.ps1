$ErrorActionPreference = "Stop"
Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'AppleMusicDiscordPresence' -ErrorAction SilentlyContinue
Remove-Item (Join-Path ([Environment]::GetFolderPath('Programs')) 'Apple Music Discord Presence.lnk') -ErrorAction SilentlyContinue
Write-Host 'Startup and Start menu shortcut removed. Choose Quit from the tray icon before removing the extracted folder. Configuration and logs were kept.'
