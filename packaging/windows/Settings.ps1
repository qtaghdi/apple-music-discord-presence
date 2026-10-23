$ErrorActionPreference = "Stop"
$settingsUrl = "http://127.0.0.1:47621"

try {
    Invoke-WebRequest -UseBasicParsing -Uri "$settingsUrl/health" -TimeoutSec 2 | Out-Null
} catch {
    throw "Apple Music Presence is not running. Open Apple Music Discord Presence from the Start menu, or run Install.cmd first."
}

Start-Process "$settingsUrl/"
