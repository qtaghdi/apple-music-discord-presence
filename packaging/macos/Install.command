#!/bin/zsh
set -eu
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/Applications/Apple Music Discord Presence.app"
launchctl bootout "gui/$(id -u)/io.github.apple-music-discord-presence" 2>/dev/null || true
if pgrep -f "$DEST/Contents/MacOS/apple-music-presence" >/dev/null; then
  echo "Quit Apple Music Discord Presence from its menu bar icon before upgrading."
  exit 1
fi
mkdir -p "$HOME/Applications"
/usr/bin/ditto "$ROOT_DIR/Apple Music Discord Presence.app" "$DEST"
/usr/bin/open "$DEST"
echo "Installed in ~/Applications. Use the music-note menu bar icon to open Settings or enable launch at login."
