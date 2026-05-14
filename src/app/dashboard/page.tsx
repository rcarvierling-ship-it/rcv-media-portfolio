"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { deletePhoto, updatePhoto } from "@/app/actions/photos";
import { deleteBooking } from "@/app/actions/booking";
import { 
  DollarSign, Users, Target, ArrowRight, TrendingUp, X, 
  BarChart3, Activity, Calendar, ChevronRight, Info, Trash2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  
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
    const confirmed = bookings.filter(b => b.status === "confirmed");
    const pending = bookings.filter(b => b.status === "pending");
    
    let totalRevenue = 0;
    const revenueByMonth: Record<string, number> = {};
    const revenueByType: Record<string, number> = {};

    confirmed.forEach(b => {
      const pkg = packages.find(p => p.name === b.package_selected);
      if (pkg) {
        const priceNum = parseInt(pkg.price.replace(/[^0-9]/g, "")) || 0;
        totalRevenue += priceNum;
        const month = new Date(b.created_at).toLocaleString('default', { month: 'short' });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + priceNum;
        revenueByType[b.shoot_type] = (revenueByType[b.shoot_type] || 0) + priceNum;
      }
    });

    const typeStats: Record<string, number> = {};
    bookings.forEach(b => {
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
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      totalRevenue,
      revenueByMonth,
      revenueByType,
      topTypes,
      dailyStats: Object.entries(days),
      conversionRate: totalLeads > 0 ? Math.round((confirmed.length / totalLeads) * 100) : 0
    };
  }, [bookings, packages]);

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const result = await deleteBooking(id);
    if (result.success) {
      setBookings(bookings.filter(b => b.id !== id));
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
    <div className="space-y-12 pb-24">
      {/* 1. EXECUTIVE OVERVIEW HEADER */}
      <section>
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Executive Overview</h1>
            <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Real-time business performance & deep analytics</p>
          </div>
          <div className="text-right hidden md:block">
             <div className="flex items-center gap-2 text-blue-500">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest">Live Sync Active</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div whileHover={{ scale: 1.02 }} onClick={() => setSelectedMetric("revenue")} className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative group cursor-pointer overflow-hidden">
            <div className="absolute -right-4 -top-4 text-white opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={100} /></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Confirmed Revenue</span>
              <Info size={12} className="text-zinc-700" />
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-4xl font-black tracking-tighter text-white">${analytics.totalRevenue.toLocaleString()}</h3>
              <TrendingUp size={20} className="text-emerald-500 mb-2" />
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} onClick={() => setSelectedMetric("momentum")} className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Weekly Momentum</span>
              <Activity size={12} className="text-zinc-700" />
            </div>
            <div className="flex items-center gap-3">
              <h3 className="text-4xl font-black tracking-tighter text-white">+{analytics.dailyStats.reduce((acc, curr) => acc + curr[1], 0)}</h3>
              <span className="text-[10px] font-black uppercase text-emerald-500">New Leads</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} onClick={() => setSelectedMetric("conversion")} className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Booking Rate</span>
              <Target size={12} className="text-zinc-700" />
            </div>
            <h3 className="text-4xl font-black tracking-tighter text-white">{analytics.conversionRate}%</h3>
            <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${analytics.conversionRate}%` }} className="h-full bg-blue-600" />
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} onClick={() => setSelectedMetric("segments")} className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Top Segments</span>
              <BarChart3 size={12} className="text-zinc-700" />
            </div>
            <h3 className="text-4xl font-black tracking-tighter text-white">{analytics.topTypes[0]?.[0] || '---'}</h3>
          </motion.div>
        </div>
      </section>

      {/* 2. ANALYTICS MODAL (DEEP DIVE) */}
      <AnimatePresence>
        {selectedMetric && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-12 backdrop-blur-2xl bg-black/60"
            onClick={() => setSelectedMetric(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-white/10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[800px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full md:w-80 bg-zinc-900/50 p-10 border-r border-white/5 flex flex-col justify-between">
                <div>
                  <button onClick={() => setSelectedMetric(null)} className="mb-12 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 uppercase text-[10px] font-black tracking-widest"><X size={14} /> Close View</button>
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">
                    {selectedMetric === "revenue" ? "Revenue" : selectedMetric === "momentum" ? "Leads" : selectedMetric === "conversion" ? "Sales" : "Segments"}
                  </h2>
                </div>
                <div className="p-6 bg-black rounded-2xl border border-white/5">
                  <span className="text-2xl font-black text-white">
                    {selectedMetric === "revenue" ? `$${analytics.totalRevenue.toLocaleString()}` : selectedMetric === "momentum" ? `${analytics.totalLeads} Total` : selectedMetric === "conversion" ? `${analytics.conversionRate}%` : analytics.topTypes[0]?.[0]}
                  </span>
                </div>
              </div>
              <div className="flex-1 p-12 bg-black relative flex flex-col justify-center">
                 {selectedMetric === "revenue" && (
                   <div className="h-64 flex items-end gap-4 w-full">
                      {Object.entries(analytics.revenueByMonth).map(([month, amount]) => (
                        <div key={month} className="flex-1 flex flex-col items-center gap-4 group">
                           <div className="relative w-full flex flex-col justify-end h-full">
                              <motion.div initial={{ height: 0 }} animate={{ height: `${(amount / analytics.totalRevenue) * 100}%` }} className="w-full bg-blue-600 rounded-t-sm group-hover:bg-blue-500 transition-colors" />
                           </div>
                           <span className="text-[10px] font-black uppercase text-zinc-500">{month}</span>
                        </div>
                      ))}
                   </div>
                 )}
                 {selectedMetric === "momentum" && (
                   <div className="h-64 flex items-end gap-4 w-full">
                      {analytics.dailyStats.map(([day, count]) => (
                        <div key={day} className="flex-1 flex flex-col items-center gap-4 group">
                           <div className="relative w-full flex flex-col justify-end h-full">
                              <motion.div initial={{ height: 0 }} animate={{ height: count > 0 ? `${(count / 10) * 100}%` : '4px' }} className={`w-full ${count > 0 ? 'bg-emerald-500' : 'bg-zinc-900'} rounded-t-sm`} />
                           </div>
                           <span className="text-[10px] font-black uppercase text-zinc-500">{day}</span>
                        </div>
                      ))}
                   </div>
                 )}
                 {selectedMetric === "conversion" && (
                   <div className="space-y-12 w-full max-w-md mx-auto">
                      <div className="space-y-4">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white"><span>Total Inquiries</span><span>{analytics.totalLeads}</span></div>
                         <div className="h-4 bg-zinc-900 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-zinc-700" /></div>
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-500"><span>Confirmed Bookings</span><span>{analytics.confirmedCount}</span></div>
                         <div className="h-4 bg-zinc-900 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${analytics.conversionRate}%` }} className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" /></div>
                      </div>
                   </div>
                 )}
                 {selectedMetric === "segments" && (
                    <div className="space-y-8 w-full max-w-md mx-auto">
                       {analytics.topTypes.map(([type, count]) => (
                         <div key={type} className="group flex items-center justify-between p-6 bg-zinc-900/40 border border-white/5 rounded-2xl hover:border-blue-500/50 transition-all">
                            <div>
                               <h4 className="text-lg font-black uppercase tracking-tighter text-white">{type}</h4>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{count} Active Leads</p>
                            </div>
                            <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{Math.round((count / analytics.totalLeads) * 100)}% Share</span>
                         </div>
                       ))}
                    </div>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MEDIA & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/5 pt-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Media Library</h2>
            <Link href="/dashboard/upload" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">Upload New &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.slice(0, 9).map((photo) => (
              <div key={photo.id} className="group relative aspect-square bg-zinc-900 overflow-hidden border border-white/5 rounded-sm">
                <Image src={photo.image_url} alt={photo.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                  <button onClick={() => setEditingPhoto(photo)} className="text-[10px] font-black uppercase tracking-widest text-white border border-white/20 px-4 py-2 hover:bg-white hover:text-black">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Recent Requests</h2>
          <div className="space-y-4">
            {bookings.slice(0, 6).map((booking) => (
              <div key={booking.id} className="p-6 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-500' : 'bg-zinc-700 animate-pulse'}`} />
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">{booking.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{booking.shoot_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    {new Date(booking.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="p-2 text-zinc-700 hover:text-red-500 transition-colors relative z-10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingPhoto && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-zinc-950 border border-white/10 p-10 w-full max-w-md rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Edit Photo</h2>
              <button onClick={() => setEditingPhoto(null)} className="text-zinc-500 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Title</label>
                <input name="title" defaultValue={editingPhoto.title} className="w-full bg-zinc-900 border border-white/5 focus:border-blue-500/50 px-6 py-4 text-white outline-none rounded-sm" required />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" name="is_featured" id="edit_featured" defaultChecked={editingPhoto.is_featured} className="w-5 h-5 accent-blue-600" />
                <label htmlFor="edit_featured" className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Feature on Homepage</label>
              </div>
              <button type="submit" className="w-full bg-white text-black font-black uppercase py-4 rounded-sm hover:bg-zinc-200 transition-colors">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
