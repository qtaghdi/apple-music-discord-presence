# Repository guidance

## Scope

This repository contains a macOS and Windows Apple Music to Discord Rich Presence client. Keep it independent from `NextFire/apple-music-discord-rpc`; consult that project only for product context and do not copy its implementation.

## Architecture

- `native/MusicMetadata.swift` is the macOS Music integration. It uses ScriptingBridge, not JXA or JavaScript for Automation.
- `native/MusicMetadata.ps1` is the Windows integration. It must read only Apple Music sessions through Windows Media Control APIs.
- `src/discord-ipc.ts` owns the local Discord IPC transport. Do not add a remote relay or require a bot token, client secret, or Discord OAuth login.
- `src/index.ts` coordinates the Music watcher, artwork lookup, and reconnect-safe activity publishing.
- Album artwork is optional. Playback presence must continue when Apple's search endpoint is unavailable.
- Runtime dependencies should remain at zero unless a dependency clearly reduces security or maintenance risk.

## Development

Requirements are Node.js 20 or newer and, on macOS, the Xcode Command Line Tools.

```sh
npm install
npm run check
npm test
npm run verify
```

`npm run verify` is the required pre-commit check. It compiles the Swift helper, performs strict TypeScript compilation, and runs all unit tests.

## Change rules

- Preserve support for Apple Silicon, current macOS releases, and Windows 10 1809+ / Windows 11 x64.
- Never commit a Discord client secret, bot token, personal configuration, compiled helper, logs, or `node_modules`.
- The Discord Application ID is public and may be committed only when the project owner intentionally chooses a shared application.
- Keep IPC framing little-endian and retain support for Unix sockets or Windows named-pipe slots `discord-ipc-0` through `discord-ipc-9`.
- Maintain automatic Discord reconnection and activity replay after reconnect.
- Add or update tests for presence formatting, state transitions, timestamps, and IPC framing when those areas change.
- Treat Music/Discord end-to-end testing as manual because it needs an interactive desktop session and signed-in apps; macOS also needs Automation permission.

## Documentation

Update `README.md` whenever installation, permissions, configuration, or troubleshooting behavior changes. Document any step that users must perform outside the app.

## Git

- Use focused commits with imperative subjects.
- Do not commit generated files from `dist/`, `.build/`, or `bin/music-metadata`.
- Pull requests must pass both macOS and Windows CI jobs.
