#!/usr/bin/env node
import { ArtworkResolver, type ArtworkResult } from "./artwork.js";
import { loadConfig } from "./config.js";
import { DiscordIpc } from "./discord-ipc.js";
import { MusicWatcher } from "./music.js";
import { createActivity, trackKey } from "./presence.js";
import type { MusicSnapshot } from "./types.js";

const stamp = () => new Date().toISOString();
const log = (message: string) => console.log(`[${stamp()}] ${message}`);

async function main(): Promise<void> {
  if (process.platform !== "darwin" && process.platform !== "win32") {
    throw new Error("This application requires macOS or Windows.");
  }
  const config = await loadConfig();
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
    const activity = latest.state === "paused" && !config.showPaused
      ? null
      : createActivity(latest, latestArtwork, config.fallbackLargeImageKey);
    const signature = JSON.stringify(activity);
    if (signature === lastPresenceSignature) return;
    discord.setActivity(activity);
    lastPresenceSignature = signature;
    log(activity ? `${latest.state}: ${latest.artist ?? "Unknown artist"} — ${latest.name}` : "Presence cleared");
  };

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
      if (config.artwork.enabled && nextTrackKey) {
        void artworkResolver.resolve(snapshot).then((artwork) => {
          if (generation !== artworkGeneration) return;
          latestArtwork = artwork;
          lastPresenceSignature = "";
          publish();
        });
      }
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
