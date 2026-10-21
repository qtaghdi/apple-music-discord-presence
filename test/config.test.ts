import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig } from "../src/config.js";

async function withConfig(
  contents: object,
  run: () => Promise<void>,
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "amdp-config-"));
  const path = join(directory, "config.json");
  const previousPath = process.env.AMDP_CONFIG;
  const previousClientId = process.env.DISCORD_CLIENT_ID;
  await writeFile(path, JSON.stringify(contents));
  process.env.AMDP_CONFIG = path;
  delete process.env.DISCORD_CLIENT_ID;
  try {
    await run();
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
