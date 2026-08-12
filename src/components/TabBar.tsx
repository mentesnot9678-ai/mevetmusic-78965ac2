import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListMusic, Music2, Settings } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/songs", label: "Library", icon: Music2 },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const LIBRARY_PATHS = ["/songs", "/albums", "/artists", "/folders"];

export function TabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-stretch justify-around border-t border-border pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ to, label, icon: Icon }) => {
        const active =
          to === "/songs" ? LIBRARY_PATHS.includes(pathname) : pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
