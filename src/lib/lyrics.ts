export type LyricLine = { time: number; text: string };

export type Lyrics = {
  synced: LyricLine[] | null;
  plain: string | null;
  source: string;
};

const NOISE_RE =
  /\((?:official|lyric|lyrics|audio|video|music|hd|4k|mv|visualizer|remaster[^)]*|live[^)]*)[^)]*\)|\[[^\]]*\]|\b(?:official (?:music )?video|official audio|lyrics?(?: video)?|full song|hd|hq|4k|mv|audio)\b/gi;

/** Strip download noise and split "Artist - Title" style filenames. */
export function cleanTrackInfo(input: { title: string; artist: string }) {
  let title = input.title.replace(NOISE_RE, " ").replace(/[_]+/g, " ").replace(/\s{2,}/g, " ").trim();
  title = title.replace(/[-–—|]+\s*$/, "").trim();

  let artist = input.artist;
  const unknownArtist = !artist || /^unknown/i.test(artist);

  const split = title.split(/\s+[-–—]\s+/);
  if (split.length >= 2) {
    const left = (split[0] ?? "").trim();
    const right = split.slice(1).join(" - ").trim();
    if (unknownArtist && left && right) {
      artist = left;
      title = right;
    } else if (!unknownArtist && left.toLowerCase() === artist.toLowerCase()) {
      title = right;
    }
  }

  return {
    title: title.trim(),
    artist: /^unknown/i.test(artist) ? "" : artist.trim(),
  };
}

export function parseLrc(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const stamps = [...line.matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)];
    const text = line.replace(/\[[^\]]*\]/g, "").trim();
    for (const m of stamps) {
      const time = parseInt(m[1] ?? "0", 10) * 60 + parseFloat((m[2] ?? "0").replace(":", "."));
      lines.push({ time, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

async function getJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchLyrics(opts: {
  title: string;
  artist: string;
  album?: string;
  duration?: number;
}): Promise<Lyrics | null> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return null;

  const { title, artist } = cleanTrackInfo({ title: opts.title, artist: opts.artist });
  if (!title) return null;

  // 1. Exact match (only valid when we actually know the artist)
  if (artist) {
    const params = new URLSearchParams({ track_name: title, artist_name: artist });
    if (opts.album && !/^unknown/i.test(opts.album)) {
      const album = cleanTrackInfo({ title: opts.album, artist }).title;
      if (album) params.set("album_name", album);
    }
    if (opts.duration) params.set("duration", String(Math.round(opts.duration)));
    const exact = await getJson(`https://lrclib.net/api/get?${params.toString()}`);
    const hit = exact ? toLyrics(exact as Record<string, unknown>) : null;
    if (hit) return hit;
  }

  // 2. Structured search, then 3. free-text search
  const attempts: string[] = [];
  if (artist)
    attempts.push(
      `https://lrclib.net/api/search?${new URLSearchParams({ track_name: title, artist_name: artist })}`,
    );
  attempts.push(`https://lrclib.net/api/search?${new URLSearchParams({ track_name: title })}`);
  attempts.push(`https://lrclib.net/api/search?${new URLSearchParams({ q: `${artist} ${title}`.trim() })}`);

  for (const url of attempts) {
    const list = (await getJson(url)) as Array<Record<string, unknown>> | null;
    if (!Array.isArray(list) || !list.length) continue;
    const withSynced = list.find((d) => typeof d['syncedLyrics'] === "string" && d['syncedLyrics']);
    const picked = withSynced ?? list[0];
    const res = picked ? toLyrics(picked) : null;
    if (res) return res;
  }

  return null;
}

function toLyrics(data: Record<string, unknown>): Lyrics | null {
  const synced = typeof data['syncedLyrics'] === "string" && data['syncedLyrics'] ? data['syncedLyrics'] : null;
  const plain = typeof data['plainLyrics'] === "string" && data['plainLyrics'] ? data['plainLyrics'] : null;
  if (!synced && !plain) return null;
  return {
    synced: synced ? parseLrc(synced) : null,
    plain,
    source: "LRClib",
  };
}

export function lyricsFromFile(name: string, content: string): Lyrics {
  if (/\.lrc$/i.test(name) && /\[\d+:\d+/.test(content)) {
    return { synced: parseLrc(content), plain: content, source: "Imported file" };
  }
  return { synced: null, plain: content, source: "Imported file" };
}
