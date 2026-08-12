import { Plus } from "lucide-react";
import type { Track } from "@/lib/types";
import { formatTime, usePlayer } from "@/store/player";

export function TrackRow({
  track,
  onPlay,
  onAdd,
}: {
  track: Track;
  onPlay: () => void;
  onAdd?: () => void;
}) {
  const currentKey = usePlayer((s) => (s.index >= 0 ? s.queue[s.index]?.key : undefined));
  const active = currentKey === track.key;

  return (
    <div className="flex items-center gap-3 rounded-xl px-1 py-2 active:bg-secondary/60">
      <button onClick={onPlay} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
          {track.artUrl ? (
            <img src={track.artUrl} alt="" className="size-full object-cover" loading="lazy" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm ${active ? "font-semibold text-primary" : "font-medium"}`}>
            {track.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {track.artist} · {track.album}
          </p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {track.duration ? formatTime(track.duration) : ""}
        </span>
      </button>
      {onAdd ? (
        <button
          onClick={onAdd}
          aria-label={`Add ${track.title} to a playlist`}
          className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground"
        >
          <Plus className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
