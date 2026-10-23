#!/bin/zsh
set -eu
APP="$HOME/Applications/Apple Music Discord Presence.app"
if [[ ! -d "$APP" ]]; then APP="$(cd "$(dirname "$0")" && pwd)/Apple Music Discord Presence.app"; fi
/usr/bin/open "$APP"
