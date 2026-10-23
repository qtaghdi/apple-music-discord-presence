import test from "node:test";
import assert from "node:assert/strict";
import { ArtworkResolver } from "../src/artwork.js";
const track = { state: "playing" as const, name: "한국 제목", artist: "Singer", album: "Album", duration: 200 };
const art = "https://is1-ssl.mzstatic.com/image/100x100bb.jpg";
const result = { artistName: "Singer", trackName: "English title", collectionName: "Album", artworkUrl100: art, trackTimeMillis: 200000, trackViewUrl: "https://music.apple.com/song" };
function mock(handler: (url: URL) => unknown): typeof fetch {
  return (async (url) => new Response(JSON.stringify({ results: handler(new URL(String(url))) }))) as typeof fetch;
}
test("falls back from empty KR results to translated US tracks and caches", async () => {
  let calls = 0;
  const resolver = new ArtworkResolver("KR", mock((url) => {
    calls++;
    return url.searchParams.get("country") === "US" ? [result] : [];
  }));
  const value = await resolver.resolve(track);
  assert.equal(value?.artworkUrl, art.replace('100x100', '512x512'));
  assert.equal(value?.trackUrl, result.trackViewUrl);
  const previous = calls;
  assert.deepEqual(await resolver.resolve(track), value);
  assert.equal(calls, previous);
});
test("uses an exact album match without linking to a different song", async () => {
  const resolver = new ArtworkResolver("US", mock((url) => url.searchParams.get("entity") === "album" ? [result] : []));
  const value = await resolver.resolve(track);
  assert.ok(value?.artworkUrl);
  assert.equal(value?.trackUrl, undefined);
});
test("rejects artist-only matches, wrong albums and ambiguous durations", async () => {
  for (const results of [[{ ...result, collectionName: 'Other', trackTimeMillis: 300000 }], [{ ...result, artistName: 'Wrong' }], [result, { ...result, trackName: 'Another' }]]) {
    const resolver = new ArtworkResolver("US", mock((url) => url.searchParams.get('entity') === 'song' ? results : []));
    assert.equal(await resolver.resolve(track), undefined);
  }
});
test("continues after a regional request fails", async () => {
  const request = mock((url) => { if (url.searchParams.get('country') === 'KR') throw new Error('offline'); return [result]; });
  assert.ok(await new ArtworkResolver("KR", request).resolve(track));
});
test("matches a localized collaborator using the common artist and duration", async () => {
  const resolver = new ArtworkResolver("US", mock(() => [{ ...result, artistName: 'sogumm & Chawool' }]));
  assert.ok(await resolver.resolve({ ...track, artist: 'sogumm & 차울' }));
});

test("retries with the primary artist when a translated collaborator blocks search", async () => {
  const resolver = new ArtworkResolver("US", mock((url) => url.searchParams.get('term') === 'sogumm 한국 제목' ? [{ ...result, artistName: 'sogumm & Chawool' }] : []));
  assert.ok(await resolver.resolve({ ...track, artist: 'sogumm & 차울' }));
});

test("accepts localized artist names only when title, album and duration all agree", async () => {
  const item = { ...result, artistName: 'Beenzino', trackName: track.name };
  assert.ok(await new ArtworkResolver('US', mock(() => [item])).resolve(track));
  assert.equal(await new ArtworkResolver('US', mock(() => [{ ...item, trackTimeMillis: 300000 }])).resolve(track), undefined);
});
