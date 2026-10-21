#!/bin/zsh
set -eu

SETTINGS_URL="http://127.0.0.1:47621"

if ! /usr/bin/curl -fsS --max-time 2 "$SETTINGS_URL/health" >/dev/null; then
  echo "Apple Music Presence is not running."
  echo "Run Install.command first, or use Restart.command if it is already installed."
  read -k 1 "?Press any key to close."
  exit 1
fi

/usr/bin/open "$SETTINGS_URL/"
