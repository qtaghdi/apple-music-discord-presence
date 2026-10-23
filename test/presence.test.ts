import test from "node:test";
import assert from "node:assert/strict";
import { createActivity, defaultPresenceOptions, trackKey } from "../src/presence.js";

test("creates listening activity with timestamps and artwork", () => {
  const originalNow = Date.now;
  Date.now = () => 1_700_000_000_000;
  try {
    const activity = createActivity(
      { state: "playing", name: "Song", artist: "Artist", album: "Album", duration: 240, position: 40 },
      { artworkUrl: "https://example.com/art.jpg", trackUrl: "https://music.apple.com/track" },
    );
    assert.deepEqual(activity, {
      type: 2,
      status_display_type: 2,
      details: "Artist - Song",
      state: "Artist · Album",
      timestamps: { start: 1_699_999_960, end: 1_700_000_200 },
      assets: { large_image: "https://example.com/art.jpg", large_text: "Album" },
      buttons: [{ label: "Listen on Apple Music", url: "https://music.apple.com/track" }],
    });
  } finally {
    Date.now = originalNow;
  }
});

test("provides both endpoints for a listening progress bar", () => {
  const originalNow = Date.now;
  Date.now = () => 1_700_000_000_000;
  try {
    const activity = createActivity(
      { state: "playing", name: "Song", duration: 138, position: 79 },
      undefined,
    );
    assert.deepEqual(activity?.timestamps, { start: 1_699_999_921, end: 1_700_000_059 });
    assert.equal(activity!.timestamps!.end! - activity!.timestamps!.start, 138);
  } finally {
    Date.now = originalNow;
  }
});

test("paused activity has no moving timestamp", () => {
  const activity = createActivity({ state: "paused", name: "Song", artist: "Artist", duration: 100, position: 50 }, undefined, { ...defaultPresenceOptions, showPaused: true });
  assert.ok(activity);
  assert.equal(activity?.timestamps, undefined);
});

test("can hide optional presence fields", () => {
  const activity = createActivity(
    { state: "playing", name: "Song", artist: "Artist", album: "Album", duration: 100, position: 50 },
    { artworkUrl: "https://example.com/art.jpg", trackUrl: "https://music.apple.com/track" },
    {
      ...defaultPresenceOptions,
      showAlbum: false,
      showArtwork: false,
      showTimeRemaining: false,
      showButton: false,
    },
  );
  assert.deepEqual(activity, { type: 2, status_display_type: 2, details: "Artist - Song", state: "Artist" });
});

test("can put the album before the artist", () => {
  const activity = createActivity(
    { state: "playing", name: "Song", artist: "Artist", album: "Album" },
    undefined,
    { ...defaultPresenceOptions, displayOrder: "album-artist" },
  );
  assert.equal(activity?.state, "Album · Artist");
});

test("can hide paused playback", () => {
  const activity = createActivity(
    { state: "paused", name: "Song", artist: "Artist" },
    undefined,
    { ...defaultPresenceOptions, showPaused: false },
  );
  assert.equal(activity, null);
});

test("can show a catalog button without artwork", () => {
  const activity = createActivity(
    { state: "playing", name: "Song", artist: "Artist" },
    { artworkUrl: "https://example.com/art.jpg", trackUrl: "https://music.apple.com/track" },
    { ...defaultPresenceOptions, showArtwork: false },
  );
  assert.equal(activity?.assets, undefined);
  assert.deepEqual(activity?.buttons, [{ label: "Listen on Apple Music", url: "https://music.apple.com/track" }]);
});

test("stopped playback clears activity", () => {
  assert.equal(createActivity({ state: "stopped" }, undefined), null);
});

test("track key changes without a persistent id", () => {
  assert.notEqual(
    trackKey({ state: "playing", name: "One", artist: "Artist" }),
    trackKey({ state: "playing", name: "Two", artist: "Artist" }),
  );
});

test("clamps seeks and omits invalid progress metadata", () => {
  const before = createActivity({ state: "playing", name: "Song", duration: 100, position: -5 }, undefined)!;
  const after = createActivity({ state: "playing", name: "Song", duration: 100, position: 150 }, undefined)!;
  assert.equal(before.timestamps!.end! - before.timestamps!.start, 100);
  assert.equal(after.timestamps!.end! - after.timestamps!.start, 100);
  assert.equal(before.timestamps!.start - after.timestamps!.start, 100);
  for (const duration of [0, -1, NaN, Infinity]) {
    assert.equal(createActivity({ state: "playing", name: "Song", duration, position: 5 }, undefined)?.timestamps, undefined);
  }
});

test("uses artist and title without an added emoji as the member-list status", () => {
  const activity = createActivity({ state: "playing", name: "노래", albumArtist: "가수" }, undefined)!;
  assert.equal(activity.status_display_type, 2);
  assert.equal(activity.details, "가수 - 노래");
  const paused = createActivity({ state: "paused", name: "다음 곡", artist: "다른 가수" }, undefined, { ...defaultPresenceOptions, showPaused: true })!;
  assert.equal(paused.details, "다른 가수 - 다음 곡");
  assert.equal(paused.timestamps, undefined);
  const long = createActivity({ state: "playing", name: "곡".repeat(200), artist: "가수" }, undefined)!;
  assert.equal(long.details.length, 128);
});

test("default playback transitions clear on pause and restore on resume", () => {
  const track = { state: "playing" as const, name: "Song", artist: "Artist", duration: 200, position: 30 };
  assert.ok(createActivity(track, undefined)?.timestamps);
  assert.equal(createActivity({ ...track, state: "paused" }, undefined), null);
  assert.ok(createActivity({ ...track, position: 31 }, undefined)?.timestamps);
  assert.equal(createActivity({ state: "stopped" }, undefined), null);
});
