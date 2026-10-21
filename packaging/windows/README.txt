APPLE MUSIC DISCORD PRESENCE | Windows 10/11

1. Move this entire folder somewhere permanent.
2. Double-click Install.cmd.
3. Paste your Discord Application ID when asked.
4. Keep Apple Music and the Discord desktop app open while listening.

Keep this folder in place after installation. Use Uninstall.cmd to remove
login startup. No Node.js installation is required.

CUSTOMIZATION

Double-click Settings.cmd to open the local settings screen. Changes are saved
immediately and do not require a restart.

For advanced settings, edit this file and then run Restart.cmd:
%APPDATA%\Apple Music Discord Presence\config.json

- showPaused: show or hide paused tracks
- presence.showAlbum: show or hide the album name
- presence.showTimeRemaining: show or hide playback time
- presence.showButton: show or hide the Apple Music button
- presence.displayOrder: "artist-album" or "album-artist"
- artwork.enabled: show or hide album artwork
