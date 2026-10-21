export type PlaybackState = "playing" | "paused" | "stopped" | "unavailable";

export interface MusicSnapshot {
  state: PlaybackState;
  name?: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  duration?: number;
  position?: number;
  persistentId?: string;
}

export interface AppConfig {
  discordClientId: string;
  pollIntervalMs: number;
  showPaused: boolean;
  artwork: {
    enabled: boolean;
    country: string;
  };
  fallbackLargeImageKey?: string;
}

export interface DiscordActivity {
  type: 2;
  details: string;
  state: string;
  timestamps?: { start: number; end: number };
  assets?: { large_image: string; large_text?: string };
  buttons?: Array<{ label: string; url: string }>;
}
