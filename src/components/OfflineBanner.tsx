import { CloudOff, Loader2 } from "lucide-react";
import { useOnline } from "@/hooks/useOnline";
import { useLyrics } from "@/store/lyrics";

export function OfflineBanner() {
  const online = useOnline();
  const prefetching = useLyrics((s) => s.prefetching);

  if (!online) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground">
        <CloudOff className="size-4 shrink-0 text-primary" />
        Offline mode — your music, saved lyrics and settings still work.
      </div>
    );
  }

  if (prefetching) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        Saving lyrics for offline use…
      </div>
    );
  }

  return null;
}
