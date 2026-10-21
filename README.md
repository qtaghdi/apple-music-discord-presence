# Apple Music Discord Presence

[![CI](https://github.com/qtaghdi/apple-music-discord-presence/actions/workflows/ci.yml/badge.svg)](https://github.com/qtaghdi/apple-music-discord-presence/actions/workflows/ci.yml)
[![Website](https://img.shields.io/badge/website-GitHub%20Pages-fa547f)](https://qtaghdi.github.io/apple-music-discord-presence/)

Show the track playing in Apple Music as Discord Rich Presence on macOS and Windows. This is a new, independent implementation; it does not modify or redistribute code from earlier projects that inspired it.

## Download

The release ZIPs include a private Node.js runtime, so end users do not need to install Node, npm, or developer tools.

- [Download for macOS Apple Silicon](https://github.com/qtaghdi/apple-music-discord-presence/releases/latest/download/apple-music-discord-presence-macos-arm64.zip)
- [Download for Windows x64](https://github.com/qtaghdi/apple-music-discord-presence/releases/latest/download/apple-music-discord-presence-windows-x64.zip)
- [Open the product website](https://qtaghdi.github.io/apple-music-discord-presence/)

After extracting the ZIP, keep its folder somewhere permanent and run `Install.command` on macOS or `Install.cmd` on Windows. The installer asks for a Discord Application ID once and configures login startup. Open `Settings.command` on macOS or `Settings.cmd` on Windows whenever you want to customize the activity.

## Why this implementation

- On macOS, a compiled Swift helper uses ScriptingBridge instead of JXA, avoiding `osascript -l JavaScript` failures.
- On Windows 10/11, a PowerShell helper reads Apple Music through Windows Global System Media Transport Controls.
- Direct Discord IPC supports Unix sockets on macOS and named pipes on Windows, including all slots from `discord-ipc-0` through `discord-ipc-9`.
- Reconnect backoff and activity replay survive Discord restarts.
- Track changes, play/pause transitions, seeks, and an accurate elapsed timestamp are handled.
- Album details, artwork, playback progress, pause state, the Apple Music button, and metadata order are configurable.
- A private, local settings screen includes a live Discord preview and applies changes without restarting.
- Optional artwork comes directly from Apple's public iTunes Search API and never blocks text presence.
- There are no runtime npm dependencies, remote relay, analytics, bot token, client secret, or Discord OAuth login.

## Requirements

### End users

- macOS 13+ on Apple Silicon, or Windows 10 version 1809+ / Windows 11 x64
- The Apple Music and Discord desktop apps
- A public Discord Application ID supplied by the distributor or created in the [Discord Developer Portal](https://discord.com/developers/applications)

Only the numeric Application ID is used. Never place a Discord client secret or bot token in the config.

### Source development

- Node.js 20+
- On macOS, Xcode Command Line Tools for `swiftc`

```sh
git clone https://github.com/qtaghdi/apple-music-discord-presence.git
cd apple-music-discord-presence
npm install
npm run verify
```

On Windows, use `npm run build:ts && npm test`; the native Swift helper is macOS-only.

## Source installation on macOS

Create `~/Library/Application Support/Apple Music Discord Presence/config.json` from `config.example.json`, then run:

```sh
npm start
```

Accept macOS's request to let `music-metadata` control Music. For automatic login startup:

```sh
npm run install-agent -- YOUR_DISCORD_APPLICATION_ID
```

Remove it with `npm run uninstall-agent`. The repository must remain at the same path while its LaunchAgent is installed.

## Configuration

### Local settings screen

ZIP installations include `Settings.command` on macOS and `Settings.cmd` on Windows. The launcher opens a settings page served only from `127.0.0.1` while the app is running. It can change album details, artwork, playback progress, the Apple Music button, paused activity, and artist/album ordering. Saving updates the current Discord activity immediately.

The settings page never exposes or changes the Discord Application ID. It has no external server, account, analytics, or internet-facing listener.

### Advanced configuration

The app reads `AMDP_CONFIG` first, then the platform config:

- macOS: `~/Library/Application Support/Apple Music Discord Presence/config.json`
- Windows: `%APPDATA%\Apple Music Discord Presence\config.json`
- Fallback: `~/.config/apple-music-discord-presence/config.json`

`DISCORD_CLIENT_ID` overrides the ID in the file.

```json
{
  "discordClientId": "123456789012345678",
  "pollIntervalMs": 1000,
  "showPaused": true,
  "presence": {
    "showAlbum": true,
    "showTimeRemaining": true,
    "showButton": true,
    "displayOrder": "artist-album"
  },
  "artwork": { "enabled": true, "country": "KR" },
  "fallbackLargeImageKey": "apple_music"
}
```

Presence options:

| Setting | Effect |
| --- | --- |
| `showPaused` | Keep the current track visible while playback is paused. |
| `presence.showAlbum` | Include the album name next to the artist and in the artwork tooltip. |
| `presence.showTimeRemaining` | Show Discord's elapsed playback timer, starting at the current song position. |
| `presence.showButton` | Add the **Listen on Apple Music** button when a catalog match is found. |
| `presence.displayOrder` | Use `artist-album` for `Artist · Album` or `album-artist` for `Album · Artist`. |
| `artwork.enabled` | Show album artwork when a catalog match is found. |

Restart the app after manually changing `config.json`. Settings saved through the local screen apply immediately. ZIP installations include `Restart.command` on macOS and `Restart.cmd` on Windows. Installers preserve an existing configuration during upgrades.

`fallbackLargeImageKey` is optional. If used, upload an image with that key under the Discord application's Rich Presence art assets.

## Troubleshooting

### Activity does not appear

- Use the full Discord desktop app; the browser client has no local IPC.
- Enable **User Settings → Activity Privacy → Share your detected activities with others**.
- Confirm the Application ID is numeric, not a client secret or bot token.
- Quit Discord completely and reopen it. The app reconnects automatically within 30 seconds.
- Temporarily stop other Rich Presence tools while testing.

### Settings screen does not open

- Run `Install.command` or `Install.cmd` first. If the app was already installed, run the included restart helper and try again.
- The settings page is available only on this computer at `http://127.0.0.1:47621` while the background app is running.
- Check the platform log for another program already using port `47621`.

### macOS metadata or permission problem

- Open **System Settings → Privacy & Security → Automation** and allow the helper or terminal to control Music.
- Run `./bin/music-metadata --once` to print one diagnostic JSON line and trigger the permission request.
- Rebuilding changes the unsigned helper binary, so macOS may ask again after an update.

### Windows metadata problem

- Use the current Microsoft Store Apple Music app on Windows 10 1809 or later.
- Start playback before testing. Windows exposes metadata only while Apple Music has a system media session.
- Run `powershell.exe -ExecutionPolicy Bypass -File native\MusicMetadata.ps1 -Once` for one diagnostic JSON line.
- Logs from the ZIP installation are under `%LOCALAPPDATA%\Apple Music Discord Presence\Logs`.

### Album art is missing

Artwork lookup needs HTTPS access to `itunes.apple.com`, and some local or region-specific releases may not match. Presence continues without it. Set `artwork.enabled` to `false` for fully local operation or configure `fallbackLargeImageKey`.

## Development and releases

```sh
npm run check
npm test
npm run verify
```

The CI workflow verifies TypeScript and tests on macOS and Windows, plus the native arm64 helper on macOS. Tags matching `v*` produce self-contained ZIPs and publish a GitHub Release. GitHub Pages deploys the static site from `site/`.

Each tag requires a curated `releases/vX.Y.Z.md` note based on `releases/TEMPLATE.md`. User-facing changes are also accumulated in [`CHANGELOG.md`](CHANGELOG.md).

Full Music-to-Discord integration tests remain manual because they need an interactive desktop session, signed-in apps, a real Application ID, and macOS Automation permission where applicable.

## Privacy

Track metadata stays on the computer except when artwork or the Apple Music button is enabled; catalog lookup then sends artist, album, and title to Apple's iTunes Search API. Set both `artwork.enabled` and `presence.showButton` to `false` for fully local metadata handling. Discord receives the presence being published. No credentials, Apple Music token, Discord bot token, analytics, or intermediary server are used.

## License

[MIT](LICENSE)
