import type { ReactNode } from "react";
import { MiniPlayer } from "./MiniPlayer";
import { TabBar } from "./TabBar";
import { SleepBadge } from "./SleepBadge";
import { OfflineBanner } from "./OfflineBanner";


export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative mx-auto min-h-screen max-w-md">
      <div
        className="app-backdrop"
        style={{ opacity: 1 }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-background"
        style={{ opacity: "var(--app-bg-dim)" }}
        aria-hidden
      />
      <header className="sticky top-0 z-30 glass px-4 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold">{title}</h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SleepBadge />
            {action}
          </div>
        </div>
      </header>
      <main className="px-4 pb-40 pt-3">
        <div className="mb-3 empty:mb-0">
          <OfflineBanner />
        </div>
        {children}
      </main>

      <MiniPlayer />
      <TabBar />
    </div>
  );
}
