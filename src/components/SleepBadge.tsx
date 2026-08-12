import { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import { usePlayer } from "@/store/player";

export function SleepBadge() {
  const sleepEndsAt = usePlayer((s) => s.sleepEndsAt);
  const untilTrackEnd = usePlayer((s) => s.sleepUntilTrackEnd);
  const [, force] = useState(0);

  useEffect(() => {
    if (!sleepEndsAt) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [sleepEndsAt]);

  if (!sleepEndsAt && !untilTrackEnd) return null;

  const label = untilTrackEnd
    ? "song end"
    : (() => {
        const left = Math.max(0, Math.round(((sleepEndsAt ?? 0) - Date.now()) / 1000));
        return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      })();

  return (
    <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
      <Moon className="size-3.5" />
      {label}
    </span>
  );
}
