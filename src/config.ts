import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { AppConfig } from "./types.js";

type PartialConfig = Partial<Omit<AppConfig, "artwork">> & {
  artwork?: Partial<AppConfig["artwork"]>;
};

const configPaths = [
  process.env.AMDP_CONFIG,
  join(homedir(), "Library", "Application Support", "Apple Music Discord Presence", "config.json"),
  join(homedir(), ".config", "apple-music-discord-presence", "config.json"),
].filter((value): value is string => Boolean(value));

export async function loadConfig(): Promise<AppConfig> {
  let fileConfig: PartialConfig = {};
  for (const path of configPaths) {
    try {
      fileConfig = JSON.parse(await readFile(path, "utf8")) as PartialConfig;
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  const discordClientId = process.env.DISCORD_CLIENT_ID ?? fileConfig.discordClientId;
  if (!discordClientId || !/^\d{17,20}$/.test(discordClientId)) {
    throw new Error("Set a valid discordClientId in config.json or DISCORD_CLIENT_ID.");
  }

  return {
    discordClientId,
    pollIntervalMs: Math.max(250, fileConfig.pollIntervalMs ?? 1000),
    showPaused: fileConfig.showPaused ?? true,
    artwork: {
      enabled: fileConfig.artwork?.enabled ?? true,
      country: fileConfig.artwork?.country ?? "US",
    },
    ...(fileConfig.fallbackLargeImageKey
      ? { fallbackLargeImageKey: fileConfig.fallbackLargeImageKey }
      : {}),
  };
}
