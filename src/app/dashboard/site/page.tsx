import { createClient } from "@/utils/supabase/server";
import { SiteEditorClient } from "./client";

export default async function SiteEditorDashboard() {
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
    <div className="space-y-12 pb-24">
      <header className="border-b border-white/5 pb-10">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-3 italic">Site Editor</h1>
        <p className="text-zinc-400 font-black tracking-[0.4em] uppercase text-[10px]">Brand assets, bio narrative, accent color DNA, homepage hero, and SEO settings</p>
      </header>

      <SiteEditorClient 
        initialSettings={settings} 
        allPhotos={allPhotos || []} 
      />
    </div>
  );
}
