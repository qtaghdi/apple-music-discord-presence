import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SettingsServer } from "../src/settings-server.js";
import type { DisplaySettings } from "../src/types.js";

const initial: DisplaySettings = {
  showAlbum: true,
  showArtwork: true,
  showTimeRemaining: true,
  showButton: true,
  showPaused: true,
  displayOrder: "artist-album",
};

test("serves the local UI and saves same-origin settings", async () => {
  const root = await mkdtemp(join(tmpdir(), "amdp-settings-"));
  const assets = join(root, "settings");
  await mkdir(assets);
  await Promise.all([
    writeFile(join(assets, "index.html"), "<h1>Settings</h1>"),
    writeFile(join(assets, "app.js"), ""),
    writeFile(join(assets, "styles.css"), ""),
  ]);
  let current = initial;
  const server = new SettingsServer({
    root,
    port: 0,
    getSettings: () => current,
    saveSettings: async (settings) => {
      current = settings;
      return current;
    },
  });

  try {
    await server.start();
    const page = await fetch(server.origin);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Settings/);
    assert.match(page.headers.get("content-security-policy") ?? "", /default-src 'self'/);

    const changed: DisplaySettings = { ...initial, showArtwork: false, displayOrder: "album-artist" };
    const saved = await fetch(`${server.origin}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Origin: server.origin },
      body: JSON.stringify(changed),
    });
    assert.equal(saved.status, 200);
    assert.deepEqual(await saved.json(), changed);
    assert.deepEqual(current, changed);

    const rejected = await fetch(`${server.origin}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Origin: "https://example.com" },
      body: JSON.stringify(initial),
    });
    assert.equal(rejected.status, 403);
  } finally {
    server.stop();
    await rm(root, { recursive: true, force: true });
  }
});
