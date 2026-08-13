import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AddMusic } from "@/components/AddMusic";
import { EmptyLibrary, LibraryTabs } from "@/components/LibraryTabs";
import { TrackRow } from "@/components/TrackRow";
import { PlaylistPicker } from "@/components/PlaylistPicker";
import { groupBy, useLibrary } from "@/store/library";
import { usePlayer } from "@/store/player";
import type { Track } from "@/lib/types";

export function GroupBrowser({
  title,
  field,
}: {
  title: string;
  field: "album" | "artist" | "folder";
}) {
  const tracks = useLibrary((s) => s.tracks);
  const playQueue = usePlayer((s) => s.playQueue);
  const groups = groupBy(tracks, field);
  const [open, setOpen] = useState<string | null>(null);
  const [picker, setPicker] = useState<Track | null>(null);

  return (
    <AppShell title={title} subtitle={`${groups.length} ${title.toLowerCase()}`} action={<AddMusic compact />}>
      <LibraryTabs />
      {!tracks.length ? (
        <EmptyLibrary />
      ) : (
        <div className="space-y-2">
          {groups.map((g) => {
            const art = g.items.find((t) => t.artUrl)?.artUrl;
            const expanded = open === g.name;
            return (
              <div key={g.name} className="overflow-hidden rounded-2xl border border-border bg-card/70">
                <div className="flex items-center gap-3 p-3">
                  <button
                    onClick={() => setOpen(expanded ? null : g.name)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {art ? <img src={art} alt="" className="size-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.items.length} tracks</p>
                    </div>
                  </button>
                  <button
                    onClick={() => playQueue(g.items, 0)}
                    aria-label={`Play ${g.name}`}
                    className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Play className="size-4" />
                  </button>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </div>
                {expanded ? (
                  <div className="animate-rise divide-y divide-border/60 border-t border-border px-3 pb-2">
                    {g.items.map((t, i) => (
                      <TrackRow
                        key={t.id}
                        track={t}
                        onPlay={() => playQueue(g.items, i)}
                        onAdd={() => setPicker(t)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      <PlaylistPicker track={picker} onClose={() => setPicker(null)} />
    </AppShell>
  );
}
