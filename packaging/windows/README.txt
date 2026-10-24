APPLE MUSIC DISCORD PRESENCE | Windows 10/11

1. Move this entire folder somewhere permanent.
2. Double-click Install.cmd.
3. The shared Discord application is configured automatically. No ID or login needed.
4. Keep Apple Music and the Discord desktop app open while listening.

Keep this folder in place after installation. Use Uninstall.cmd to remove
login startup. No Node.js installation is required.

CUSTOMIZATION

Right-click the tray icon > Open Settings (or double-click the icon).
The icon may be under the hidden-icons arrow. Reopen the app from the Start menu. Changes are saved
immediately and do not require a restart.

For advanced settings, edit this file and then choose Reconnect from the tray menu:
%APPDATA%\Apple Music Discord Presence\config.json

- showPaused: show or hide paused tracks
- presence.showAlbum: show or hide the album name
- presence.showTimeRemaining: show or hide playback time
- presence.showButton: show or hide the Apple Music button
- presence.displayOrder: "artist-album" or "album-artist"
- artwork.enabled: show or hide album artwork

Enable launch at login from the icon menu if desired. Quit from that menu before upgrading or uninstalling. Turning off launch at login and quitting are separate actions.
