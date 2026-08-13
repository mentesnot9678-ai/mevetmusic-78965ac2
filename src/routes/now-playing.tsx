import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ChevronDown,
  Mic2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { AddMusic } from "@/components/AddMusic";
import { SleepTimer } from "@/components/SleepTimer";
import { formatTime, usePlayer } from "@/store/player";
import { useLyrics } from "@/store/lyrics";

export const Route = createFileRoute("/now-playing")({
  head: () => ({
    meta: [
      { title: "Now playing — Mevet Player" },
      { name: "description", content: "Full-screen player with artwork, seeking, shuffle, repeat and lyrics." },
      { property: "og:title", content: "Now playing — Mevet Player" },
      { property: "og:description", content: "Control playback with artwork, seeking and lyrics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NowPlaying,
});

function NowPlaying() {
  const track = usePlayer((s) => (s.index >= 0 ? s.queue[s.index] : null));
  const { isPlaying, position, duration, shuffle, repeat } = usePlayer();
  const { toggle, next, prev, seek, toggleShuffle, cycleRepeat } = usePlayer.getState();
  const loadLyrics = useLyrics((s) => s.load);
  const navigate = useNavigate();

  useEffect(() => {
    if (track) void loadLyrics(track);
  }, [track, loadLyrics]);

  if (!track) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-muted-foreground">Nothing is playing yet.</p>
        <AddMusic />
        <Link to="/" className="text-sm text-primary">
          Back to home
        </Link>
      </div>
    );
  }

  const total = duration || track.duration || 0;

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-[calc(env(safe-area-inset-top)+12px)]">
      <div className="app-backdrop" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-background"
        style={{ opacity: "var(--app-bg-dim)" }}
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <button onClick={() => history.back()} aria-label="Close player" className="p-2">
          <ChevronDown className="size-6" />
        </button>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Now playing</span>
        <SleepTimer />
      </div>

      <div className="mt-6 aspect-square w-full overflow-hidden rounded-3xl bg-muted shadow-2xl">
        {track.artUrl ? (
          <img src={track.artUrl} alt={`${track.album} cover`} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-6xl">♫</div>
        )}
      </div>

      <div className="mt-6 text-center">
        <h1 className="truncate text-xl font-semibold">{track.title}</h1>
        <p className="truncate text-sm text-muted-foreground">
          {track.artist} · {track.album}
        </p>
      </div>

      <div className="mt-6">
        <input
          type="range"
          min={0}
          max={Math.max(1, total)}
          step={0.5}
          value={position}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          className="w-full accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
          <span>{formatTime(position)}</span>
          <span>{formatTime(total)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={toggleShuffle}
          aria-label="Shuffle"
          className={`grid size-11 place-items-center rounded-full ${shuffle ? "bg-primary/20 text-primary" : "text-foreground/70"}`}
        >
          <Shuffle className="size-5" />
        </button>
        <button onClick={prev} aria-label="Previous" className="p-2">
          <SkipBack className="size-7" />
        </button>
        <button
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          {isPlaying ? <Pause className="size-7" /> : <Play className="size-7" />}
        </button>
        <button onClick={() => next()} aria-label="Next" className="p-2">
          <SkipForward className="size-7" />
        </button>
        <button
          onClick={cycleRepeat}
          aria-label="Repeat mode"
          className={`grid size-11 place-items-center rounded-full ${repeat !== "off" ? "bg-primary/20 text-primary" : "text-foreground/70"}`}
        >
          {repeat === "one" ? <Repeat1 className="size-5" /> : <Repeat className="size-5" />}
        </button>
      </div>

      <button
        onClick={() => navigate({ to: "/lyrics" })}
        className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/70 py-3 text-sm font-semibold"
      >
        <Mic2 className="size-4 text-primary" /> Lyrics
      </button>
    </div>
  );
}
