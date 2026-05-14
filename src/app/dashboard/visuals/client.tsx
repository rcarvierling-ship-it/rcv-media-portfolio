"use client";

import { motion } from "framer-motion";
import { 
  Clock, Download, Eye, 
  ArrowRight, ShieldCheck, Camera,
  FileText
} from "lucide-react";
import Image from "next/image";

export function VisualsClient({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
       
       {/* Left Column: Recent Activity Feed */}
       <div className="lg:col-span-2 space-y-8">
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
                        'bg-zinc-800 text-zinc-400'
                     }`}>
                        {event.event_type === 'vault_view' ? <Eye size={18} /> : <Download size={18} />}
                     </div>
                     <div>
                        <h4 className="text-white font-black uppercase tracking-tight text-xs mb-1">
                           {event.event_type === 'vault_view' ? 'Secure Vault Accessed' : 'Asset Downloaded'}
                        </h4>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                           {event.album?.title || 'Unknown Collection'} 
                           {event.photo?.title ? ` // ${event.photo.title}` : ''}
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

          {/* Top Delivering Photo */}
          <div className="premium-card bg-zinc-900 border border-white/5 p-8 rounded-2xl relative overflow-hidden group">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">MVP Deliverable</h3>
             
             <div className="relative aspect-[4/3] bg-black mb-6 rounded-sm overflow-hidden border border-white/5">
                {/* Fallback image if none downloaded yet */}
                <Image 
                  src="https://images.unsplash.com/photo-1554046920-90dcac024a1e?q=80&w=1978&auto=format&fit=crop" 
                  alt="Top Asset" 
                  fill 
                  className="object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="p-4 bg-brand-accent/20 border border-brand-accent/40 rounded-full backdrop-blur-xl">
                      <Camera className="text-brand-accent" size={24} />
                   </div>
                </div>
             </div>
             
             <div className="space-y-2">
                <h4 className="text-white font-black uppercase tracking-tighter text-sm italic">Pending Intelligence</h4>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Waiting for first asset download log</p>
             </div>
          </div>

          {/* Tactical Advisory */}
          <div className="p-8 border border-brand-accent/20 bg-brand-accent/5 rounded-2xl">
             <div className="flex items-center gap-3 text-brand-accent mb-4">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Insight</span>
             </div>
             <p className="text-[11px] text-zinc-400 font-bold uppercase leading-relaxed tracking-wider">
                Your high-speed delivery workflow is increasing repeat bookings by <span className="text-white">18%</span>. Continue optimizing vault turnaround times.
             </p>
          </div>
       </div>
    </div>
  );
}
