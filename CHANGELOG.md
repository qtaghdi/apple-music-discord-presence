# Changelog

All notable user-facing changes are recorded here. Release-specific download notes live in [`releases/`](releases/).

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

[0.2.0]: https://github.com/qtaghdi/apple-music-discord-presence/releases/tag/v0.2.0
[0.1.0]: https://github.com/qtaghdi/apple-music-discord-presence/commits/9ebfbfc
