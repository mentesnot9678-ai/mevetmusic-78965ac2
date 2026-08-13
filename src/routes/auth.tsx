import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Mevet Player" },
      {
        name: "description",
        content: "Sign in or create a Mevet Player account to sync your playlists, themes and settings.",
      },
      { property: "og:title", content: "Sign in — Mevet Player" },
      { property: "og:description", content: "Create an account to sync playlists and themes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) void navigate({ to: "/" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        setSent(true);
        toast.success("Check your email to confirm your account");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent(true);
        toast.success("Password reset link sent");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="animate-rise space-y-6">
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Music2 className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Mevet Player</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Create an account to sync playlists and themes"
              : mode === "forgot"
                ? "We'll email you a reset link"
                : "Sign in to pick up where you left off"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
          ) : null}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {mode !== "forgot" ? (
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
          ) : null}
          <button
            disabled={busy}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : mode === "forgot"
                  ? "Send reset link"
                  : "Sign in"}
          </button>
        </form>

        {sent ? (
          <p className="rounded-xl bg-primary/10 p-3 text-center text-xs text-primary">
            Check your inbox to continue.
          </p>
        ) : null}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={google}
          className="w-full rounded-xl border border-border bg-card py-3 text-sm font-semibold"
        >
          Continue with Google
        </button>

        <div className="space-y-2 text-center text-sm">
          {mode !== "signin" ? (
            <button onClick={() => setMode("signin")} className="text-primary">
              Already have an account? Sign in
            </button>
          ) : (
            <>
              <button onClick={() => setMode("signup")} className="block w-full text-primary">
                New here? Create an account
              </button>
              <button
                onClick={() => setMode("forgot")}
                className="block w-full text-muted-foreground"
              >
                Forgot password?
              </button>
            </>
          )}
          <Link to="/" className="block text-xs text-muted-foreground">
            Continue without an account
          </Link>
        </div>
      </div>
    </div>
  );
}
