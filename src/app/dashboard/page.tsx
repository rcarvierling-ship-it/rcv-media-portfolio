"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { deletePhoto, updatePhoto } from "@/app/actions/photos";
import { deleteBooking, sendGalleryEmail } from "@/app/actions/booking";
import { 
  DollarSign, Users, Target, ArrowRight, TrendingUp, X, 
  BarChart3, Activity, Calendar, ChevronRight, Info, Trash2,
  AlertTriangle, User, Settings, Camera, Mail, Scissors, Zap,
  MapPin, Clock, ShieldCheck, Copy, Loader2, Plus
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
  email: string;
  phone: string;
  package_selected: string;
  shoot_type: string;
  status: string;
  pipeline_stage: string;
  total_amount: number;
  created_at: string;
  event_date: string;
  linked_album_id?: string | null;
};

type Package = {
  name: string;
  price: string;
};

export default function DashboardPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [
        { data: photosData }, 
        { data: bookingsData },
        { data: pkgData },
        { data: albumsData }
      ] = await Promise.all([
        supabase.from("photos").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("pricing_packages").select("name, price"),
        supabase.from("albums").select("*").order("created_at", { ascending: false })
      ]);

      if (photosData) setPhotos(photosData);
      if (bookingsData) {
        setBookings(bookingsData);
        if (bookingsData.length > 0) {
          setSelectedBooking(bookingsData[0]);
        }
      }
      if (pkgData) setPackages(pkgData);
      if (albumsData) setAlbums(albumsData);
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
      if (selectedBooking?.id === deletingId) {
        const remaining = bookings.filter(b => b.id !== deletingId);
        setSelectedBooking(remaining.length > 0 ? remaining[0] : null);
      }
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
            <h1 className="text-6xl font-black tracking-tighter text-foreground mb-1 leading-none italic">Dashboard <span className="text-zinc-300">Overview</span></h1>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">RCV.Media Dashboard</span>
              <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse shadow-brand-glow" />
            </div>
          </div>
        </div>
         <div className="flex items-center gap-3">
             <Link 
               href="/dashboard/bookings"
               className="px-8 py-4 bg-brand-accent text-black rounded-full shadow-xl shadow-brand-glow/20 text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-3 group"
             >
               New Booking <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </Link>
         </div>
      </section>

      {/* 2. STAT MODULAR GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Revenue Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-card rounded-[3.5rem] border border-white/5 shadow-module p-12 relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Completed Revenue</p>
                <div className="flex items-baseline gap-4">
                  <h2 className="text-7xl font-black tracking-tighter text-foreground">${analytics.realizedRevenue.toLocaleString()}</h2>
                  <span className="text-brand-accent font-black text-xs">▲ 12%</span>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Pending Revenue</p>
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

            {/* Dynamic Client Avatars */}
            {bookings.length > 0 ? (
              <div className="flex items-center -space-x-3">
                 {bookings.slice(0, 5).map((booking, idx) => {
                    const initials = booking.name
                      ? booking.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      : "??";
                    
                    const colors = [
                      "bg-zinc-800 text-brand-accent border-card",
                      "bg-zinc-900 text-zinc-400 border-card",
                      "bg-secondary text-white border-card",
                      "bg-zinc-800 text-zinc-300 border-card",
                      "bg-secondary text-brand-accent border-card"
                    ];
                    const colorClass = colors[idx % colors.length];

                    return (
                      <div 
                        key={booking.id} 
                        className={cn(
                          "w-12 h-12 rounded-full border-4 flex items-center justify-center text-[10px] font-black tracking-wider shadow-premium select-none uppercase relative",
                          colorClass
                        )}
                        title={booking.name}
                      >
                         {initials}
                      </div>
                    );
                 })}
                 {bookings.length > 5 && (
                   <div className="w-12 h-12 rounded-full border-4 border-card bg-secondary flex items-center justify-center text-[10px] font-black text-zinc-400 shadow-premium">
                     +{bookings.length - 5}
                   </div>
                 )}
              </div>
            ) : (
              <div className="mt-4 p-6 bg-zinc-950/20 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <User size={14} className="text-brand-accent animate-pulse" /> Empty Client Roster
                </div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                  Your active bookings database is currently empty. Initialize client workflows or wait for new leads to enter.
                </p>
                <Link 
                  href="/dashboard/bookings" 
                  className="w-fit px-4 py-2 bg-brand-accent hover:brightness-110 text-black font-black uppercase text-[8px] tracking-widest rounded-full transition-all text-center flex items-center justify-center gap-1.5 shadow-brand-glow"
                >
                  <Plus size={10} /> Create Booking
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-card rounded-[3.5rem] border border-white/5 shadow-module p-12 relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Quick Actions</p>
              <Link 
                href="/dashboard/site"
                className="w-10 h-10 rounded-full bg-secondary hover:bg-white/5 border border-white/5 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title="Site Editor"
              >
                <Settings className="text-zinc-400" size={18} />
              </Link>
            </div>
            <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-8 italic">Manage <span className="text-zinc-300">Site</span></h3>
          </div>
          
          <div className="space-y-4">
             <Link 
               href="/dashboard/media" 
               className="w-full py-5 bg-secondary hover:bg-white/5 text-white border border-white/5 font-black uppercase text-[10px] tracking-widest rounded-full transition-all flex items-center justify-center gap-3"
             >
                <Camera size={14} className="text-brand-accent" /> Upload Photos
             </Link>
             <Link 
               href="/dashboard/bookings" 
               className="w-full py-5 bg-secondary hover:bg-white/5 text-white border border-white/5 font-black uppercase text-[10px] tracking-widest rounded-full transition-all flex items-center justify-center gap-3"
             >
                <Calendar size={14} className="text-brand-accent" /> Bookings Pipeline
             </Link>
             <Link 
               href="/dashboard/pricing" 
               className="w-full py-5 bg-secondary hover:bg-white/5 text-white border border-white/5 font-black uppercase text-[10px] tracking-widest rounded-full transition-all flex items-center justify-center gap-3"
             >
                <DollarSign className="text-brand-accent" size={14} /> Packages & Pricing
             </Link>
             <Link 
               href="/dashboard/site" 
               className="w-full py-5 bg-brand-accent text-black font-black uppercase text-[10px] tracking-widest rounded-full hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-brand-glow"
             >
                <Settings size={14} /> Site Editor
             </Link>
          </div>
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
              Active Bookings <span className="ml-2 opacity-60">{bookings.filter(b => b.pipeline_stage !== 'delivered' && b.status !== 'cancelled').length}</span>
           </button>
           {[
              { id: 'confirmed', label: 'Confirmed', stages: ['confirmed'] },
              { id: 'operational', label: 'Shooting/Editing', stages: ['shooting', 'editing'] },
              { id: 'delivered', label: 'Completed', stages: ['delivered'] },
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
                 <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">Bookings Queue</h3>
                  <Link 
                    href="/dashboard/bookings"
                    className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                    title="Configure Bookings & Pipeline"
                  >
                    <Settings size={18} />
                  </Link>
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
                           <p className="text-[10px] font-black uppercase tracking-widest">No matching bookings</p>
                         </div>
                       );
                     }

                     return filtered.slice(0, 5).map((booking, idx) => {
                       const isActive = selectedBooking ? selectedBooking.id === booking.id : idx === 0;
                       return (
                         <motion.div 
                           key={booking.id}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           onClick={() => setSelectedBooking(booking)}
                           className={cn(
                             "p-8 rounded-[2.5rem] border transition-all cursor-pointer group flex items-center justify-between",
                             isActive ? "bg-white/5 border-white/10 shadow-xl" : "border-transparent hover:bg-white/5"
                           )}
                         >
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                 <User size={24} className="text-zinc-500" />
                              </div>
                              <div>
                                  <h4 className="text-lg font-black uppercase tracking-tight text-white mb-1">{booking.name || 'Guest Client'}</h4>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{booking.shoot_type || 'Custom Package'}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-black text-white italic mb-1">${(Number(booking.total_amount) || 0).toLocaleString()}</p>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                isActive ? "bg-brand-accent text-black" : "bg-white/10 text-zinc-400"
                              )}>
                                {booking.pipeline_stage || 'Ready'}
                              </span>
                           </div>
                         </motion.div>
                       );
                     });
                   })()}
                 </div>
            </div>

            {/* Right: Booking Details */}
            <div className="flex-1 p-16 bg-white/5">
               {selectedBooking ? (
                 <div className="max-w-4xl mx-auto space-y-16">
                    <header className="flex justify-between items-start">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4">Booking ID</p>
                          <h2 className="text-5xl font-black text-white italic tracking-tighter">#BK-{selectedBooking.id.slice(0, 8).toUpperCase()}</h2>
                       </div>
                       <div className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                          {selectedBooking.pipeline_stage === 'delivered' ? 'Completed' : 'Active'}
                       </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Client Name Card */}
                        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] group hover:border-brand-accent transition-all">
                           <Users className="text-brand-accent mb-6" size={24} />
                           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Client Name</p>
                           <h4 className="text-xl font-black text-white uppercase tracking-tight truncate">{selectedBooking.name}</h4>
                        </div>

                        {/* Booking Total Card (EDITABLE) */}
                        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] group hover:border-brand-accent/50 focus-within:border-brand-accent transition-all relative overflow-hidden">
                           <DollarSign className="text-brand-accent mb-6 animate-pulse" size={24} />
                           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Booking Total (Edit Live)</p>
                           <div className="flex items-center gap-1">
                              <span className="text-xl font-black text-white">$</span>
                              <input 
                                 type="number" 
                                 value={selectedBooking.total_amount === undefined || selectedBooking.total_amount === null ? "" : selectedBooking.total_amount} 
                                 onChange={async (e) => {
                                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                    if (isNaN(val)) return;
                                    // Update local state
                                    setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, total_amount: val } : b));
                                    setSelectedBooking(prev => prev ? { ...prev, total_amount: val } : null);
                                    // Save to supabase
                                    await supabase.from("bookings").update({ total_amount: val }).eq("id", selectedBooking.id);
                                 }}
                                 className="bg-transparent font-black text-white text-xl outline-none w-full border-b border-transparent focus:border-brand-accent/30 py-0.5"
                                 placeholder="0"
                              />
                           </div>
                        </div>

                        {/* Shoot Type Card */}
                        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] group hover:border-brand-accent transition-all">
                           <Activity className="text-brand-accent mb-6" size={24} />
                           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Shoot Type</p>
                           <h4 className="text-xl font-black text-white uppercase tracking-tight truncate">{selectedBooking.shoot_type}</h4>
                        </div>
                     </div>

                     <div className="p-12 bg-white/5 border border-white/10 rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                        <div className="relative z-10 w-full space-y-8">
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
                              <div>
                                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Client Album & Delivery</h3>
                                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Pick and send high-fidelity client galleries directly.</p>
                              </div>
                              <Link 
                                href="/dashboard/media"
                                className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-full transition-all flex items-center justify-center gap-2"
                              >
                                 <Camera size={12} className="text-brand-accent" />
                                 Upload Photos
                              </Link>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Pick Album Column */}
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Link Gallery Album</label>
                                 <select 
                                    value={selectedBooking.linked_album_id || ""}
                                    onChange={async (e) => {
                                       const val = e.target.value === "" ? null : e.target.value;
                                       // Update state
                                       setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, linked_album_id: val } : b));
                                       setSelectedBooking(prev => prev ? { ...prev, linked_album_id: val } : null);
                                       // Update Supabase
                                       await supabase.from("bookings").update({ linked_album_id: val }).eq("id", selectedBooking.id);
                                    }}
                                    className="w-full bg-secondary border border-white/5 px-6 py-4 text-white text-xs font-black uppercase tracking-widest rounded-full outline-none focus:border-brand-accent transition-all appearance-none"
                                 >
                                    <option value="">-- Select Client Album --</option>
                                    {albums.map(a => (
                                       <option key={a.id} value={a.id}>{a.title} ({a.is_public ? 'Public' : 'Private'})</option>
                                    ))}
                                 </select>
                              </div>

                              {/* Send Gallery Column */}
                              <div className="flex flex-col justify-end">
                                 {selectedBooking.linked_album_id ? (() => {
                                    const album = albums.find(a => a.id === selectedBooking.linked_album_id);
                                    if (!album) return null;
                                    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rcv.media';
                                    const galleryUrl = album.is_public ? `${origin}/albums/${album.slug}` : `${origin}/gallery/${album.slug}`;
                                    
                                    const handleSendEmail = async () => {
                                       setIsSendingEmail(true);
                                       try {
                                          const res = await sendGalleryEmail(
                                             selectedBooking.id,
                                             album.id,
                                             galleryUrl,
                                             album.is_public ? undefined : album.passcode
                                          );
                                          if (res?.success) {
                                             alert(`Success! High-fidelity gallery delivered directly to ${selectedBooking.email || 'client'}.`);
                                          } else {
                                             alert(`Delivery failed: ${res?.error || 'Unknown error'}`);
                                          }
                                       } catch (err: any) {
                                          alert(`Delivery error: ${err.message || 'Unknown network error'}`);
                                       } finally {
                                          setIsSendingEmail(false);
                                       }
                                    };

                                    return (
                                       <div className="flex items-center gap-4 w-full">
                                          <button 
                                             onClick={handleSendEmail}
                                             disabled={isSendingEmail}
                                             className="flex-1 py-4 bg-brand-accent hover:brightness-110 text-black font-black uppercase tracking-widest text-[10px] rounded-full shadow-brand-glow hover:scale-105 transition-all text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                             {isSendingEmail ? (
                                                <>
                                                   <Loader2 size={14} className="animate-spin" />
                                                   Delivering...
                                                </>
                                             ) : (
                                                <>
                                                   <Mail size={14} />
                                                   Send Gallery Email
                                                </>
                                             )}
                                          </button>
                                          <button 
                                             onClick={() => {
                                                navigator.clipboard.writeText(galleryUrl);
                                                alert("Gallery link copied to clipboard!");
                                             }}
                                             className="px-6 py-4 bg-zinc-900 border border-white/5 hover:border-white/10 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] rounded-full transition-all flex items-center gap-2"
                                             title="Copy Link"
                                          >
                                             <Copy size={14} className="text-brand-accent" />
                                             Copy Link
                                          </button>
                                       </div>
                                    );
                                 })() : (
                                    <div className="h-full flex items-center text-zinc-600 text-[10px] font-black uppercase tracking-widest italic pt-4 md:pt-0">
                                       Link an album to unlock instant delivery options.
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                 </div>
                ) : (
                  <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center text-center py-24 bg-zinc-950/20 rounded-[2.5rem] border border-dashed border-white/5 p-12">
                     <Users className="text-brand-accent mb-6 animate-pulse" size={48} />
                     <h3 className="text-xl font-black uppercase tracking-widest text-white">No Bookings Selected</h3>
                     <p className="text-xs text-zinc-500 mt-2 max-w-md mx-auto leading-relaxed">
                        This indicates that there are no active bookings in your database, or you haven't clicked a client in the roster stack above to pull up operational details.
                     </p>
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-4">
                        Action required: Select a booking from the roster or initialize a new client booking.
                      </p>
                      <Link 
                        href="/dashboard/bookings" 
                        className="mt-6 px-8 py-4 bg-brand-accent text-black font-black uppercase text-[10px] tracking-widest rounded-full hover:brightness-110 transition-all shadow-brand-glow flex items-center gap-2"
                      >
                        <Plus size={14} /> Go to Bookings & Pipeline
                      </Link>
                  </div>
                )}
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
                   <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground italic">Edit Photo Details</h2>
                   <button onClick={() => setEditingPhoto(null)} className="p-4 bg-secondary rounded-full border border-white/5 text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-6">Photo Title</label>
                      <input name="title" defaultValue={editingPhoto.title} className="w-full bg-secondary border border-white/5 rounded-full px-10 py-6 text-white font-black text-sm focus:border-brand-accent outline-none" required />
                   </div>
                   <button type="submit" className="w-full py-8 bg-brand-accent text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-full shadow-brand-glow">Save Changes</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
