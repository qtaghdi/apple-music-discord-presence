# Changelog

All notable user-facing changes are recorded here. Release-specific download notes live in [`releases/`](releases/).

## [0.4.1] - 2026-10-21

### Added

- A new quiet, painterly settings theme with muted blue, lavender, and dusty-pink color fields.
- Subtle motion for background layers, status lights, artwork, progress, settings rows, buttons, and the Discord preview card.
- Original abstract artwork for the built-in Discord preview.

### Changed

- Reworked the settings layout to keep the controls and preview visible together on desktop while preserving a clean mobile stack.
- Added reduced-motion behavior so system accessibility preferences disable decorative animation and pointer tilt.
- Compressed visual assets to WebP to keep release downloads small.

## [0.4.0] - 2026-10-21

### Added

- A local graphical settings screen with a live Discord activity preview.
- One-click `Settings.command` and `Settings.cmd` launchers in the macOS and Windows ZIPs.
- Immediate activity updates after saving album, artwork, timestamp, button, paused-state, or metadata-order preferences.

### Changed

- Display settings can now be changed without editing JSON or restarting the app.
- The settings service listens only on `127.0.0.1`, accepts same-origin updates, and preserves advanced configuration such as the Discord Application ID.
- Expanded automated coverage from sixteen to nineteen tests, including local-server access and safe configuration writes.

### Known limitations

- A Discord Application ID must still be entered during first installation until a shared project ID is embedded.
- Windows end-to-end playback testing requires an interactive Windows desktop with Apple Music and Discord signed in.
- macOS downloads are not signed or notarized, so the first launch may require **Right-click → Open**.

## [0.3.0] - 2026-10-21

### Added

- Configurable album names, album artwork, playback timestamps, paused activity, and Apple Music buttons.
- Artist-first and album-first metadata ordering.
- One-click restart helpers for macOS and Windows ZIP installations.

### Changed

- Installers now preserve an existing `config.json` during upgrades.
- Apple catalog lookup can still provide the Apple Music button when album artwork is hidden.
- Expanded automated coverage from nine to sixteen tests, including configuration compatibility and display combinations.

### Known limitations

- A Discord Application ID must still be entered during first installation until a shared project ID is embedded.
- Configuration is file-based and requires restarting the app to apply changes.
- Windows end-to-end playback testing requires an interactive Windows desktop with Apple Music and Discord signed in.
- macOS downloads are not signed or notarized, so the first launch may require **Right-click → Open**.

## [0.2.0] - 2026-10-21

### Added

- Windows 10/11 support through Windows Global System Media Transport Controls.
- Discord named-pipe support on Windows.
- Self-contained macOS Apple Silicon and Windows x64 release ZIPs with private Node.js runtimes.
- Login-startup installers and uninstallers for both platforms.
- GitHub Pages product website with platform-aware downloads.
- Automated cross-platform CI, release packaging, and GitHub Pages deployment.

### Changed

- Expanded the project from macOS-only to macOS and Windows.
- Increased automated test coverage from six to nine tests.
- Corrected the source-installation start command to use the compiled entry point.

### Known limitations

- A Discord Application ID must still be entered during installation until a shared project ID is embedded.
- Windows end-to-end playback testing requires an interactive Windows desktop with Apple Music and Discord signed in.
- macOS downloads are not signed or notarized, so the first launch may require **Right-click → Open**.

## [0.1.0] - 2026-10-21

### Added

- Initial macOS Apple Silicon implementation.
- Swift ScriptingBridge metadata helper without JXA.
- Direct Discord IPC, automatic reconnect, timestamps, seeks, and optional album artwork.
- LaunchAgent installer, documentation, and unit tests.

[0.4.1]: https://github.com/qtaghdi/apple-music-discord-presence/releases/tag/v0.4.1
[0.4.0]: https://github.com/qtaghdi/apple-music-discord-presence/releases/tag/v0.4.0
[0.3.0]: https://github.com/qtaghdi/apple-music-discord-presence/releases/tag/v0.3.0
[0.2.0]: https://github.com/qtaghdi/apple-music-discord-presence/releases/tag/v0.2.0
[0.1.0]: https://github.com/qtaghdi/apple-music-discord-presence/commits/9ebfbfc
