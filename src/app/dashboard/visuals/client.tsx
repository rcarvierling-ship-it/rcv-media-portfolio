"use client";

import { motion } from "framer-motion";
import { 
  Clock, Download, Eye, 
  ArrowRight, ShieldCheck, Camera,
  MousePointer2, Timer, Flame
} from "lucide-react";
import Image from "next/image";

export function VisualsClient({ stats }: { stats: any }) {
  // Aggregate heatmap data by photo
  const photoHeatmaps: Record<string, any[]> = {};
  stats.heatmapData.forEach((point: any) => {
    if (point.photo_id) {
      if (!photoHeatmaps[point.photo_id]) photoHeatmaps[point.photo_id] = [];
      photoHeatmaps[point.photo_id].push(point);
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
       
       {/* Left Column: Recent Activity Feed */}
       <div className="lg:col-span-2 space-y-12">
          <section className="space-y-8">
             <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
                   <Clock size={14} className="text-brand-accent" /> Live Intelligence Feed
                </h2>
                <div className="h-px w-24 bg-zinc-900" />
             </div>

             <div className="space-y-4">
                {stats.recentEvents.map((event: any, i: number) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="premium-card bg-zinc-950 border border-white/5 p-5 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all"
                  >
                     <div className="flex items-center gap-6">
                        <div className={`p-3 rounded-lg ${
                           event.event_type === 'vault_view' ? 'bg-blue-500/10 text-blue-500' : 
                           event.event_type === 'photo_download' ? 'bg-emerald-500/10 text-emerald-500' : 
                           event.event_type === 'photo_hover' ? 'bg-orange-500/10 text-orange-500' :
                           event.event_type === 'engagement_duration' ? 'bg-purple-500/10 text-purple-500' :
                           'bg-zinc-800 text-zinc-400'
                        }`}>
                           {event.event_type === 'vault_view' ? <Eye size={18} /> : 
                            event.event_type === 'photo_download' ? <Download size={18} /> :
                            event.event_type === 'photo_hover' ? <MousePointer2 size={18} /> :
                            <Timer size={18} />}
                        </div>
                        <div>
                           <h4 className="text-white font-black uppercase tracking-tight text-xs mb-1">
                              {event.event_type === 'vault_view' ? 'Secure Vault Accessed' : 
                               event.event_type === 'photo_download' ? 'Asset Downloaded' :
                               event.event_type === 'photo_hover' ? 'Tactile Engagement Logged' :
                               'Asset Analysis Complete'}
                           </h4>
                           <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                              {event.album?.title || 'Unknown Collection'} 
                              {event.photo?.title ? ` // ${event.photo.title}` : ''}
                              {event.metadata?.duration_ms ? ` // ${(event.metadata.duration_ms / 1000).toFixed(1)}s View` : ''}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-zinc-800 mb-1">Timestamp</span>
                        <span className="text-[10px] font-mono text-zinc-500">{new Date(event.created_at).toLocaleTimeString()}</span>
                     </div>
                  </motion.div>
                ))}

                {stats.recentEvents.length === 0 && (
                  <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-2xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Waiting for live engagement data...</p>
                  </div>
                )}
             </div>
          </section>

          {/* Heatmap Section */}
          <section className="space-y-8">
             <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
                   <Flame size={14} className="text-orange-500" /> Heatmap Intelligence
                </h2>
                <div className="h-px w-24 bg-zinc-900" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.entries(photoHeatmaps).slice(0, 4).map(([photoId, points]: [string, any]) => {
                  const photo = stats.recentEvents.find((e: any) => e.photo_id === photoId)?.photo;
                  if (!photo) return null;
                  
                  return (
                    <div key={photoId} className="premium-card bg-zinc-900/40 rounded-2xl border border-white/5 overflow-hidden">
                       <div className="relative aspect-video">
                          <Image src={photo.image_url} alt={photo.title} fill className="object-cover opacity-50 grayscale" />
                          
                          {/* Heatmap Dots */}
                          {points.map((p: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="absolute w-4 h-4 bg-orange-500/40 rounded-full blur-md animate-pulse"
                              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, transform: 'translate(-50%, -50%)' }}
                            />
                          ))}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-white italic">{photo.title}</h4>
                             <span className="text-[8px] font-bold text-orange-500 uppercase tracking-widest">{points.length} Engagement Nodes</span>
                          </div>
                       </div>
                    </div>
                  );
                })}

                {Object.keys(photoHeatmaps).length === 0 && (
                  <div className="col-span-2 py-24 text-center border-2 border-dashed border-white/5 rounded-2xl bg-zinc-900/10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800 italic underline-offset-8 underline decoration-orange-500/20">Awaiting engagement heatmaps...</p>
                  </div>
                )}
             </div>
          </section>
       </div>

       {/* Right Column: Top Assets & Performance */}
       <div className="space-y-12">
          {/* Top Performance Chart (Custom CSS) */}
          <div className="premium-card bg-zinc-900/20 border border-white/5 p-8 rounded-2xl">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-8 border-b border-white/5 pb-4">Conversion Flow</h3>
             
             <div className="space-y-8">
                {[
                  { label: 'Inquiries', value: 85, color: 'bg-zinc-800' },
                  { label: 'Bookings', value: 62, color: 'bg-zinc-700' },
                  { label: 'Contracts', value: 45, color: 'bg-zinc-500' },
                  { label: 'Paid', value: 38, color: 'bg-brand-accent' },
                ].map((bar) => (
                  <div key={bar.label} className="space-y-3">
                     <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                        <span className="text-zinc-500">{bar.label}</span>
                        <span className="text-white">{bar.value}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${bar.value}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                          className={`h-full ${bar.color} ${bar.label === 'Paid' ? 'shadow-[0_0_15px_var(--accent-glow)]' : ''}`}
                        />
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Tactical Advisory */}
          <div className="p-8 border border-brand-accent/20 bg-brand-accent/5 rounded-2xl">
             <div className="flex items-center gap-3 text-brand-accent mb-4">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Insight</span>
             </div>
             <p className="text-[11px] text-zinc-400 font-bold uppercase leading-relaxed tracking-wider">
                Heatmap density indicates high interest in <span className="text-white">Cinematic Closeups</span>. Consider increasing the proportion of this shoot type in your future collections.
             </p>
          </div>
       </div>
    </div>
  );
}
