import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { AppConfig, DisplaySettings } from "./types.js";

type PartialConfig = Partial<Omit<AppConfig, "artwork" | "presence">> & {
  artwork?: Partial<AppConfig["artwork"]>;
  presence?: Partial<AppConfig["presence"]>;
};

interface ConfigSource {
  path: string;
  value: PartialConfig;
}

export function defaultConfigPaths(
  platform: NodeJS.Platform = process.platform,
  environment: NodeJS.ProcessEnv = process.env,
): string[] {
  const platformPath = platform === "win32"
    ? join(environment.APPDATA ?? join(homedir(), "AppData", "Roaming"), "Apple Music Discord Presence", "config.json")
    : join(homedir(), "Library", "Application Support", "Apple Music Discord Presence", "config.json");
  return [
    environment.AMDP_CONFIG,
    platformPath,
    join(homedir(), ".config", "apple-music-discord-presence", "config.json"),
  ].filter((value): value is string => Boolean(value));
}

export async function loadConfig(): Promise<AppConfig> {
  const { value: fileConfig } = await readConfigSource();

  const discordClientId = process.env.DISCORD_CLIENT_ID ?? fileConfig.discordClientId;
  if (!discordClientId || !/^\d{17,20}$/.test(discordClientId)) {
    throw new Error("Set a valid discordClientId in config.json or DISCORD_CLIENT_ID.");
  }
  const displayOrder = fileConfig.presence?.displayOrder ?? "artist-album";
  if (displayOrder !== "artist-album" && displayOrder !== "album-artist") {
    throw new Error('presence.displayOrder must be "artist-album" or "album-artist".');
  }

  return {
    discordClientId,
    pollIntervalMs: Math.max(250, fileConfig.pollIntervalMs ?? 1000),
    showPaused: fileConfig.showPaused ?? true,
    presence: {
      showAlbum: fileConfig.presence?.showAlbum ?? true,
      showTimeRemaining: fileConfig.presence?.showTimeRemaining ?? true,
      showButton: fileConfig.presence?.showButton ?? true,
      displayOrder,
    },
    artwork: {
      enabled: fileConfig.artwork?.enabled ?? true,
      country: fileConfig.artwork?.country ?? "US",
    },
    ...(fileConfig.fallbackLargeImageKey
      ? { fallbackLargeImageKey: fileConfig.fallbackLargeImageKey }
      : {}),
  };
}

async function readConfigSource(): Promise<ConfigSource> {
  const paths = defaultConfigPaths();
  for (const path of paths) {
    try {
      return { path, value: JSON.parse(await readFile(path, "utf8")) as PartialConfig };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  const path = paths[1] ?? paths[0];
  if (!path) throw new Error("Could not determine the configuration path.");
  return { path, value: {} };
}

export function displaySettingsFromConfig(config: AppConfig): DisplaySettings {
  return {
    showAlbum: config.presence.showAlbum,
    showArtwork: config.artwork.enabled,
    showTimeRemaining: config.presence.showTimeRemaining,
    showButton: config.presence.showButton,
    showPaused: config.showPaused,
    displayOrder: config.presence.displayOrder,
  };
}

export function parseDisplaySettings(value: unknown): DisplaySettings {
  if (!value || typeof value !== "object") throw new Error("Settings must be an object.");
  const input = value as Record<string, unknown>;
  const booleanKeys = ["showAlbum", "showArtwork", "showTimeRemaining", "showButton", "showPaused"] as const;
  for (const key of booleanKeys) {
    if (typeof input[key] !== "boolean") throw new Error(`${key} must be true or false.`);
  }
  if (input.displayOrder !== "artist-album" && input.displayOrder !== "album-artist") {
    throw new Error('displayOrder must be "artist-album" or "album-artist".');
  }
  return {
    showAlbum: input.showAlbum as boolean,
    showArtwork: input.showArtwork as boolean,
    showTimeRemaining: input.showTimeRemaining as boolean,
    showButton: input.showButton as boolean,
    showPaused: input.showPaused as boolean,
    displayOrder: input.displayOrder,
  };
}

export async function saveDisplaySettings(settings: DisplaySettings): Promise<AppConfig> {
  const validated = parseDisplaySettings(settings);
  const source = await readConfigSource();
  const updated: PartialConfig = {
    ...source.value,
    showPaused: validated.showPaused,
    presence: {
      ...source.value.presence,
      showAlbum: validated.showAlbum,
      showTimeRemaining: validated.showTimeRemaining,
      showButton: validated.showButton,
      displayOrder: validated.displayOrder,
    },
    artwork: {
      ...source.value.artwork,
      enabled: validated.showArtwork,
    },
  };
  await mkdir(dirname(source.path), { recursive: true });
  const temporaryPath = `${source.path}.tmp-${process.pid}`;
  await writeFile(temporaryPath, `${JSON.stringify(updated, null, 2)}\n`, { mode: 0o600 });
  await rename(temporaryPath, source.path);
  if (process.platform !== "win32") await chmod(source.path, 0o600);
  return loadConfig();
}
