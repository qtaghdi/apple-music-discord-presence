#!/bin/zsh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NODE_BIN="$(command -v node)"
CLIENT_ID="${DISCORD_CLIENT_ID:-${1:-}}"
CONFIG_DIR="$HOME/Library/Application Support/Apple Music Discord Presence"
CONFIG_FILE="$CONFIG_DIR/config.json"
PLIST="$HOME/Library/LaunchAgents/io.github.apple-music-discord-presence.plist"
LOG_DIR="$HOME/Library/Logs/Apple Music Discord Presence"

if [[ -n "$CLIENT_ID" ]] && { [[ "$CLIENT_ID" != <-> ]] || (( ${#CLIENT_ID} < 17 || ${#CLIENT_ID} > 20 )); }; then
  echo "The optional Discord application ID must contain 17-20 digits."
  exit 1
fi

cd "$ROOT_DIR"
npm run build
mkdir -p "$CONFIG_DIR" "$HOME/Library/LaunchAgents" "$LOG_DIR"
if [[ ! -f "$CONFIG_FILE" ]]; then
  CLIENT_ID="${CLIENT_ID:-$(node --input-type=module -e 'import { SHARED_DISCORD_CLIENT_ID } from "./dist/src/config.js"; console.log(SHARED_DISCORD_CLIENT_ID)')}"
  printf '{\n  "discordClientId": "%s",\n  "pollIntervalMs": 1000,\n  "showPaused": false,\n  "presence": {\n    "showAlbum": true,\n    "showTimeRemaining": true,\n    "showButton": true,\n    "displayOrder": "artist-album"\n  },\n  "artwork": { "enabled": true, "country": "US" }\n}\n' "$CLIENT_ID" > "$CONFIG_FILE"
  chmod 600 "$CONFIG_FILE"
fi

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>io.github.apple-music-discord-presence</string>
  <key>ProgramArguments</key><array>
    <string>$NODE_BIN</string><string>$ROOT_DIR/dist/src/index.js</string>
  </array>
  <key>WorkingDirectory</key><string>$ROOT_DIR</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>StandardOutPath</key><string>$LOG_DIR/app.log</string>
  <key>StandardErrorPath</key><string>$LOG_DIR/error.log</string>
</dict></plist>
EOF

launchctl bootout "gui/$(id -u)/io.github.apple-music-discord-presence" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Installed and started. macOS may now ask for Music automation permission."
