$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$logDirectory = Join-Path $env:LOCALAPPDATA "Apple Music Discord Presence\Logs"
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
$log = Join-Path $logDirectory "app.log"
$errorLog = Join-Path $logDirectory "error.log"
$pidFile = Join-Path $logDirectory "app.pid"
$node = Start-Process (Join-Path $root "runtime\node.exe") -ArgumentList (Join-Path $root "dist\src\index.js") -WindowStyle Hidden -RedirectStandardOutput $log -RedirectStandardError $errorLog -PassThru
[System.IO.File]::WriteAllText($pidFile, $node.Id.ToString())
try {
    $node.WaitForExit()
} finally {
    if ((Test-Path $pidFile) -and ((Get-Content $pidFile -Raw).Trim() -eq $node.Id.ToString())) {
        Remove-Item $pidFile -Force
    }
}
