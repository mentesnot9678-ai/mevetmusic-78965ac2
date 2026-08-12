import { create } from "zustand";
import type { RepeatMode, Track } from "@/lib/types";

let audio: HTMLAudioElement | null = null;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.preload = "metadata";
  }
  return audio;
}

type PlayerState = {
  queue: Track[];
  index: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  sleepEndsAt: number | null;
  sleepUntilTrackEnd: boolean;
  current: () => Track | null;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  toggle: () => void;
  next: (auto?: boolean) => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setSleep: (minutes: number | null, untilTrackEnd?: boolean) => void;
  _tick: () => void;
};

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  index: -1,
  isPlaying: false,
  position: 0,
  duration: 0,
  shuffle: false,
  repeat: "off",
  volume: 1,
  sleepEndsAt: null,
  sleepUntilTrackEnd: false,

  current: () => {
    const { queue, index } = get();
    return index >= 0 && index < queue.length ? queue[index] : null;
  },

  playQueue: (tracks, startIndex = 0) => {
    const el = getAudio();
    if (!el || !tracks.length) return;
    set({ queue: tracks, index: startIndex });
    const track = tracks[startIndex];
    el.src = track.url;
    el.volume = get().volume;
    void el.play().then(
      () => set({ isPlaying: true }),
      () => set({ isPlaying: false }),
    );
    updateMediaSession(track);
  },

  toggle: () => {
    const el = getAudio();
    if (!el || !get().current()) return;
    if (el.paused) {
      void el.play().then(() => set({ isPlaying: true }));
    } else {
      el.pause();
      set({ isPlaying: false });
    }
  },

  next: (auto = false) => {
    const { queue, index, shuffle, repeat, sleepUntilTrackEnd } = get();
    if (!queue.length) return;
    if (auto && sleepUntilTrackEnd) {
      stopPlayback(set);
      set({ sleepUntilTrackEnd: false });
      return;
    }
    if (auto && repeat === "one") {
      get().playQueue(queue, index);
      return;
    }
    let nextIndex: number;
    if (shuffle) {
      nextIndex = queue.length === 1 ? 0 : Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = index + 1;
      if (nextIndex >= queue.length) {
        if (auto && repeat === "off") {
          stopPlayback(set);
          return;
        }
        nextIndex = 0;
      }
    }
    get().playQueue(queue, nextIndex);
  },

  prev: () => {
    const { queue, index, position } = get();
    if (!queue.length) return;
    if (position > 4) {
      get().seek(0);
      return;
    }
    get().playQueue(queue, index <= 0 ? queue.length - 1 : index - 1);
  },

  seek: (t) => {
    const el = getAudio();
    if (el) el.currentTime = t;
    set({ position: t });
  },

  setVolume: (v) => {
    const el = getAudio();
    if (el) el.volume = v;
    set({ volume: v });
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  cycleRepeat: () =>
    set((s) => ({ repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off" })),

  setSleep: (minutes, untilTrackEnd = false) => {
    if (untilTrackEnd) {
      set({ sleepUntilTrackEnd: true, sleepEndsAt: null });
      return;
    }
    set({
      sleepUntilTrackEnd: false,
      sleepEndsAt: minutes == null ? null : Date.now() + minutes * 60_000,
    });
  },

  _tick: () => {
    const el = getAudio();
    if (!el) return;
    set({ position: el.currentTime, duration: el.duration || get().current()?.duration || 0 });
    const { sleepEndsAt } = get();
    if (sleepEndsAt && Date.now() >= sleepEndsAt) {
      set({ sleepEndsAt: null });
      fadeOutAndStop(set, get);
    }
  },
}));

function stopPlayback(set: (partial: Partial<PlayerState>) => void) {
  const el = getAudio();
  if (el) el.pause();
  set({ isPlaying: false });
}

function fadeOutAndStop(
  set: (partial: Partial<PlayerState>) => void,
  get: () => PlayerState,
) {
  const el = getAudio();
  if (!el) return;
  const target = get().volume;
  if (fadeTimer) clearInterval(fadeTimer);
  fadeTimer = setInterval(() => {
    if (!el) return;
    const v = Math.max(0, el.volume - target / 20);
    el.volume = v;
    if (v <= 0.001) {
      if (fadeTimer) clearInterval(fadeTimer);
      fadeTimer = null;
      el.pause();
      el.volume = target;
      set({ isPlaying: false });
    }
  }, 150);
}

function updateMediaSession(track: Track) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: track.album,
    artwork: track.artUrl ? [{ src: track.artUrl, sizes: "512x512", type: "image/jpeg" }] : [],
  });
}

let bound = false;
export function bindAudioEvents() {
  const el = getAudio();
  if (!el || bound) return;
  bound = true;
  const store = usePlayer.getState;
  el.addEventListener("timeupdate", () => store()._tick());
  el.addEventListener("durationchange", () => store()._tick());
  el.addEventListener("ended", () => store().next(true));
  el.addEventListener("play", () => usePlayer.setState({ isPlaying: true }));
  el.addEventListener("pause", () => usePlayer.setState({ isPlaying: false }));
  setInterval(() => store()._tick(), 500);

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => store().toggle());
    navigator.mediaSession.setActionHandler("pause", () => store().toggle());
    navigator.mediaSession.setActionHandler("nexttrack", () => store().next());
    navigator.mediaSession.setActionHandler("previoustrack", () => store().prev());
    navigator.mediaSession.setActionHandler("seekto", (d) => {
      if (d.seekTime != null) store().seek(d.seekTime);
    });
  }
}

export function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
