import { create } from "zustand";
import type { Track } from "@/lib/types";

type LibraryState = {
  tracks: Track[];
  scanning: boolean;
  progress: { done: number; total: number };
  addFiles: (files: File[]) => Promise<void>;
  clear: () => void;
};

const AUDIO_RE = /\.(mp3|m4a|aac|flac|wav|ogg|opus|weba|webm|mp4)$/i;

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

export const useLibrary = create<LibraryState>((set, get) => ({
  tracks: [],
  scanning: false,
  progress: { done: 0, total: 0 },
  clear: () => {
    get().tracks.forEach((t) => {
      URL.revokeObjectURL(t.url);
      if (t.artUrl) URL.revokeObjectURL(t.artUrl);
    });
    set({ tracks: [], progress: { done: 0, total: 0 } });
  },
  addFiles: async (files) => {
    const audio = files.filter((f) => AUDIO_RE.test(f.name) || f.type.startsWith("audio/"));
    if (!audio.length) return;
    set({ scanning: true, progress: { done: 0, total: audio.length } });

    const existing = new Set(get().tracks.map((t) => t.key));
    const created: Track[] = [];

    let mm: typeof import("music-metadata") | null = null;
    try {
      mm = await import("music-metadata");
    } catch {
      mm = null;
    }

    for (let i = 0; i < audio.length; i++) {
      const file = audio[i];
      if (!file) continue;
      const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      const key = `${rel}::${file.size}`;
      set({ progress: { done: i + 1, total: audio.length } });
      if (existing.has(key)) continue;
      existing.add(key);

      const parts = rel.split("/");
      const folder = parts.length > 1 ? parts[parts.length - 2] : "Device";

      let title = baseName(file.name);
      let artist = "Unknown artist";
      let album = "Unknown album";
      let duration = 0;
      let artUrl: string | undefined;

      if (mm) {
        try {
          const meta = await mm.parseBlob(file, { duration: false });
          const c = meta.common;
          if (c.title) title = c.title;
          if (c.artist) artist = c.artist;
          if (c.album) album = c.album;
          duration = meta.format.duration ?? 0;
          const pic = c.picture?.[0];
          if (pic) {
            artUrl = URL.createObjectURL(
              new Blob([pic.data as unknown as BlobPart], { type: pic.format || "image/jpeg" }),
            );
          }
        } catch {
          /* fall back to filename metadata */
        }
      }

      created.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        title,
        artist,
        album,
        folder,
        duration,
        artUrl,
        key,
      });

      if (created.length % 15 === 0) {
        set({ tracks: [...get().tracks, ...created.splice(0)] });
      }
    }

    set({
      tracks: [...get().tracks, ...created].sort((a, b) => a.title.localeCompare(b.title)),
      scanning: false,
    });
  },
}));

export function groupBy(tracks: Track[], field: "album" | "artist" | "folder") {
  const map = new Map<string, Track[]>();
  for (const t of tracks) {
    const k = t[field] || "Unknown";
    const arr = map.get(k);
    if (arr) arr.push(t);
    else map.set(k, [t]);
  }
  return [...map.entries()]
    .map(([name, items]) => ({ name, items }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
