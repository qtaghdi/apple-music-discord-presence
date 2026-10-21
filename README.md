# Apple Music Discord Presence

Show the track playing in the macOS Music app as Discord Rich Presence. This is a new, independent implementation for Apple Silicon Macs; it does not modify or redistribute code from the earlier projects that inspired it.

## Why this implementation

- No JXA: a small compiled Swift helper reads Music through macOS ScriptingBridge, avoiding the recent `osascript -l JavaScript` failures.
- No runtime package dependencies and no third-party Deno service.
- Direct Discord IPC with all `discord-ipc-0` through `discord-ipc-9` sockets, reconnect backoff, ping/pong handling, and activity replay after Discord restarts.
- Detects track changes, play/pause transitions, and seeks. Playing tracks include accurate start/end timestamps.
- Optional album artwork and an Apple Music button via Apple's public iTunes Search API. Playback still works if the lookup is offline or unavailable.
- A LaunchAgent installer starts the service automatically when you log in.

## Requirements

- An Apple Silicon Mac running macOS 13 or later (macOS 26 is supported by design)
- The desktop Music and Discord apps
- Node.js 20 or newer
- Xcode Command Line Tools (`xcode-select --install` if `swiftc` is missing)
- A free Discord application ID

## Set up

1. Open the [Discord Developer Portal](https://discord.com/developers/applications), select **New Application**, and name it `Apple Music` (this name is shown in your activity).
2. Copy the **Application ID** from **General Information**. A bot token is neither needed nor used.
3. Clone and build:

   ```sh
   git clone https://github.com/qtaghdi/apple-music-discord-presence.git
   cd apple-music-discord-presence
   npm install
   npm run build
   ```

4. Create the configuration file:

   ```sh
   mkdir -p "$HOME/Library/Application Support/Apple Music Discord Presence"
   cp config.example.json "$HOME/Library/Application Support/Apple Music Discord Presence/config.json"
   ```

   Replace `YOUR_DISCORD_APPLICATION_ID` in that file. Change the artwork country from `KR` if your Apple Music storefront is elsewhere.

5. Start Music and Discord, then run once in the foreground:

   ```sh
   npm start
   ```

   Accept macOS's request to let `music-metadata` control Music. Play a song and confirm the activity appears in Discord.

## Start automatically at login

Pass your Application ID to the installer. It builds the project, creates a private config file if needed, installs a per-user LaunchAgent, and starts it immediately:

```sh
npm run install-agent -- YOUR_DISCORD_APPLICATION_ID
```

The repository must remain at the same path while the agent is installed. To stop it and move its property-list file to the Trash:

```sh
npm run uninstall-agent
```

The uninstaller deliberately keeps your configuration and logs.

## Configuration

The app reads the first available source below:

1. the file named by `AMDP_CONFIG`
2. `~/Library/Application Support/Apple Music Discord Presence/config.json`
3. `~/.config/apple-music-discord-presence/config.json`

`DISCORD_CLIENT_ID` overrides the ID in the file. Available settings:

```json
{
  "discordClientId": "123456789012345678",
  "pollIntervalMs": 1000,
  "showPaused": true,
  "artwork": { "enabled": true, "country": "KR" },
  "fallbackLargeImageKey": "apple_music"
}
```

`fallbackLargeImageKey` is optional. If used, upload an image with that key under the application's Rich Presence art assets in the Discord Developer Portal.

## Troubleshooting

### Activity does not appear

- Use the full desktop Discord app; the browser client does not expose local IPC.
- In Discord, enable **User Settings → Activity Privacy → Share your detected activities with others**.
- Confirm the Application ID is the numeric ID, not a client secret or bot token.
- Quit Discord completely, reopen it, and leave this service running. It reconnects automatically within 30 seconds.
- Discord may suppress competing activities. Stop other Rich Presence tools while testing.

### Music metadata is empty or permission was denied

- Open **System Settings → Privacy & Security → Automation** and allow the helper or the terminal that launched it to control Music.
- Run `./bin/music-metadata --once` in Terminal. It should print one JSON line and can trigger the permission request.
- If Music is not running, the helper intentionally reports a stopped/unavailable state and clears Discord activity.
- Rebuilding changes the unsigned helper binary. If macOS asks again after an update, grant access again.

### Album art is missing

Artwork lookup is best-effort. It needs HTTPS access to `itunes.apple.com`, and some local files or region-specific releases will not match. The track text and timestamps continue without it. Set `artwork.enabled` to `false` for fully local operation, or configure `fallbackLargeImageKey`.

### Login service does not start

Logs are written to:

- `~/Library/Logs/Apple Music Discord Presence/app.log`
- `~/Library/Logs/Apple Music Discord Presence/error.log`

Node installed by a version manager may move during upgrades. Rerun `npm run install-agent -- YOUR_DISCORD_APPLICATION_ID` so the LaunchAgent records the current absolute Node path.

## Development and verification

```sh
npm run check
npm test
npm run verify
```

`npm run verify` compiles the native arm64 helper, performs strict TypeScript compilation, and runs the unit tests. A complete integration test still requires an interactive user session with Music playing, Discord signed in, macOS Automation permission granted, and a real Discord application ID.

## Privacy

Track metadata stays on your Mac except when optional artwork lookup sends the artist, album, and title to Apple's iTunes Search API. Discord receives the presence you publish. No credentials, Apple Music token, Discord bot token, analytics, or intermediary server are used.

## License

[MIT](LICENSE)
