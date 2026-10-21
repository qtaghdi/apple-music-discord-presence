#!/bin/zsh
set -eu

LABEL="io.github.apple-music-discord-presence"
DOMAIN="gui/$(id -u)"

if ! launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then
  echo "Apple Music Discord Presence is not installed. Run Install.command first."
  read -k 1 "?Press any key to close."
  exit 1
fi

launchctl kickstart -k "$DOMAIN/$LABEL"
echo "Restarted with the latest settings."
read -k 1 "?Press any key to close."
