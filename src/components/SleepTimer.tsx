import { usePlayer } from "@/store/player";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Moon } from "lucide-react";
import { toast } from "sonner";

const OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40];

export function SleepTimer({ trigger }: { trigger?: React.ReactNode }) {
  const setSleep = usePlayer((s) => s.setSleep);
  const sleepEndsAt = usePlayer((s) => s.sleepEndsAt);
  const untilTrackEnd = usePlayer((s) => s.sleepUntilTrackEnd);
  const active = !!sleepEndsAt || untilTrackEnd;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <button
            aria-label="Sleep timer"
            className={`grid size-10 place-items-center rounded-full ${active ? "bg-primary/20 text-primary" : "text-foreground/70"}`}
          >
            <Moon className="size-5" />
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Sleep timer</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-4 gap-2 p-4 pt-0">
          {OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => {
                setSleep(m);
                toast.success(`Music stops in ${m} minutes`);
              }}
              className="rounded-xl border border-border bg-card py-3 text-sm font-medium"
            >
              {m}m
            </button>
          ))}
        </div>
        <div className="space-y-2 px-4 pb-6">
          <button
            onClick={() => {
              setSleep(null, true);
              toast.success("Stopping when this song ends");
            }}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            Until current song ends
          </button>
          {active ? (
            <button
              onClick={() => {
                setSleep(null);
                usePlayer.setState({ sleepUntilTrackEnd: false });
                toast("Sleep timer cancelled");
              }}
              className="w-full rounded-xl border border-border py-3 text-sm font-medium"
            >
              Cancel timer
            </button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
