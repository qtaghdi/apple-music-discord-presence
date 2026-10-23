import type { MusicSnapshot } from "./types.js";

interface SearchResult {
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
  trackTimeMillis?: number;
}
interface CacheEntry { expires: number; value: ArtworkResult | undefined }
export interface ArtworkResult { artworkUrl: string; trackUrl?: string }
const normalize = (value: string | undefined) =>
  (value ?? "").normalize("NFKD").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
const artists = (value: string) => value.split(/\s*(?:&|,| feat\.? | featuring )\s*/i).map(normalize).filter((s) => s.length > 2);

export class ArtworkResolver {
  private readonly cache = new Map<string, CacheEntry>();
  constructor(private readonly country: string, private readonly request: typeof fetch = fetch) {}

  async resolve(track: MusicSnapshot): Promise<ArtworkResult | undefined> {
    const artist = track.artist || track.albumArtist;
    if (!track.name || !artist) return undefined;
    const key = `${track.persistentId ?? ""}|${artist}|${track.album ?? ""}|${track.name}`;
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.value;
    const queries = [
      { term: `${artist} ${track.name}`, entity: "song" },
      ...(artist.includes("&") ? [{ term: `${artist.split("&")[0]!.trim()} ${track.name}`, entity: "song" }] : []),
      ...(track.album ? [{ term: `${track.albumArtist || artist} ${track.album}`, entity: "album" }] : []),
    ];
    let value: ArtworkResult | undefined;
    // A failed/empty regional catalog must not prevent the alternate catalog lookup.
    for (const country of new Set([this.country.toUpperCase(), "US"])) {
      for (const query of queries) {
        try {
          const params = new URLSearchParams({ ...query, country, limit: "25" });
          const response = await this.request(`https://itunes.apple.com/search?${params}`, {
            signal: AbortSignal.timeout(4000),
            headers: { "User-Agent": "apple-music-discord-presence" },
          });
          if (!response.ok) continue;
          const body = await response.json() as { results?: SearchResult[] };
          const candidates = (body.results ?? []).filter((item) => {
            if (!item.artworkUrl100?.startsWith("https://")) return false;
            const expectedArtists = [artist, track.albumArtist ?? ""].flatMap(artists);
            const sameArtist = normalize(item.artistName) === normalize(artist) ||
              artists(item.artistName ?? "").some((part) => expectedArtists.includes(part));
            const sameTitle = normalize(item.trackName) === normalize(track.name);
            const sameAlbum = !!track.album && normalize(item.collectionName) === normalize(track.album);
            const sameDuration = track.duration !== undefined && item.trackTimeMillis !== undefined && Math.abs(item.trackTimeMillis / 1000 - track.duration) <= 0.75;
            if (query.entity === "album") return sameArtist && sameAlbum;
            // Localized artist names can differ too; require all other metadata to agree.
            return (sameArtist && (sameTitle || sameDuration)) || (sameTitle && sameAlbum && sameDuration);
          });
          const exact = candidates.find((item) => normalize(item.trackName) === normalize(track.name));
          // Duration-only matches must be unambiguous, especially for translated titles.
          const best = exact ?? (query.entity === "album" || candidates.length === 1 ? candidates[0] : undefined);
          if (best?.artworkUrl100) {
            value = {
              artworkUrl: best.artworkUrl100.replace(/\/\d+x\d+bb\./, "/512x512bb."),
              ...(query.entity === "song" && best.trackViewUrl ? { trackUrl: best.trackViewUrl } : {}),
            };
            break;
          }
        } catch { /* Artwork is optional; continue with the alternate query/catalog. */ }
      }
      if (value) break;
    }
    if (this.cache.size >= 256) this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(key, { expires: Date.now() + (value ? 24 * 60 * 60 * 1000 : 60_000), value });
    return value;
  }
}
