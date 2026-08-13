import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { LogOut, Moon, Palette, Wallpaper } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SleepTimer } from "@/components/SleepTimer";
import { useAuth } from "@/hooks/useAuth";
import { THEMES, useTheme } from "@/store/theme";
import { useLibrary } from "@/store/library";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Mevet Player" },
      {
        name: "description",
        content: "Change your theme, accent colours, background wallpaper, sleep timer and account.",
      },
      { property: "og:title", content: "Settings — Mevet Player" },
      { property: "og:description", content: "Themes, wallpaper, sleep timer and account settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { user, signOut } = useAuth();
  const { preset, custom, setPreset, setCustom, persist } = useTheme();
  const clear = useLibrary((s) => s.clear);
  const tracks = useLibrary((s) => s.tracks);
  const wallpaperRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    await persist(user?.id ?? null);
    toast.success(user ? "Saved to your account" : "Saved on this device");
  };

  return (
    <AppShell title="Settings" subtitle={user ? user.email ?? "" : "Not signed in"}>
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Palette className="size-4 text-primary" /> Theme
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setPreset(t.id);
                void persist(user?.id ?? null);
              }}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left ${
                preset === t.id ? "border-primary bg-primary/10" : "border-border bg-card/70"
              }`}
            >
              <span className="flex -space-x-1.5">
                {t.swatch.map((c) => (
                  <span
                    key={c}
                    className="size-4 rounded-full border border-border"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
              <span className="text-sm font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold">Custom colours</h2>
        <div className="space-y-2 rounded-2xl border border-border bg-card/70 p-4">
          <ColorRow
            label="Accent"
            value={custom.primary ?? "#f5a623"}
            onChange={(v) => setCustom({ primary: v })}
          />
          <ColorRow
            label="Background"
            value={custom.background ?? "#000000"}
            onChange={(v) => setCustom({ background: v })}
          />
          <ColorRow
            label="Text"
            value={custom.foreground ?? "#ffffff"}
            onChange={(v) => setCustom({ foreground: v })}
          />
          <div className="flex gap-2 pt-2">
            <button
              onClick={save}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Save colours
            </button>
            <button
              onClick={() => {
                useTheme.setState({ custom: {} });
                setPreset(preset);
                void persist(user?.id ?? null);
              }}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Wallpaper className="size-4 text-primary" /> Background
        </h2>
        <div className="space-y-3 rounded-2xl border border-border bg-card/70 p-4">
          <p className="text-xs text-muted-foreground">
            Use your own wallpaper as the app background, then dial in how much it shows through.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => wallpaperRef.current?.click()}
              className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-medium"
            >
              Choose image
            </button>
            <button
              onClick={() => setCustom({ bgImage: "" })}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium"
            >
              Remove
            </button>
          </div>
          <label className="block text-xs text-muted-foreground">
            Dim
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={custom.bgDim ?? 0.55}
              onChange={(e) => setCustom({ bgDim: Number(e.target.value) })}
              className="mt-1 w-full accent-[var(--primary)]"
            />
          </label>
          <input
            ref={wallpaperRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setCustom({ bgImage: URL.createObjectURL(file) });
            }}
          />
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Moon className="size-4 text-primary" /> Sleep timer
        </h2>
        <SleepTimer
          trigger={
            <button className="w-full rounded-2xl border border-border bg-card/70 p-4 text-left text-sm">
              Set a sleep timer
            </button>
          }
        />
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold">Library</h2>
        <div className="rounded-2xl border border-border bg-card/70 p-4 text-sm">
          <p className="text-muted-foreground">{tracks.length} tracks loaded on this device.</p>
          <button onClick={clear} className="mt-3 text-sm font-medium text-destructive">
            Clear loaded music
          </button>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold">Account</h2>
        {user ? (
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 rounded-2xl border border-border bg-card/70 p-4 text-sm font-medium"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        ) : (
          <Link
            to="/auth"
            className="block rounded-2xl bg-primary p-4 text-center text-sm font-semibold text-primary-foreground"
          >
            Sign in or create an account
          </Link>
        )}
      </section>
    </AppShell>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between text-sm">
      {label}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-8 cursor-pointer rounded-lg border border-border bg-transparent"
      />
    </label>
  );
}
