"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function ThemeSync() {
  const supabase = createClient();

  useEffect(() => {
    // 1. Initial client-side local sync from Supabase to prevent stale static variables
    async function syncTheme() {
      const { data } = await supabase.from("site_settings").select("accent_color").limit(1).single();
      if (data?.accent_color) {
        applyThemeColor(data.accent_color);
      }
    }
    syncTheme();

    // 2. Realtime PostgreSQL update listener for immediate tab updates
    const channel = supabase
      .channel("site_settings_theme_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_settings" },
        (payload) => {
          if (payload.new && payload.new.accent_color) {
            applyThemeColor(payload.new.accent_color);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return null;
}

function applyThemeColor(primary: string) {
  if (!primary) return;
  const glow = `${primary}1A`; // 10% opacity
  const border = `${primary}33`; // 20% opacity
  const muted = `${primary}80`; // 50% opacity

  const root = document.documentElement;
  root.style.setProperty("--accent-primary", primary);
  root.style.setProperty("--accent-secondary", primary);
  root.style.setProperty("--accent-glow", glow);
  root.style.setProperty("--accent-border", border);
  root.style.setProperty("--accent-muted", muted);
  root.style.setProperty("--primary", primary);
  root.style.setProperty("--accent", primary);
  root.style.setProperty("--ring", primary);
}
