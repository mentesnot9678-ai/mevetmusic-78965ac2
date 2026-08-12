import { create } from "zustand";
import { fetchLyrics, lyricsFromFile, type Lyrics } from "@/lib/lyrics";
import type { Track } from "@/lib/types";

type LyricsState = {
  byTrack: Record<string, Lyrics | null>;
  loading: boolean;
  bgMedia: { url: string; type: "image" | "video" } | null;
  load: (track: Track) => Promise<void>;
  importFile: (trackKey: string, file: File) => Promise<void>;
  setBgMedia: (m: { url: string; type: "image" | "video" } | null) => void;
};

export const useLyrics = create<LyricsState>((set, get) => ({
  byTrack: {},
  loading: false,
  bgMedia: null,
  load: async (track) => {
    if (track.key in get().byTrack) return;
    set({ loading: true });
    const res = await fetchLyrics({
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
    });
    set({ byTrack: { ...get().byTrack, [track.key]: res }, loading: false });
  },
  importFile: async (trackKey, file) => {
    const text = await file.text();
    set({ byTrack: { ...get().byTrack, [trackKey]: lyricsFromFile(file.name, text) } });
  },
  setBgMedia: (m) => set({ bgMedia: m }),
}));
