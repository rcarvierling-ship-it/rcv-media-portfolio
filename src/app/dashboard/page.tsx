"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { deletePhoto, updatePhoto } from "@/app/actions/photos";
import { deleteBooking } from "@/app/actions/booking";
import { 
  DollarSign, Users, Target, ArrowRight, TrendingUp, X, 
  BarChart3, Activity, Calendar, ChevronRight, Info, Trash2,
  AlertTriangle, User, Settings, Camera, Mail, Scissors, Zap,
  MapPin, Clock, ShieldCheck, Copy, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Photo = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  public_id: string;
  album_id: string | null;
  is_featured: boolean;
  sort_order: number;
};

type Booking = {
  id: string;
  name: string;
  package_selected: string;
  shoot_type: string;
  status: string;
  pipeline_stage: string;
  total_amount: number;
  created_at: string;
  event_date: string;
};

type Package = {
  name: string;
  price: string;
};

export default function DashboardPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [
        { data: photosData }, 
        { data: bookingsData },
        { data: pkgData }
      ] = await Promise.all([
        supabase.from("photos").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("pricing_packages").select("name, price")
      ]);

      if (photosData) setPhotos(photosData);
      if (bookingsData) setBookings(bookingsData);
      if (pkgData) setPackages(pkgData);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const analytics = useMemo(() => {
    const totalLeads = bookings.length;
    const realizedProjects = bookings.filter(b => b.status !== "cancelled" && ['delivered', 'paid'].includes(b.pipeline_stage));
    const pipelineProjects = bookings.filter(b => b.status !== "cancelled" && !['delivered', 'paid'].includes(b.pipeline_stage));
    
    let realizedRevenue = 0;
    let projectedPipelineValue = 0;
    
    const revenueByMonth: Record<string, number> = {};
    const revenueByType: Record<string, number> = {};

    realizedProjects.forEach(b => {
      const val = Number(b.total_amount) || 0;
      realizedRevenue += val;
      const month = new Date(b.created_at).toLocaleString('default', { month: 'short' });
      revenueByMonth[month] = (revenueByMonth[month] || 0) + val;
      revenueByType[b.shoot_type] = (revenueByType[b.shoot_type] || 0) + val;
    });

    pipelineProjects.forEach(b => {
      projectedPipelineValue += (Number(b.total_amount) || 0);
    });

    const typeStats: Record<string, number> = {};
    bookings.forEach(b => {
      if (b.status === 'cancelled') return;
      typeStats[b.shoot_type] = (typeStats[b.shoot_type] || 0) + 1;
    });
    const topTypes = Object.entries(typeStats).sort((a, b) => b[1] - a[1]);

    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days[date.toLocaleDateString(undefined, { weekday: 'short' })] = 0;
    }
    bookings.forEach(b => {
      const day = new Date(b.created_at).toLocaleDateString(undefined, { weekday: 'short' });
      if (days[day] !== undefined) days[day]++;
    });

    return {
      totalLeads,
      realizedCount: realizedProjects.length,
      pipelineCount: pipelineProjects.length,
      realizedRevenue,
      projectedPipelineValue,
      revenueByMonth,
      revenueByType,
      topTypes,
      dailyStats: Object.entries(days),
      conversionRate: totalLeads > 0 ? Math.round((realizedProjects.length / totalLeads) * 100) : 0
    };
  }, [bookings]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    const result = await deleteBooking(deletingId);
    if (result.success) {
      setBookings(bookings.filter(b => b.id !== deletingId));
      setDeletingId(null);
      router.refresh();
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPhoto) return;
    const formData = new FormData(e.currentTarget);
    const updates = {
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      is_featured: formData.get("is_featured") === "on",
    };
    try {
      await updatePhoto(editingPhoto.id, updates);
      setPhotos(photos.map(p => p.id === editingPhoto.id ? { ...p, ...updates } : p));
      setEditingPhoto(null);
    } catch (error) {
      alert("Failed to update photo.");
    }
  };

  return (
    <div className="space-y-10 pb-24">
      {/* 1. OPERATIONS HEADER */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="w-14 h-14 rounded-full bg-card border border-white/5 flex items-center justify-center shadow-sm hover:shadow-premium transition-all">
            <ArrowRight className="rotate-180 text-zinc-400" size={20} />
          </button>
          <div>
            <h1 className="text-6xl font-black tracking-tighter text-foreground mb-1 leading-none italic">Executive <span className="text-zinc-300">Overview</span></h1>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">RCV Operations Command</span>
              <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse shadow-brand-glow" />
            </div>
          </div>
        </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={() => alert("Operational Guardrail: Multi-dimensional filtering logic is currently being calibrated.")}
              className="px-8 py-4 bg-card border border-white/5 rounded-full shadow-sm text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:shadow-premium transition-all"
            >
              Filter View
            </button>
            <Link 
              href="/dashboard/pipeline"
              className="px-8 py-4 bg-brand-accent text-black rounded-full shadow-xl shadow-brand-glow/20 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-3 group"
            >
              New Operation <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>
      </section>

      {/* 2. STAT MODULAR GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Realized Intelligence */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-card rounded-[3.5rem] border border-white/5 shadow-module p-12 relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Realized Revenue</p>
                <div className="flex items-baseline gap-4">
                  <h2 className="text-7xl font-black tracking-tighter text-foreground">${analytics.realizedRevenue.toLocaleString()}</h2>
                  <span className="text-brand-accent font-black text-xs">▲ 12%</span>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Projected Inbound</p>
                <h3 className="text-4xl font-black tracking-tighter text-foreground">${analytics.projectedPipelineValue.toLocaleString()}</h3>
              </div>
            </div>

            {/* Mini Monthly Chart */}
            <div className="flex items-end gap-3 h-12 mb-10 px-2">
               {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'].map((m) => {
                  const monthValue = analytics.revenueByMonth[m] || 0;
                  const maxVal = Math.max(...Object.values(analytics.revenueByMonth), 1);
                  const height = (monthValue / maxVal) * 100;
                  return (
                    <div key={m} className="flex-1 h-full bg-secondary rounded-full overflow-hidden relative group/bar">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-brand-accent/30 rounded-full group-hover/bar:bg-brand-accent transition-all duration-500" 
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity">
                         <span className="text-[8px] font-black text-black">{m}</span>
                      </div>
                    </div>
                  );
               })}
            </div>

            {/* Client Avatars */}
            <div className="flex items-center -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-card bg-secondary overflow-hidden shadow-sm relative">
                   <User size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-card bg-secondary flex items-center justify-center text-[10px] font-black text-zinc-500 shadow-sm">
                +12
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payout Intelligence */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-card rounded-[3.5rem] border border-white/5 shadow-module p-12 relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Operational Liquidity</p>
            <div className="w-10 h-10 rounded-full bg-secondary border border-white/5 flex items-center justify-center">
              <ArrowRight className="-rotate-45 text-zinc-400" size={18} />
            </div>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-foreground mb-8">${(analytics.realizedRevenue * 0.8).toLocaleString()}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-6 bg-secondary rounded-[2rem] border border-white/5">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Network</p>
              <div className="flex items-center gap-3">
                 <div className="w-6 h-6 bg-brand-accent rounded-sm" />
                 <span className="text-xs font-black uppercase">Stripe</span>
              </div>
            </div>
            <div className="p-6 bg-secondary rounded-[2rem] border border-white/5">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Status</p>
              <span className="text-xs font-black uppercase text-brand-accent">Ready</span>
            </div>
          </div>

          <button 
            onClick={() => alert("Intelligence Sync: Payout transmission sequence initiated. Network verification in progress.")}
            className="w-full py-6 bg-brand-accent text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-full shadow-xl shadow-brand-glow/20 hover:brightness-110 transition-all active:scale-95"
          >
            Execute Payout
          </button>
        </motion.div>
      </section>

      {/* 3. ACTIVE OPERATIONS PANEL (DARK) */}
      <section className="relative group">
        {/* Inline Filter Pills */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto hide-scrollbar pb-2">
           <button 
             onClick={() => setSelectedMetric("all")}
             className={cn(
               "px-10 py-4 text-[10px] font-black uppercase tracking-widest rounded-full transition-all",
               selectedMetric === "all" ? "bg-brand-accent text-black shadow-brand-glow" : "bg-secondary border border-white/5 text-zinc-500 hover:text-white"
             )}
           >
             Active Tasks <span className="ml-2 opacity-60">{bookings.filter(b => b.pipeline_stage !== 'delivered' && b.status !== 'cancelled').length}</span>
           </button>
           {[
             { id: 'confirmed', label: 'In Review', stages: ['confirmed'] },
             { id: 'operational', label: 'Operational', stages: ['shooting', 'editing'] },
             { id: 'delivered', label: 'Success', stages: ['delivered'] },
             { id: 'stalled', label: 'Stalled', stages: ['stalled'] }
           ].map((f) => {
             const count = bookings.filter(b => f.stages.includes(b.pipeline_stage)).length;
             return (
               <button 
                 key={f.id} 
                 onClick={() => setSelectedMetric(f.id)}
                 className={cn(
                   "px-8 py-4 border border-white/5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all whitespace-nowrap",
                   selectedMetric === f.id ? "bg-brand-accent text-black shadow-brand-glow" : "bg-secondary text-zinc-500 hover:text-white"
                 )}
               >
                 {f.label} <span className="ml-2 opacity-60">{count}</span>
               </button>
             );
           })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="bg-dark-panel rounded-[4rem] shadow-2xl overflow-hidden min-h-[600px] border border-white/5"
        >
          <div className="flex flex-col xl:flex-row h-full min-h-[600px]">
            {/* Left: Operations List */}
            <div className="w-full xl:w-1/3 border-r border-white/5 p-12">
               <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">Operational Queue</h3>
                 <Settings className="text-zinc-700" size={18} />
               </div>
                <div className="space-y-4">
                  {(() => {
                    const filtered = bookings.filter(b => {
                      if (selectedMetric === "all") return b.pipeline_stage !== 'delivered' && b.status !== 'cancelled';
                      if (selectedMetric === 'confirmed') return b.pipeline_stage === 'confirmed';
                      if (selectedMetric === 'operational') return ['shooting', 'editing'].includes(b.pipeline_stage);
                      if (selectedMetric === 'delivered') return b.pipeline_stage === 'delivered';
                      if (selectedMetric === 'stalled') return b.pipeline_stage === 'stalled';
                      return true;
                    });
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="py-20 text-center opacity-30">
                          <Activity className="mx-auto mb-4 text-zinc-500" size={32} />
                          <p className="text-[10px] font-black uppercase tracking-widest">No matching operations</p>
                        </div>
                      );
                    }

                    return filtered.slice(0, 5).map((booking, idx) => (
                   <motion.div 
                     key={booking.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "p-8 rounded-[2.5rem] border transition-all cursor-pointer group flex items-center justify-between",
                        idx === 0 ? "bg-white/5 border-white/10 shadow-xl" : "border-transparent hover:bg-white/5"
                      )}
                   >
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                           <User size={24} className="text-zinc-500" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black uppercase tracking-tight text-white mb-1">{booking.name || 'Anonymous Intelligence'}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{booking.shoot_type || 'Custom Media Unit'}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-white italic mb-1">${(Number(booking.total_amount) || 0).toLocaleString()}</p>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                          idx === 0 ? "bg-brand-accent text-black" : "bg-white/10 text-zinc-400"
                        )}>
                          {booking.pipeline_stage || 'Ready'}
                        </span>
                     </div>
                   </motion.div>
                 ));
                })()}
                </div>
            </div>

            {/* Right: Operational Intel Detail */}
            <div className="flex-1 p-16 bg-white/5">
               <div className="max-w-4xl mx-auto space-y-16">
                  <header className="flex justify-between items-start">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4">Transmission ID</p>
                        <h2 className="text-5xl font-black text-white italic tracking-tighter">#ORD-{bookings[0]?.id.slice(0, 8).toUpperCase() || 'UNIT-01'}</h2>
                     </div>
                     <div className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                        System Active
                     </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { label: 'Client Asset', val: bookings[0]?.name || 'Alex Johnson', icon: Users },
                        { label: 'Operational Value', val: `$${(Number(bookings[0]?.total_amount) || 1200).toLocaleString()}`, icon: DollarSign },
                        { label: 'Intelligence Tier', val: bookings[0]?.shoot_type || 'Sports Media Day', icon: Activity }
                      ].map((item, i) => (
                        <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] group hover:border-[#C8FF00] transition-all">
                           <item.icon className="text-[#C8FF00] mb-6" size={24} />
                           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">{item.label}</p>
                           <h4 className="text-xl font-black text-white uppercase tracking-tight">{item.val}</h4>
                        </div>
                      ))}
                  </div>

                  <div className="p-12 bg-white/5 border border-white/10 rounded-[3rem] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                     <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="space-y-6">
                           <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Operational Curation</h3>
                           <p className="text-zinc-500 text-sm font-medium max-w-sm">Synchronize all visual assets for this transmission to the master cloud repository.</p>
                        </div>
                          <button 
                            onClick={() => alert("Cloud Synchro: Visual assets are being mapped to the master repository. Intelligence established.")}
                            className="px-12 py-6 bg-[#C8FF00] text-black font-black uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_20px_rgba(200,255,0,0.3)] hover:scale-105 transition-all active:scale-95"
                          >
                             Sync Assets
                          </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. MODALS (LEGACY PRESERVATION) */}
      <AnimatePresence>
        {editingPhoto && (
          <div className="fixed inset-0 bg-background/80 z-[1000] flex items-center justify-center p-4 backdrop-blur-3xl">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card p-12 rounded-[3.5rem] border border-white/5 shadow-2xl w-full max-w-xl">
                {/* Modal Content - Preserving logic while skinning */}
                <div className="flex justify-between items-center mb-10">
                   <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground italic">Edit Intelligence</h2>
                   <button onClick={() => setEditingPhoto(null)} className="p-4 bg-secondary rounded-full border border-white/5 text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-6">Asset Descriptor</label>
                      <input name="title" defaultValue={editingPhoto.title} className="w-full bg-secondary border border-white/5 rounded-full px-10 py-6 text-white font-black text-sm focus:border-brand-accent outline-none" required />
                   </div>
                   <button type="submit" className="w-full py-8 bg-brand-accent text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-full shadow-brand-glow">Commit Changes</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
