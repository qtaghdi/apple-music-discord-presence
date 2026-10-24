import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SHARED_DISCORD_CLIENT_ID, loadConfig, parseDisplaySettings, saveDisplaySettings } from "../src/config.js";

async function withConfig(
  contents: object,
  run: (path: string) => Promise<void>,
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "amdp-config-"));
  const path = join(directory, "config.json");
  const previousPath = process.env.AMDP_CONFIG;
  const previousClientId = process.env.DISCORD_CLIENT_ID;
  await writeFile(path, JSON.stringify(contents));
  process.env.AMDP_CONFIG = path;
  delete process.env.DISCORD_CLIENT_ID;
  try {
    await run(path);
  } finally {
    if (previousPath === undefined) delete process.env.AMDP_CONFIG;
    else process.env.AMDP_CONFIG = previousPath;
    if (previousClientId === undefined) delete process.env.DISCORD_CLIENT_ID;
    else process.env.DISCORD_CLIENT_ID = previousClientId;
    await rm(directory, { recursive: true, force: true });
  }
}

test("adds presence defaults to an existing config", async () => {
  await withConfig({
    discordClientId: "123456789012345678",
    showPaused: false,
    artwork: { enabled: false, country: "KR" },
  }, async () => {
    const config = await loadConfig();
    assert.equal(config.showPaused, false);
    assert.equal(config.artwork.enabled, false);
    assert.deepEqual(config.presence, {
      showAlbum: true,
      showTimeRemaining: true,
      showButton: true,
      displayOrder: "artist-album",
    });
  });
});

test("loads custom presence options", async () => {
  await withConfig({
    discordClientId: "123456789012345678",
    presence: {
      showAlbum: false,
      showTimeRemaining: false,
      showButton: false,
      displayOrder: "album-artist",
    },
  }, async () => {
    const config = await loadConfig();
    assert.deepEqual(config.presence, {
      showAlbum: false,
      showTimeRemaining: false,
      showButton: false,
      displayOrder: "album-artist",
    });
  });
});

test("rejects an unknown display order", async () => {
  await withConfig({
    discordClientId: "123456789012345678",
    presence: { displayOrder: "title-first" },
  }, async () => {
    await assert.rejects(loadConfig(), /presence\.displayOrder/);
  });
});

test("validates settings submitted by the local UI", () => {
  assert.throws(() => parseDisplaySettings({}), /showAlbum/);
  assert.throws(() => parseDisplaySettings({
    showAlbum: true,
    showArtwork: true,
    showTimeRemaining: true,
    showButton: true,
    showPaused: true,
    displayOrder: "title-first",
  }), /displayOrder/);
});

test("saves display settings without changing advanced configuration", async () => {
  await withConfig({
    discordClientId: "123456789012345678",
    pollIntervalMs: 2500,
    fallbackLargeImageKey: "apple_music",
    artwork: { enabled: true, country: "KR" },
  }, async (path) => {
    const config = await saveDisplaySettings({
      showAlbum: false,
      showArtwork: false,
      showTimeRemaining: false,
      showButton: false,
      showPaused: false,
      displayOrder: "album-artist",
    });
    const saved = JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
    assert.equal(saved.discordClientId, "123456789012345678");
    assert.equal(saved.pollIntervalMs, 2500);
    assert.equal(saved.fallbackLargeImageKey, "apple_music");
    assert.deepEqual(saved.artwork, { enabled: false, country: "KR" });
    assert.equal(config.presence.displayOrder, "album-artist");
    assert.equal(config.showPaused, false);
  });
});

test("uses the shared application without asking for an ID", async () => {
  await withConfig({}, async () => {
    const config = await loadConfig();
    assert.equal(config.discordClientId, SHARED_DISCORD_CLIENT_ID);
    assert.equal(config.showPaused, false);
  });
});
test("preserves custom IDs and honors an explicit environment override", async () => {
  await withConfig({ discordClientId: "123456789012345678" }, async () => {
    assert.equal((await loadConfig()).discordClientId, "123456789012345678");
    process.env.DISCORD_CLIENT_ID = "234567890123456789";
    assert.equal((await loadConfig()).discordClientId, "234567890123456789");
  });
});
test("rejects malformed explicit IDs instead of silently using the shared app", async () => {
  await withConfig({ discordClientId: "not-a-valid-id" }, async () => {
    await assert.rejects(loadConfig(), /valid discordClientId/);
  });
});
