#!/bin/zsh
set -eu
"$(dirname "$0")/Start.command"
for attempt in {1..30}; do
  if /usr/bin/curl -fsS --max-time 1 http://127.0.0.1:47621/health >/dev/null; then
    /usr/bin/open http://127.0.0.1:47621/
    exit 0
  fi
  sleep 1
done
echo "Complete first-time setup in Apple Music Discord Presence, then choose Settings from the menu bar."
