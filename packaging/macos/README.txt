APPLE MUSIC DISCORD PRESENCE | macOS Apple Silicon

1. Extract the ZIP.
2. Right-click Install.command and choose Open.
3. The shared Discord application is configured automatically. No ID or login needed.
4. Allow Music automation when macOS asks.

The app is copied to ~/Applications; reopen it there or with Spotlight. Use Uninstall.command to remove
login startup. No Node.js installation is required.

CUSTOMIZATION

Click the music-note menu bar icon > 설정 열기 to open settings. Changes are
saved immediately and do not require a restart.

For advanced settings, edit this file and then choose 다시 연결 from the menu:
~/Library/Application Support/Apple Music Discord Presence/config.json

- showPaused: show or hide paused tracks
- presence.showAlbum: show or hide the album name
- presence.showTimeRemaining: show or hide playback time
- presence.showButton: show or hide the Apple Music button
- presence.displayOrder: "artist-album" or "album-artist"
- artwork.enabled: show or hide album artwork

Enable launch at login from the icon menu if desired. Quit from that menu before upgrading or uninstalling. Turning off launch at login and quitting are separate actions.
