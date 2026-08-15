import { create } from "zustand";
import { getPreset, THEMES, type ThemeVars } from "@/lib/themes";
import { supabase } from "@/integrations/supabase/client";

export type ThemeCustom = {
  primary?: string;
  background?: string;
  foreground?: string;
  bgImage?: string;
  bgDim?: number;
};

type ThemeState = {
  preset: string;
  custom: ThemeCustom;
  setPreset: (id: string) => void;
  setCustom: (c: ThemeCustom) => void;
  apply: () => void;
  hydrate: (userId?: string | null) => Promise<void>;
  persist: (userId?: string | null) => Promise<void>;
};

const LS_KEY = "mevet.theme";

function hexToOklchish(hex: string) {
  return hex; // CSS accepts hex directly for our custom properties
}

export const useTheme = create<ThemeState>((set, get) => ({
  preset: "amoled",
  custom: {},
  setPreset: (id) => {
    set({ preset: id });
    get().apply();
  },
  setCustom: (c) => {
    set({ custom: { ...get().custom, ...c } });
    get().apply();
  },
  apply: () => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const vars: ThemeVars = getPreset(get().preset).vars;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    const c = get().custom;
    if (c.primary) {
      root.style.setProperty("--primary", hexToOklchish(c.primary));
      root.style.setProperty("--ring", hexToOklchish(c.primary));
    }
    if (c.background) root.style.setProperty("--background", hexToOklchish(c.background));
    if (c.foreground) root.style.setProperty("--foreground", hexToOklchish(c.foreground));
    root.style.setProperty("--app-bg-image", c.bgImage ? `url(${c.bgImage})` : "none");
    root.style.setProperty("--app-bg-dim", String(c.bgDim ?? 0.55));
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LS_KEY, JSON.stringify({ preset: get().preset, custom: c }));
    }
  },
  hydrate: async (userId) => {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { preset: string; custom: ThemeCustom };
          set({ preset: parsed.preset || "amoled", custom: parsed.custom || {} });
        } catch {
          /* ignore */
        }
      }
    }
    if (userId && (typeof navigator === "undefined" || navigator.onLine)) {
      try {
        const { data } = await supabase
          .from("user_settings")
          .select("theme, custom")
          .eq("user_id", userId)
          .maybeSingle();
        if (data) {
          set({
            preset: data.theme || "amoled",
            custom: (data.custom as ThemeCustom) || {},
          });
        }
      } catch {
        /* offline — keep the locally stored theme */
      }
    }

    get().apply();
  },
  persist: async (userId) => {
    get().apply();
    if (!userId) return;
    const { preset, custom } = get();
    // Background images can be huge data URLs; keep those local only.
    const cloudCustom = { ...custom };
    if (cloudCustom.bgImage && cloudCustom.bgImage.startsWith("blob:")) delete cloudCustom.bgImage;
    await supabase
      .from("user_settings")
      .upsert(
        { user_id: userId, theme: preset, custom: cloudCustom, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
  },
}));

export { THEMES };
