import { Link } from "@tanstack/react-router";
import { Pause, Play, SkipForward } from "lucide-react";
import { usePlayer } from "@/store/player";

export function MiniPlayer() {
  const track = usePlayer((s) => (s.index >= 0 ? s.queue[s.index] : null));
  const isPlaying = usePlayer((s) => s.isPlaying);
  const position = usePlayer((s) => s.position);
  const duration = usePlayer((s) => s.duration);
  const toggle = usePlayer((s) => s.toggle);
  const next = usePlayer((s) => s.next);

  if (!track) return null;
  const pct = duration ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <div className="fixed inset-x-0 bottom-[62px] z-40 mx-auto max-w-md px-2">
      <div className="glass animate-rise overflow-hidden rounded-2xl border border-border shadow-lg">
        <div className="flex items-center gap-3 p-2">
          <Link
            to="/now-playing"
            className="flex min-w-0 flex-1 items-center gap-3"
            aria-label="Open now playing"
          >
            <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-muted">
              {track.artUrl ? (
                <img src={track.artUrl} alt="" className="size-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{track.title}</p>
              <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
            </div>
          </Link>
          <button
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"
          >
            {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
          </button>
          <button
            onClick={() => next()}
            aria-label="Next track"
            className="grid size-9 place-items-center rounded-full text-foreground/80"
          >
            <SkipForward className="size-5" />
          </button>
        </div>
        <div className="h-0.5 w-full bg-muted">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
