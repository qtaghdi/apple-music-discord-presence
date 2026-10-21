import test from "node:test";
import assert from "node:assert/strict";
import { encodeFrame, ipcPaths } from "../src/discord-ipc.js";

test("encodes the Discord IPC little-endian frame", () => {
  const frame = encodeFrame(0, { v: 1, client_id: "123" });
  assert.equal(frame.readUInt32LE(0), 0);
  assert.equal(frame.readUInt32LE(4), frame.length - 8);
  assert.deepEqual(JSON.parse(frame.subarray(8).toString("utf8")), { v: 1, client_id: "123" });
});

test("searches all Discord IPC slots without duplicate directories", () => {
  const paths = ipcPaths({ TMPDIR: "/private/tmp/example", TMP: "/private/tmp/example" });
  assert.ok(paths.includes("/private/tmp/example/discord-ipc-9"));
  assert.equal(new Set(paths).size, paths.length);
});
