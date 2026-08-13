import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AddMusic } from "@/components/AddMusic";
import { EmptyLibrary, LibraryTabs } from "@/components/LibraryTabs";
import { TrackRow } from "@/components/TrackRow";
import { PlaylistPicker } from "@/components/PlaylistPicker";
import { useLibrary } from "@/store/library";
import { usePlayer } from "@/store/player";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/songs")({
  head: () => ({
    meta: [
      { title: "Songs — Mevet Player" },
      { name: "description", content: "Every track in your Mevet Player library, sorted and searchable." },
      { property: "og:title", content: "Songs — Mevet Player" },
      { property: "og:description", content: "Browse and play every track in your library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Songs,
});

function Songs() {
  const tracks = useLibrary((s) => s.tracks);
  const playQueue = usePlayer((s) => s.playQueue);
  const [q, setQ] = useState("");
  const [picker, setPicker] = useState<Track | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tracks;
    return tracks.filter((t) =>
      `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(needle),
    );
  }, [tracks, q]);

  return (
    <AppShell title="Library" subtitle={`${tracks.length} songs`} action={<AddMusic compact />}>
      <LibraryTabs />
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-card/70 px-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search songs, artists, albums"
          className="w-full bg-transparent py-2.5 text-sm outline-none"
        />
      </div>
      {!tracks.length ? (
        <EmptyLibrary />
      ) : (
        <div className="divide-y divide-border/60">
          {filtered.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              onPlay={() => playQueue(filtered, i)}
              onAdd={() => setPicker(t)}
            />
          ))}
        </div>
      )}
      <PlaylistPicker track={picker} onClose={() => setPicker(null)} />
    </AppShell>
  );
}
