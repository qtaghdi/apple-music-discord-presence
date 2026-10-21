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
      details: "Song",
      state: "Artist · Album",
      timestamps: { start: 1_699_999_960, end: 1_700_000_200 },
      assets: { large_image: "https://example.com/art.jpg", large_text: "Album" },
      buttons: [{ label: "Listen on Apple Music", url: "https://music.apple.com/track" }],
    });
  } finally {
    Date.now = originalNow;
  }
});

test("paused activity has no moving timestamp", () => {
  const activity = createActivity({ state: "paused", name: "Song", artist: "Artist", duration: 100, position: 50 }, undefined);
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
  assert.deepEqual(activity, { type: 2, details: "Song", state: "Artist" });
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
