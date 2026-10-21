#!/bin/zsh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGE_NAME="apple-music-discord-presence-macos-arm64"
PACKAGE_DIR="$ROOT_DIR/release/$PACKAGE_NAME"
ARCHIVE="$ROOT_DIR/release/$PACKAGE_NAME.zip"

rm -rf "$PACKAGE_DIR" "$ARCHIVE"
mkdir -p "$PACKAGE_DIR/runtime/bin" "$PACKAGE_DIR/bin"
cp "$(command -v node)" "$PACKAGE_DIR/runtime/bin/node"
mkdir -p "$PACKAGE_DIR/dist"
cp -R "$ROOT_DIR/dist/src" "$PACKAGE_DIR/dist/src"
cp "$ROOT_DIR/bin/music-metadata" "$PACKAGE_DIR/bin/music-metadata"
cp "$ROOT_DIR/config.example.json" "$ROOT_DIR/LICENSE" "$PACKAGE_DIR/"
cp "$ROOT_DIR/packaging/macos/README.txt" "$PACKAGE_DIR/README.txt"
cp "$ROOT_DIR/packaging/macos/Start.command" "$ROOT_DIR/packaging/macos/Install.command" "$ROOT_DIR/packaging/macos/Uninstall.command" "$PACKAGE_DIR/"
chmod +x "$PACKAGE_DIR/runtime/bin/node" "$PACKAGE_DIR/bin/music-metadata" "$PACKAGE_DIR"/*.command
(cd "$ROOT_DIR/release" && /usr/bin/zip -q -r -X "$ARCHIVE" "$PACKAGE_NAME")
echo "$ARCHIVE"
