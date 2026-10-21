import type { ArtworkResult } from "./artwork.js";
import type { DiscordActivity, MusicSnapshot } from "./types.js";

const limit = (value: string, max = 128) =>
  value.length <= max ? value : `${value.slice(0, max - 1)}…`;

export function trackKey(track: MusicSnapshot): string {
  return [track.persistentId, track.name, track.artist, track.album].filter(Boolean).join("|");
}

export function createActivity(
  track: MusicSnapshot,
  artwork: ArtworkResult | undefined,
  fallbackLargeImageKey?: string,
): DiscordActivity | null {
  if ((track.state !== "playing" && track.state !== "paused") || !track.name) return null;
  const artist = track.artist || track.albumArtist || "Unknown artist";
  const activity: DiscordActivity = {
    type: 2,
    details: limit(track.name),
    state: limit(track.album ? `${artist} — ${track.album}` : artist),
  };

  if (track.state === "playing" && track.duration && track.position !== undefined) {
    const now = Math.floor(Date.now() / 1000);
    const position = Math.max(0, Math.min(track.duration, track.position));
    activity.timestamps = {
      start: now - Math.floor(position),
      end: now + Math.max(0, Math.ceil(track.duration - position)),
    };
  }

  const largeImage = artwork?.artworkUrl ?? fallbackLargeImageKey;
  if (largeImage) {
    activity.assets = {
      large_image: largeImage,
      ...(track.album ? { large_text: limit(track.album) } : {}),
    };
  }
  if (artwork?.trackUrl) {
    activity.buttons = [{ label: "Listen on Apple Music", url: artwork.trackUrl }];
  }
  return activity;
}
