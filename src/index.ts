#!/usr/bin/env node
import { ArtworkResolver, type ArtworkResult } from "./artwork.js";
import { displaySettingsFromConfig, loadConfig, saveDisplaySettings } from "./config.js";
import { DiscordIpc } from "./discord-ipc.js";
import { MusicWatcher } from "./music.js";
import { createActivity, trackKey } from "./presence.js";
import { SettingsServer } from "./settings-server.js";
import type { MusicSnapshot } from "./types.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const stamp = () => new Date().toISOString();
const log = (message: string) => console.log(`[${stamp()}] ${message}`);

async function main(): Promise<void> {
  if (process.platform !== "darwin" && process.platform !== "win32") {
    throw new Error("This application requires macOS or Windows.");
  }
  let config = await loadConfig();
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const discord = new DiscordIpc(config.discordClientId);
  const music = new MusicWatcher(config.pollIntervalMs);
  const artworkResolver = new ArtworkResolver(config.artwork.country);
  let latest: MusicSnapshot | undefined;
  let latestArtwork: ArtworkResult | undefined;
  let currentTrackKey = "";
  let lastPresenceSignature = "";
  let artworkGeneration = 0;
  let previousSnapshot: MusicSnapshot | undefined;
  let previousSnapshotAt = Date.now();

  const publish = () => {
    if (!latest || !discord.isReady()) return;
    const activity = createActivity(latest, latestArtwork, {
      ...config.presence,
      showArtwork: config.artwork.enabled,
      showPaused: config.showPaused,
    }, config.fallbackLargeImageKey);
    const signature = JSON.stringify(activity);
    if (signature === lastPresenceSignature) return;
    discord.setActivity(activity);
    lastPresenceSignature = signature;
    log(activity ? `${latest.state}: ${latest.artist ?? "Unknown artist"} · ${latest.name}` : "Presence cleared");
  };

  const resolveArtwork = (snapshot: MusicSnapshot, generation: number) => {
    if (!config.artwork.enabled && !config.presence.showButton) return;
    void artworkResolver.resolve(snapshot).then((artwork) => {
      if (generation !== artworkGeneration) return;
      latestArtwork = artwork;
      lastPresenceSignature = "";
      publish();
    });
  };

  const settingsServer = new SettingsServer({
    root,
    getSettings: () => displaySettingsFromConfig(config),
    getStatus: () => ({ discordConnected: discord.isReady() }),
    saveSettings: async (settings) => {
      config = await saveDisplaySettings(settings);
      lastPresenceSignature = "";
      publish();
      if (latest && !latestArtwork) resolveArtwork(latest, artworkGeneration);
      return displaySettingsFromConfig(config);
    },
  });
  try {
    await settingsServer.start();
    log(`Settings available at ${settingsServer.origin}`);
  } catch (error) {
    console.error(`[${stamp()}] Settings unavailable: ${error instanceof Error ? error.message : String(error)}`);
  }

  discord.on("ready", () => {
    log("Connected to Discord");
    lastPresenceSignature = "";
    publish();
  });
  discord.on("disconnected", () => log("Discord disconnected"));
  discord.on("reconnecting", (delay: number) => log(`Discord unavailable; retrying in ${delay}ms`));
  discord.on("warning", (message: string) => console.error(`[${stamp()}] ${message}`));

  music.on("snapshot", (snapshot: MusicSnapshot) => {
    const observedAt = Date.now();
    const prior = previousSnapshot;
    const priorObservedAt = previousSnapshotAt;
    previousSnapshot = snapshot;
    previousSnapshotAt = observedAt;
    const nextTrackKey = trackKey(snapshot);
    latest = snapshot;
    if (nextTrackKey !== currentTrackKey) {
      currentTrackKey = nextTrackKey;
      latestArtwork = undefined;
      const generation = ++artworkGeneration;
      publish();
      if (nextTrackKey) resolveArtwork(snapshot, generation);
    } else {
      const stateChanged = prior?.state !== snapshot.state;
      const elapsed = (observedAt - priorObservedAt) / 1000;
      const expectedPosition = (prior?.position ?? snapshot.position ?? 0) +
        (prior?.state === "playing" ? elapsed : 0);
      const seeked = snapshot.position !== undefined && Math.abs(snapshot.position - expectedPosition) > 2.5;
      if (stateChanged || seeked) {
        lastPresenceSignature = "";
        publish();
      }
    }
  });
  music.on("warning", (message: string) => console.error(`[${stamp()}] ${message}`));
  music.on("error", (error: Error) => console.error(`[${stamp()}] ${error.message}`));

  const shutdown = () => {
    music.stop();
    settingsServer.stop();
    if (discord.isReady()) discord.setActivity(null);
    discord.stop();
    setTimeout(() => process.exit(0), 50).unref();
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  discord.start();
  music.start();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
