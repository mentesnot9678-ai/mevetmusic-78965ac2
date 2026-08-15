import type { Lyrics } from "./lyrics";

const LS_KEY = "mevet.lyrics.v1";

type CacheShape = Record<string, { lyrics: Lyrics | null; at: number }>;

function read(): CacheShape {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}") as CacheShape;
  } catch {
    return {};
  }
}

function write(cache: CacheShape) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cache));
  } catch {
    // Storage full — drop the oldest half and retry once.
    const entries = Object.entries(cache).sort((a, b) => a[1].at - b[1].at);
    const trimmed = Object.fromEntries(entries.slice(Math.floor(entries.length / 2)));
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(trimmed));
    } catch {
      /* give up */
    }
  }
}

/** All cached lyrics, available offline. */
export function loadLyricsCache(): Record<string, Lyrics | null> {
  const cache = read();
  const out: Record<string, Lyrics | null> = {};
  for (const [k, v] of Object.entries(cache)) out[k] = v.lyrics;
  return out;
}

export function saveLyricsToCache(key: string, lyrics: Lyrics | null) {
  const cache = read();
  // Don't cache "not found" forever — retry those on the next online session.
  if (!lyrics) delete cache[key];
  else cache[key] = { lyrics, at: Date.now() };
  write(cache);
}
