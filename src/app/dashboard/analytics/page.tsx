import { createClient } from "@/utils/supabase/server";
import { 
  Eye, Download, TrendingUp, 
  BarChart3, Camera, Clock, 
  ArrowUpRight, Users 
} from "lucide-react";
import { AnalyticsClient } from "./client";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // 1. Fetch Events
  const { data: events } = await supabase
    .from("analytics_events")
    .select("*, album:albums(title), photo:photos(title, image_url)")
    .order("created_at", { ascending: false })
    .limit(100);

  // 2. Fetch Total Stats (Simplified for now)
  const { count: totalViews } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "vault_view");

  const { count: totalDownloads } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "photo_download");

  // 3. Aggregate Top Albums
  const { data: topAlbumsData } = await supabase
    .rpc('get_top_albums'); // We might need to create this or aggregate in memory

  // For now, let's aggregate in memory as we only have 100 events
  const stats = {
    totalViews: totalViews || 0,
    totalDownloads: totalDownloads || 0,
    activeLeads: 0, // Would fetch from bookings
    recentEvents: events || []
  };

  return (
    <div className="space-y-12 pb-32">
       <header>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2 italic">Visual Intelligence</h1>
          <p className="text-zinc-500 font-light tracking-[0.4em] uppercase text-[10px]">Client Engagement & Narrative Tracking</p>
       </header>

       {/* Top Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="premium-card bg-zinc-900/40 p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Eye size={48} className="text-white" />
             </div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-4">Total Vault Views</span>
             <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-white leading-none">{stats.totalViews}</span>
                <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center gap-1">
                   <ArrowUpRight size={10} /> +12%
                </span>
             </div>
          </div>

          <div className="premium-card bg-zinc-900/40 p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Download size={48} className="text-white" />
             </div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-4">Asset Downloads</span>
             <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-white leading-none">{stats.totalDownloads}</span>
                <span className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center gap-1">
                   <ArrowUpRight size={10} /> +5%
                </span>
             </div>
          </div>

          <div className="premium-card bg-zinc-900/40 p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={48} className="text-white" />
             </div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-4">Avg. Engagement</span>
             <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-white leading-none">8.4</span>
                <span className="text-[10px] font-bold text-zinc-600 mb-1 uppercase tracking-widest">Mins / Vault</span>
             </div>
          </div>

          <div className="premium-card bg-zinc-900/40 p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={48} className="text-white" />
             </div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-4">Unique Clients</span>
             <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-white leading-none">24</span>
                <span className="text-[10px] font-bold text-zinc-600 mb-1 uppercase tracking-widest">Active Leads</span>
             </div>
          </div>
       </div>

       <AnalyticsClient stats={stats} />
    </div>
  );
}
