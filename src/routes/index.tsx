import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Disc3, FolderOpen, ListMusic, Mic2, Music2, Play, Shuffle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AddMusic } from "@/components/AddMusic";
import { TrackRow } from "@/components/TrackRow";
import { PlaylistPicker } from "@/components/PlaylistPicker";
import { groupBy, useLibrary } from "@/store/library";
import { usePlayer } from "@/store/player";
import { useAuth } from "@/hooks/useAuth";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mevet Player — Your offline music, beautifully played" },
      {
        name: "description",
        content:
          "Mevet Player plays your own music files with synced lyrics, custom themes, playlists that sync to your account, and a sleep timer.",
      },
      { property: "og:title", content: "Mevet Player" },
      {
        property: "og:description",
        content: "Offline music player with synced lyrics, themes, playlists and a sleep timer.",
      },
      { property: "og:type", content: "music.radio_station" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const tracks = useLibrary((s) => s.tracks);
  const scanning = useLibrary((s) => s.scanning);
  const progress = useLibrary((s) => s.progress);
  const playQueue = usePlayer((s) => s.playQueue);
  const { user } = useAuth();
  const [picker, setPicker] = useState<Track | null>(null);

  const albums = groupBy(tracks, "album").length;
  const artists = groupBy(tracks, "artist").length;
  const recent = tracks.slice(0, 6);

  return (
    <AppShell
      title="Mevet Player"
      subtitle={user ? `Signed in · ${user.email}` : "Playing locally — sign in to sync"}
      action={<AddMusic compact />}
    >
      {!tracks.length ? (
        <section className="animate-rise space-y-5 rounded-3xl border border-border bg-card/70 p-6 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Music2 className="size-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Load your music</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick audio files or a whole folder from this device. Nothing is uploaded — playback
              stays on your phone.
            </p>
          </div>
          <AddMusic />
          {!user ? (
            <Link to="/auth" className="block text-sm font-medium text-primary">
              Sign in to sync playlists & themes
            </Link>
          ) : null}
        </section>
      ) : (
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-3">
            <button
              onClick={() => playQueue(tracks, 0)}
              className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground"
            >
              <Play className="size-5" /> Play all
            </button>
            <button
              onClick={() => {
                usePlayer.setState({ shuffle: true });
                playQueue(tracks, Math.floor(Math.random() * tracks.length));
              }}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-4 text-sm font-semibold"
            >
              <Shuffle className="size-5" /> Shuffle
            </button>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Stat to="/songs" icon={Music2} label="Songs" value={tracks.length} />
            <Stat to="/albums" icon={Disc3} label="Albums" value={albums} />
            <Stat to="/artists" icon={Mic2} label="Artists" value={artists} />
            <Stat to="/folders" icon={FolderOpen} label="Folders" value={groupBy(tracks, "folder").length} />
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold">Recently added</h2>
              <Link to="/songs" className="text-xs font-medium text-primary">
                See all
              </Link>
            </div>
            <div className="divide-y divide-border/60">
              {recent.map((t, i) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  onPlay={() => playQueue(tracks, i)}
                  onAdd={() => setPicker(t)}
                />
              ))}
            </div>
          </section>

          <Link
            to="/playlists"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-4"
          >
            <ListMusic className="size-5 text-primary" />
            <span className="text-sm font-medium">Your playlists</span>
          </Link>
        </div>
      )}

      {scanning ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Reading tags… {progress.done}/{progress.total}
        </p>
      ) : null}

      <PlaylistPicker track={picker} onClose={() => setPicker(null)} />
    </AppShell>
  );
}

function Stat({
  to,
  icon: Icon,
  label,
  value,
}: {
  to: "/songs" | "/albums" | "/artists" | "/folders";
  icon: typeof Music2;
  label: string;
  value: number;
}) {
  return (
    <Link to={to} className="rounded-2xl border border-border bg-card/70 p-4">
      <Icon className="size-5 text-primary" />
      <p className="mt-3 text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Link>
  );
}
