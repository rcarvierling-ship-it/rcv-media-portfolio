import { createClient } from "@/utils/supabase/server";

export async function ThemeInjector() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("accent_color").limit(1).single();

  const primary = settings?.accent_color || "#C8FF00";
  
  // Generate variations
  const glow = `${primary}1A`; // 10% opacity
  const border = `${primary}33`; // 20% opacity
  const muted = `${primary}80`; // 50% opacity
  const solid = primary;

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      :root {
        --accent-primary: ${solid};
        --accent-secondary: ${solid};
        --accent-glow: ${glow};
        --accent-border: ${border};
        --accent-muted: ${muted};
        --primary: ${solid};
        --accent: ${solid};
        --ring: ${solid};
      }
    `}} />
  );
}
