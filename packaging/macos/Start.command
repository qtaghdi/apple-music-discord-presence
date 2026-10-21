#!/bin/zsh
set -eu
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$ROOT_DIR/runtime/bin/node" "$ROOT_DIR/dist/src/index.js"
