import { createClient } from "@/utils/supabase/server";

export async function ThemeInjector() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("accent_color").limit(1).single();

  const primary = settings?.accent_color || "#3b82f6";
  
  // Generate variations (secondary is slightly darker)
  // For simplicity, we'll just use the primary for now or basic opacity for glow
  const glow = `${primary}1A`; // 10% opacity in HEX
  const border = `${primary}33`; // 20% opacity in HEX

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      :root {
        --accent-primary: ${primary};
        --accent-secondary: ${primary};
        --accent-glow: ${glow};
        --accent-border: ${border};
      }
    `}} />
  );
}
