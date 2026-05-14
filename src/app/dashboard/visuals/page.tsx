import { createClient } from "@/utils/supabase/server";
import { 
  Eye, Download, TrendingUp, 
  Clock, ArrowUpRight, Users,
  MousePointer2, Timer
} from "lucide-react";
import { VisualsClient } from "./client";

export default async function VisualsPage() {
  const supabase = await createClient();

  // 1. Fetch Recent Events
  const { data: events } = await supabase
    .from("analytics_events")
    .select("*, album:albums(title), photo:photos(title, image_url)")
    .order("created_at", { ascending: false })
    .limit(100);

  // 2. Fetch Engagement Data
  const { data: engagementEvents } = await supabase
    .from("analytics_events")
    .select("*")
    .in("event_type", ["photo_hover", "engagement_duration"]);

  // 3. Fetch Aggregate Stats
  const { count: totalViews } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "vault_view");

  const { count: totalDownloads } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "photo_download");

  // Calculate Avg Duration
  const durations = engagementEvents?.filter(e => e.event_type === 'engagement_duration').map(e => e.metadata?.duration_ms || 0) || [];
  const avgDurationSeconds = durations.length > 0 
    ? (durations.reduce((a, b) => a + b, 0) / durations.length / 1000).toFixed(1)
    : "0.0";

  // Aggregate Heatmap Data (Top hovered photos)
  const hoverEvents = engagementEvents?.filter(e => e.event_type === 'photo_hover') || [];
  const hoverCounts: Record<string, number> = {};
  hoverEvents.forEach(e => {
    if (e.photo_id) hoverCounts[e.photo_id] = (hoverCounts[e.photo_id] || 0) + 1;
  });

  const stats = {
    totalViews: totalViews || 0,
    totalDownloads: totalDownloads || 0,
    avgDuration: avgDurationSeconds,
    totalHovers: hoverEvents.length,
    recentEvents: events || [],
    heatmapData: hoverEvents.map(e => ({
      photo_id: e.photo_id,
      x: e.metadata?.x,
      y: e.metadata?.y
    }))
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
                <Timer size={48} className="text-white" />
             </div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-4">Avg. View Duration</span>
             <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-white leading-none">{stats.avgDuration}s</span>
                <span className="text-[10px] font-bold text-zinc-600 mb-1 uppercase tracking-widest">Per Asset</span>
             </div>
          </div>

          <div className="premium-card bg-zinc-900/40 p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MousePointer2 size={48} className="text-white" />
             </div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-4">Tactile Engagement</span>
             <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-white leading-none">{stats.totalHovers}</span>
                <span className="text-[10px] font-bold text-zinc-600 mb-1 uppercase tracking-widest">Significant Hovers</span>
             </div>
          </div>
       </div>

        <VisualsClient stats={stats} />
    </div>
  );
}
