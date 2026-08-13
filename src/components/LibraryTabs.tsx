import { Link, useRouterState } from "@tanstack/react-router";

const LINKS = [
  { to: "/songs", label: "Songs" },
  { to: "/albums", label: "Albums" },
  { to: "/artists", label: "Artists" },
  { to: "/folders", label: "Folders" },
] as const;

export function LibraryTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
      {LINKS.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            pathname === l.to
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card/70 text-muted-foreground"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export function EmptyLibrary() {
  return (
    <p className="rounded-2xl border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
      No music loaded yet.{" "}
      <Link to="/" className="font-medium text-primary">
        Add songs
      </Link>
    </p>
  );
}
