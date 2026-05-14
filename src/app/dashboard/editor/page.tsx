import { createClient } from "@/utils/supabase/server";
import { SiteEditorClient } from "./client";

export default async function EditorDashboard() {
  const supabase = await createClient();
  
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .single();

  const { data: allPhotos } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Site Editor</h1>
        <p className="text-zinc-400 font-light text-lg">Control the visual layout and featured content of your website.</p>
      </div>

      <SiteEditorClient 
        initialSettings={settings} 
        allPhotos={allPhotos || []} 
      />
    </div>
  );
}
