$ErrorActionPreference = "Stop"
$settingsUrl = "http://127.0.0.1:47621"

try {
    Invoke-WebRequest -UseBasicParsing -Uri "$settingsUrl/health" -TimeoutSec 2 | Out-Null
} catch {
    throw "Apple Music Presence is not running. Run Install.cmd first, or use Restart.cmd if it is already installed."
}

Start-Process "$settingsUrl/"
