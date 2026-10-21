import test from "node:test";
import assert from "node:assert/strict";
import { musicHelperCommand } from "../src/music.js";

test("uses the Swift helper directly on macOS", () => {
  const result = musicHelperCommand("/app", 1000, "darwin", {});
  assert.equal(result.command, "/app/bin/music-metadata");
  assert.deepEqual(result.args, ["--interval-ms", "1000"]);
});

test("uses the Windows media-session PowerShell helper", () => {
  const result = musicHelperCommand("C:\\app", 750, "win32", {});
  assert.equal(result.command, "powershell.exe");
  assert.ok(result.helper.endsWith("native/MusicMetadata.ps1") || result.helper.endsWith("native\\MusicMetadata.ps1"));
  assert.deepEqual(result.args.slice(-2), ["-IntervalMs", "750"]);
});
