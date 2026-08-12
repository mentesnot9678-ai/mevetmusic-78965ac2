import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Track } from "@/lib/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type PlaylistRow = { id: string; name: string };

export function PlaylistPicker({
  track,
  onClose,
}: {
  track: Track | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistRow[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!track || !user) return;
    void supabase
      .from("playlists")
      .select("id, name")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPlaylists(data ?? []));
  }, [track, user]);

  const addTo = async (playlistId: string) => {
    if (!track || !user) return;
    const { error } = await supabase.from("playlist_tracks").insert({
      playlist_id: playlistId,
      user_id: user.id,
      track_key: track.key,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
    });
    if (error) toast.error(error.message);
    else toast.success("Added to playlist");
    onClose();
  };

  const create = async () => {
    if (!user || !name.trim()) return;
    const { data, error } = await supabase
      .from("playlists")
      .insert({ user_id: user.id, name: name.trim() })
      .select("id, name")
      .single();
    if (error || !data) {
      toast.error(error?.message ?? "Could not create playlist");
      return;
    }
    setName("");
    await addTo(data.id);
  };

  return (
    <Dialog open={!!track} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[22rem] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add to playlist</DialogTitle>
        </DialogHeader>
        {!user ? (
          <p className="text-sm text-muted-foreground">Sign in to create and sync playlists.</p>
        ) : (
          <div className="space-y-3">
            <div className="max-h-56 space-y-1 overflow-y-auto">
              {playlists.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addTo(p.id)}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm active:bg-secondary"
                >
                  {p.name}
                </button>
              ))}
              {!playlists.length ? (
                <p className="px-1 text-sm text-muted-foreground">No playlists yet.</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New playlist name"
                className="min-w-0 flex-1 rounded-lg border border-input bg-secondary px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={create}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                Create
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
