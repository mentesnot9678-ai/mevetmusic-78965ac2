export type LyricLine = { time: number; text: string };

export type Lyrics = {
  synced: LyricLine[] | null;
  plain: string | null;
  source: string;
};

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

export async function fetchLyrics(opts: {
  title: string;
  artist: string;
  album?: string;
  duration?: number;
}): Promise<Lyrics | null> {
  const params = new URLSearchParams({
    track_name: opts.title,
    artist_name: opts.artist === "Unknown artist" ? "" : opts.artist,
  });
  if (opts.album && opts.album !== "Unknown album") params.set("album_name", opts.album);
  if (opts.duration) params.set("duration", String(Math.round(opts.duration)));

  try {
    let res = await fetch(`https://lrclib.net/api/get?${params.toString()}`);
    if (!res.ok) {
      const q = new URLSearchParams({ q: `${opts.artist} ${opts.title}`.trim() });
      res = await fetch(`https://lrclib.net/api/search?${q.toString()}`);
      if (!res.ok) return null;
      const list = (await res.json()) as Array<Record<string, unknown>>;
      const first = list[0];
      if (!first) return null;
      return toLyrics(first);
    }
    return toLyrics((await res.json()) as Record<string, unknown>);
  } catch {
    return null;
  }
}

function toLyrics(data: Record<string, unknown>): Lyrics | null {
  const synced = typeof data['syncedLyrics'] === "string" ? data['syncedLyrics'] : null;
  const plain = typeof data['plainLyrics'] === "string" ? data['plainLyrics'] : null;
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
