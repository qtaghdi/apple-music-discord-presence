#!/bin/zsh
set -eu
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGE_NAME="apple-music-discord-presence-macos-arm64"
PACKAGE_DIR="$ROOT_DIR/release/$PACKAGE_NAME"
ARCHIVE="$ROOT_DIR/release/$PACKAGE_NAME.zip"
APP="$PACKAGE_DIR/Apple Music Discord Presence.app"
RESOURCES="$APP/Contents/Resources"
rm -rf "$PACKAGE_DIR" "$ARCHIVE"
mkdir -p "$RESOURCES/runtime/bin" "$RESOURCES/bin" "$APP/Contents/MacOS" "$RESOURCES/dist"
cp "$(command -v node)" "$RESOURCES/runtime/bin/node"
cp -R "$ROOT_DIR/dist/src" "$RESOURCES/dist/src"
cp -R "$ROOT_DIR/settings" "$RESOURCES/settings"
cp "$ROOT_DIR/bin/music-metadata" "$RESOURCES/bin/music-metadata"
cp "$ROOT_DIR/.build/apple-music-presence" "$APP/Contents/MacOS/apple-music-presence"
cp "$ROOT_DIR/packaging/macos/Info.plist" "$APP/Contents/Info.plist"
VERSION="$(cd "$ROOT_DIR" && node -p 'require("./package.json").version')"
/usr/libexec/PlistBuddy -c "Add :CFBundleShortVersionString string $VERSION" "$APP/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Add :CFBundleVersion string $VERSION" "$APP/Contents/Info.plist"
cp "$ROOT_DIR/config.example.json" "$ROOT_DIR/LICENSE" "$PACKAGE_DIR/"
cp "$ROOT_DIR/packaging/macos/README.txt" "$PACKAGE_DIR/README.txt"
cp "$ROOT_DIR/packaging/macos/"*.command "$PACKAGE_DIR/"
chmod +x "$RESOURCES/runtime/bin/node" "$RESOURCES/bin/music-metadata" "$APP/Contents/MacOS/apple-music-presence" "$PACKAGE_DIR/"*.command
# Sign the app host with its Music automation entitlement. Keep the bundled Node signature intact.
codesign --force --sign - --options runtime --entitlements "$ROOT_DIR/packaging/macos/entitlements.plist" "$APP"
(cd "$ROOT_DIR/release" && /usr/bin/zip -q -r -X "$ARCHIVE" "$PACKAGE_NAME")
echo "$ARCHIVE"
