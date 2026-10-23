#!/bin/zsh
set -eu
PLIST="$HOME/Library/LaunchAgents/io.github.apple-music-discord-presence.plist"
launchctl bootout "gui/$(id -u)/io.github.apple-music-discord-presence" 2>/dev/null || true
if [[ -f "$PLIST" ]]; then mv "$PLIST" "$HOME/.Trash/io.github.apple-music-discord-presence-$(date +%s).plist"; fi
echo "Login startup removed. Quit from the music-note menu, then move ~/Applications/Apple Music Discord Presence.app to Trash. Configuration and logs were kept."
