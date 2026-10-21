#!/bin/zsh
set -eu

PLIST="$HOME/Library/LaunchAgents/io.github.apple-music-discord-presence.plist"
launchctl bootout "gui/$(id -u)/io.github.apple-music-discord-presence" 2>/dev/null || true
if [[ -f "$PLIST" ]]; then
  mv "$PLIST" "$HOME/.Trash/io.github.apple-music-discord-presence.plist"
fi
echo "Stopped and removed the login agent. Your config and logs were kept."
