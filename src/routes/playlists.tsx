import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListMusic, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLibrary } from "@/store/library";
import { formatTime, usePlayer } from "@/store/player";

export const Route = createFileRoute("/playlists")({
  head: () => ({
    meta: [
      { title: "Playlists — Mevet Player" },
      {
        name: "description",
        content: "Playlists you create in Mevet Player, saved to your account and synced across devices.",
      },
      { property: "og:title", content: "Playlists — Mevet Player" },
      { property: "og:description", content: "Create playlists that sync with your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Playlists,
});

type Playlist = { id: string; name: string };
type PlaylistTrack = {
  id: string;
  track_key: string;
  title: string;
  artist: string | null;
  album: string | null;
  duration: number | null;
};

function Playlists() {
  const { user, loading } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [items, setItems] = useState<PlaylistTrack[]>([]);
  const [name, setName] = useState("");
  const tracks = useLibrary((s) => s.tracks);
  const playQueue = usePlayer((s) => s.playQueue);

  const refresh = async () => {
    const { data } = await supabase
      .from("playlists")
      .select("id, name")
      .order("created_at", { ascending: false });
    setPlaylists(data ?? []);
  };

  useEffect(() => {
    if (user) void refresh();
  }, [user]);

  useEffect(() => {
    if (!openId) return setItems([]);
    void supabase
      .from("playlist_tracks")
      .select("id, track_key, title, artist, album, duration")
      .eq("playlist_id", openId)
      .order("position")
      .order("created_at")
      .then(({ data }) => setItems(data ?? []));
  }, [openId]);

  const create = async () => {
    if (!user || !name.trim()) return;
    const { error } = await supabase.from("playlists").insert({ user_id: user.id, name: name.trim() });
    if (error) toast.error(error.message);
    setName("");
    void refresh();
  };

  const remove = async (id: string) => {
    await supabase.from("playlists").delete().eq("id", id);
    if (openId === id) setOpenId(null);
    void refresh();
  };

  const playPlaylist = () => {
    const resolved = items
      .map((it) => tracks.find((t) => t.key === it.track_key || t.title === it.title))
      .filter((t): t is NonNullable<typeof t> => !!t);
    if (!resolved.length) {
      toast.error("Those files aren't loaded on this device yet");
      return;
    }
    playQueue(resolved, 0);
  };

  if (!loading && !user) {
    return (
      <AppShell title="Playlists" subtitle="Sign in to sync">
        <div className="rounded-2xl border border-border bg-card/70 p-6 text-center">
          <ListMusic className="mx-auto size-8 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Playlists are saved to your account so they follow you between devices.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Sign in or sign up
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Playlists" subtitle={`${playlists.length} saved`}>
      <div className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New playlist"
          className="min-w-0 flex-1 rounded-xl border border-input bg-card/70 px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={create}
          className="flex items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> Create
        </button>
      </div>

      <div className="space-y-2">
        {playlists.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card/70">
            <div className="flex items-center gap-3 p-3">
              <button
                onClick={() => setOpenId(openId === p.id ? null : p.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {openId === p.id ? `${items.length} tracks` : "Tap to open"}
                </p>
              </button>
              {openId === p.id ? (
                <button
                  onClick={playPlaylist}
                  aria-label={`Play ${p.name}`}
                  className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"
                >
                  <Play className="size-4" />
                </button>
              ) : null}
              <button
                onClick={() => remove(p.id)}
                aria-label={`Delete ${p.name}`}
                className="grid size-9 place-items-center rounded-full text-muted-foreground"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {openId === p.id ? (
              <ul className="animate-rise divide-y divide-border/60 border-t border-border">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate">{it.title}</span>
                    <span className="truncate text-xs text-muted-foreground">{it.artist}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {it.duration ? formatTime(it.duration) : ""}
                    </span>
                  </li>
                ))}
                {!items.length ? (
                  <li className="px-4 py-3 text-sm text-muted-foreground">
                    Empty — add songs with the + button in your library.
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        ))}
        {!playlists.length ? (
          <p className="rounded-2xl border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
            No playlists yet.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
