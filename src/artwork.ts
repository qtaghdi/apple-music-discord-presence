import type { MusicSnapshot } from "./types.js";

interface SearchResult {
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
}

interface CacheEntry {
  expires: number;
  value: ArtworkResult | undefined;
}

export interface ArtworkResult {
  artworkUrl: string;
  trackUrl?: string;
}

const normalize = (value: string | undefined) =>
  (value ?? "").normalize("NFKD").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

export class ArtworkResolver {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly country: string) {}

  async resolve(track: MusicSnapshot): Promise<ArtworkResult | undefined> {
    if (!track.name || !track.artist) return undefined;
    const key = `${track.persistentId ?? ""}|${track.artist}|${track.album ?? ""}|${track.name}`;
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.value;

    const query = new URLSearchParams({
      term: `${track.artist} ${track.album ?? ""} ${track.name}`,
      entity: "song",
      limit: "8",
      country: this.country,
    });
    try {
      const response = await fetch(`https://itunes.apple.com/search?${query}`, {
        signal: AbortSignal.timeout(4000),
        headers: { "User-Agent": "apple-music-discord-presence/0.1" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { results?: SearchResult[] };
      const wantedTitle = normalize(track.name);
      const wantedArtist = normalize(track.artist);
      const wantedAlbum = normalize(track.album);
      const ranked = (body.results ?? [])
        .filter((item) => item.artworkUrl100)
        .map((item) => ({
          item,
          score:
            (normalize(item.trackName) === wantedTitle ? 5 : 0) +
            (normalize(item.artistName) === wantedArtist ? 3 : 0) +
            (wantedAlbum && normalize(item.collectionName) === wantedAlbum ? 2 : 0),
        }))
        .sort((a, b) => b.score - a.score);
      const best = ranked[0];
      const value = best?.score && best.item.artworkUrl100
        ? {
            artworkUrl: best.item.artworkUrl100.replace(/\/\d+x\d+bb\./, "/512x512bb."),
            ...(best.item.trackViewUrl ? { trackUrl: best.item.trackViewUrl } : {}),
          }
        : undefined;
      this.cache.set(key, { expires: Date.now() + 24 * 60 * 60 * 1000, value });
      return value;
    } catch {
      this.cache.set(key, { expires: Date.now() + 10 * 60 * 1000, value: undefined });
      return undefined;
    }
  }
}
