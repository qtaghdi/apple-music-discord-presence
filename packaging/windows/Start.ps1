$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$logDirectory = Join-Path $env:LOCALAPPDATA "Apple Music Discord Presence\Logs"
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
$log = Join-Path $logDirectory "app.log"
& (Join-Path $root "runtime\node.exe") (Join-Path $root "dist\src\index.js") *>> $log
