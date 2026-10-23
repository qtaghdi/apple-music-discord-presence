#!/bin/zsh
set -eu
# The running app owns its worker; restarting it through the menu avoids orphaned helpers.
"$(dirname "$0")/Start.command"
echo "Use the music-note menu bar icon > 다시 연결 to restart the connection."
