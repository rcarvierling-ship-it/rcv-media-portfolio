"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { deletePhoto, updatePhoto } from "@/app/actions/photos";
import { DollarSign, Users, Target, ArrowRight, TrendingUp, X, BarChart3, PieChart, Activity } from "lucide-react";
import { motion } from "framer-motion";

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
  const supabase = createClient();

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
    
    // 1. Revenue
    let totalRevenue = 0;
    confirmed.forEach(b => {
      const pkg = packages.find(p => p.name === b.package_selected);
      if (pkg) {
        const priceNum = parseInt(pkg.price.replace(/[^0-9]/g, "")) || 0;
        totalRevenue += priceNum;
      }
    });

    // 2. Performance by Type
    const typeStats: Record<string, number> = {};
    bookings.forEach(b => {
      typeStats[b.shoot_type] = (typeStats[b.shoot_type] || 0) + 1;
    });
    const topTypes = Object.entries(typeStats).sort((a, b) => b[1] - a[1]).slice(0, 3);

    // 3. Lead Velocity (Last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentLeads = bookings.filter(b => new Date(b.created_at) > weekAgo).length;

    return {
      totalLeads,
      confirmedCount: confirmed.length,
      totalRevenue,
      topTypes,
      recentLeads,
      conversionRate: totalLeads > 0 ? Math.round((confirmed.length / totalLeads) * 100) : 0
    };
  }, [bookings, packages]);

  const handleDelete = async (id: string, publicId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deletePhoto(id, publicId);
      setPhotos(photos.filter(p => p.id !== id));
    } catch (error) {
      alert("Failed to delete photo.");
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
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1">Last Updated</span>
             <span className="text-xs font-black uppercase tracking-widest text-white">Just Now</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Revenue Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative group overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 text-white opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign size={100} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">Confirmed Revenue</span>
            <div className="flex items-end gap-2">
              <h3 className="text-4xl font-black tracking-tighter text-white">${analytics.totalRevenue.toLocaleString()}</h3>
              <TrendingUp size={20} className="text-emerald-500 mb-2" />
            </div>
          </motion.div>

          {/* Lead Velocity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">7-Day Momentum</span>
            <div className="flex items-center gap-3">
              <h3 className="text-4xl font-black tracking-tighter text-white">+{analytics.recentLeads}</h3>
              <span className="text-[10px] font-black uppercase text-emerald-500">New Leads</span>
            </div>
          </motion.div>

          {/* Conversion Rate */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">Booking Rate</span>
            <h3 className="text-4xl font-black tracking-tighter text-white">{analytics.conversionRate}%</h3>
            <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${analytics.conversionRate}%` }} />
            </div>
          </motion.div>

          {/* Total Pipeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative group"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">Total Pipeline</span>
            <h3 className="text-4xl font-black tracking-tighter text-white">{analytics.totalLeads}</h3>
            <p className="text-[10px] text-zinc-500 mt-4 font-bold uppercase tracking-widest">{analytics.confirmedCount} Bookings Confirmed</p>
          </motion.div>
        </div>

        {/* 2. DEEP ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
           <div className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/30 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-8">
                 <BarChart3 className="text-blue-500" size={18} />
                 <h3 className="text-sm font-black uppercase tracking-widest text-white">Top Performance Segments</h3>
              </div>
              <div className="space-y-6">
                 {analytics.topTypes.map(([type, count]) => (
                   <div key={type} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-white">{type}</span>
                         <span className="text-zinc-500">{count} Inquiries</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: `${(count / analytics.totalLeads) * 100}%` }}
                           className="h-full bg-blue-600" 
                         />
                      </div>
                   </div>
                 ))}
                 {analytics.topTypes.length === 0 && <p className="text-[10px] text-zinc-600 font-bold uppercase py-4">Waiting for data segments...</p>}
              </div>
           </div>

           <div className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/30 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <Activity className="text-emerald-500" size={18} />
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Operations</h3>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-8">System status & active lead flow</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-black/40 border border-white/5 rounded-lg">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 block mb-2">Lead Quality</span>
                    <span className="text-lg font-black text-white">High</span>
                 </div>
                 <div className="p-4 bg-black/40 border border-white/5 rounded-lg">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 block mb-2">Response Time</span>
                    <span className="text-lg font-black text-white">---</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

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
                <span className="text-[10px] font-black uppercase tracking-widest text-white">
                  {new Date(booking.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
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
