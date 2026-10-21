#!/bin/zsh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_ID="${DISCORD_CLIENT_ID:-${1:-}}"
CONFIG_DIR="$HOME/Library/Application Support/Apple Music Discord Presence"
CONFIG_FILE="$CONFIG_DIR/config.json"
PLIST="$HOME/Library/LaunchAgents/io.github.apple-music-discord-presence.plist"
LOG_DIR="$HOME/Library/Logs/Apple Music Discord Presence"

if [[ -z "$CLIENT_ID" ]]; then
  echo "Paste your Discord Application ID, then press Return:"
  read -r CLIENT_ID
fi
if [[ "$CLIENT_ID" != <-> ]] || (( ${#CLIENT_ID} < 17 || ${#CLIENT_ID} > 20 )); then
  echo "The Discord Application ID must contain 17-20 digits."
  read -k 1 "?Press any key to close."
  exit 1
fi

mkdir -p "$CONFIG_DIR" "$HOME/Library/LaunchAgents" "$LOG_DIR"
printf '{\n  "discordClientId": "%s",\n  "pollIntervalMs": 1000,\n  "showPaused": true,\n  "artwork": { "enabled": true, "country": "US" }\n}\n' "$CLIENT_ID" > "$CONFIG_FILE"
chmod 600 "$CONFIG_FILE"

escape_xml() {
  local value="$1"
  value="${value//&/&amp;}"
  value="${value//</&lt;}"
  value="${value//>/&gt;}"
  echo "$value"
}
NODE_PATH="$(escape_xml "$ROOT_DIR/runtime/bin/node")"
APP_PATH="$(escape_xml "$ROOT_DIR/dist/src/index.js")"
ROOT_PATH="$(escape_xml "$ROOT_DIR")"
OUT_PATH="$(escape_xml "$LOG_DIR/app.log")"
ERR_PATH="$(escape_xml "$LOG_DIR/error.log")"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>io.github.apple-music-discord-presence</string>
  <key>ProgramArguments</key><array><string>$NODE_PATH</string><string>$APP_PATH</string></array>
  <key>WorkingDirectory</key><string>$ROOT_PATH</string>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/><key>ThrottleInterval</key><integer>10</integer>
  <key>StandardOutPath</key><string>$OUT_PATH</string>
  <key>StandardErrorPath</key><string>$ERR_PATH</string>
</dict></plist>
EOF

plutil -lint "$PLIST" >/dev/null
launchctl bootout "gui/$(id -u)/io.github.apple-music-discord-presence" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Installed. Start Apple Music and Discord, then allow Music automation if macOS asks."
read -k 1 "?Press any key to close."
