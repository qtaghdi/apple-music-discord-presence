import type { ArtworkResult } from "./artwork.js";
import type { DiscordActivity, MusicSnapshot, PresenceOptions } from "./types.js";

const limit = (value: string, max = 128) =>
  value.length <= max ? value : `${value.slice(0, max - 1)}…`;

export const defaultPresenceOptions: PresenceOptions = {
  showAlbum: true,
  showArtwork: true,
  showTimeRemaining: true,
  showButton: true,
  showPaused: false,
  displayOrder: "artist-album",
};

export function trackKey(track: MusicSnapshot): string {
  return [track.persistentId, track.name, track.artist, track.album].filter(Boolean).join("|");
}

export function createActivity(
  track: MusicSnapshot,
  artwork: ArtworkResult | undefined,
  options: PresenceOptions = defaultPresenceOptions,
  fallbackLargeImageKey?: string,
): DiscordActivity | null {
  if ((track.state !== "playing" && track.state !== "paused") || !track.name) return null;
  if (track.state === "paused" && !options.showPaused) return null;
  const artist = track.artist || track.albumArtist || "Unknown artist";
  const state = options.showAlbum && track.album
    ? options.displayOrder === "album-artist"
      ? `${track.album} · ${artist}`
      : `${artist} · ${track.album}`
    : artist;
  const activity: DiscordActivity = {
    type: 2,
    status_display_type: 2,
    details: limit(`${artist} - ${track.name}`),
    state: limit(state),
  };

  if (options.showTimeRemaining && track.state === "playing" && track.duration !== undefined && Number.isFinite(track.duration) && track.duration > 0 && track.position !== undefined && Number.isFinite(track.position)) {
    const now = Math.floor(Date.now() / 1000);
    const position = Math.max(0, Math.min(track.duration, track.position));
    activity.timestamps = {
      start: now - Math.floor(position),
      end: now - Math.floor(position) + Math.ceil(track.duration),
    };
  }

  const largeImage = options.showArtwork
    ? artwork?.artworkUrl ?? fallbackLargeImageKey
    : undefined;
  if (largeImage) {
    activity.assets = {
      large_image: largeImage,
      ...(options.showAlbum && track.album ? { large_text: limit(track.album) } : {}),
    };
  }
  if (options.showButton && artwork?.trackUrl) {
    activity.buttons = [{ label: "Listen on Apple Music", url: artwork.trackUrl }];
  }
  return activity;
}
