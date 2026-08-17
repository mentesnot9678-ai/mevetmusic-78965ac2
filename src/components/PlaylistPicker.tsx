import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ListMusic, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Track } from "@/lib/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type PlaylistRow = { id: string; name: string; count: number; has: boolean };

export function PlaylistPicker({
  track,
  onClose,
}: {
  track: Track | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    if (!user || !track) return;
    setLoading(true);
    const [{ data: lists }, { data: rows }] = await Promise.all([
      supabase.from("playlists").select("id, name").order("created_at", { ascending: false }),
      supabase.from("playlist_tracks").select("playlist_id, track_key"),
    ]);
    setPlaylists(
      (lists ?? []).map((p) => {
        const mine = (rows ?? []).filter((r) => r.playlist_id === p.id);
        return {
          id: p.id,
          name: p.name,
          count: mine.length,
          has: mine.some((r) => r.track_key === track.key),
        };
      }),
    );
    setLoading(false);
  }, [user, track]);

  useEffect(() => {
    if (track && user) void load();
  }, [track, user, load]);

  const addTo = async (playlist: PlaylistRow) => {
    if (!track || !user) return;
    if (playlist.has) {
      toast.info(`Already in "${playlist.name}"`);
      return;
    }
    setBusy(playlist.id);
    const { error } = await supabase.from("playlist_tracks").insert({
      playlist_id: playlist.id,
      user_id: user.id,
      track_key: track.key,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      position: playlist.count,
    });
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      toast.success(`Added to "${playlist.name}"`);
      onClose();
    }
  };

  const create = async () => {
    if (!user || !name.trim()) return;
    setBusy("new");
    const { data, error } = await supabase
      .from("playlists")
      .insert({ user_id: user.id, name: name.trim() })
      .select("id, name")
      .single();
    setBusy(null);
    if (error || !data) {
      toast.error(error?.message ?? "Could not create playlist");
      return;
    }
    setName("");
    await addTo({ id: data.id, name: data.name, count: 0, has: false });
  };

  return (
    <Dialog open={!!track} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[22rem] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add to playlist</DialogTitle>
        </DialogHeader>
        {track ? (
          <p className="-mt-2 truncate text-xs text-muted-foreground">{track.title}</p>
        ) : null}
        {!user ? (
          <div className="space-y-3 text-center">
            <ListMusic className="mx-auto size-7 text-primary" />
            <p className="text-sm text-muted-foreground">Sign in to create and sync playlists.</p>
            <Link
              to="/auth"
              onClick={onClose}
              className="inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="max-h-56 space-y-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center gap-2 px-1 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading playlists…
                </div>
              ) : (
                playlists.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addTo(p)}
                    disabled={busy === p.id}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm active:bg-secondary disabled:opacity-60"
                  >
                    <ListMusic className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.count}</span>
                    {p.has ? <Check className="size-4 text-primary" /> : null}
                  </button>
                ))
              )}
              {!loading && !playlists.length ? (
                <p className="px-1 py-2 text-sm text-muted-foreground">
                  No playlists yet — create your first one below.
                </p>
              ) : null}
            </div>
            <div className="flex gap-2 border-t border-border pt-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void create()}
                placeholder="New playlist name"
                className="min-w-0 flex-1 rounded-lg border border-input bg-secondary px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={create}
                disabled={!name.trim() || busy === "new"}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Plus className="size-4" /> Create
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
