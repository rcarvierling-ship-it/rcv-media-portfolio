"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { deletePhoto, updatePhoto } from "@/app/actions/photos";
import { DollarSign, Users, Target, Clock, ArrowRight, TrendingUp, X } from "lucide-react";
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
  const [albums, setAlbums] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const [
        { data: photosData }, 
        { data: albumsData },
        { data: bookingsData },
        { data: pkgData }
      ] = await Promise.all([
        supabase.from("photos").select("*").order("created_at", { ascending: false }),
        supabase.from("albums").select("id, title"),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("pricing_packages").select("name, price")
      ]);

      if (photosData) setPhotos(photosData);
      if (albumsData) setAlbums(albumsData);
      if (bookingsData) setBookings(bookingsData);
      if (pkgData) setPackages(pkgData);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const stats = useMemo(() => {
    const totalLeads = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === "confirmed");
    const pendingBookings = bookings.filter(b => b.status === "pending");
    
    // Revenue Calculation
    let totalRevenue = 0;
    confirmedBookings.forEach(b => {
      const pkg = packages.find(p => p.name === b.package_selected);
      if (pkg) {
        const priceNum = parseInt(pkg.price.replace(/[^0-9]/g, "")) || 0;
        totalRevenue += priceNum;
      }
    });

    const conversionRate = totalLeads > 0 ? Math.round((confirmedBookings.length / totalLeads) * 100) : 0;
    
    return {
      totalLeads,
      confirmedBookings: confirmedBookings.length,
      pendingBookings: pendingBookings.length,
      totalRevenue,
      conversionRate
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
      album_id: (formData.get("album_id") as string) || null,
      is_featured: formData.get("is_featured") === "on",
      sort_order: parseInt(formData.get("sort_order") as string) || 0,
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
      {/* 1. EXECUTIVE STATS HEADER */}
      <section>
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Executive Overview</h1>
            <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Real-time business performance & analytics</p>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1">Status</span>
             <div className="flex items-center gap-2 text-emerald-500">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-xs font-black uppercase tracking-widest">Live</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign size={80} strokeWidth={3} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">Total Revenue</span>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black tracking-tighter text-white">${stats.totalRevenue.toLocaleString()}</h3>
                <TrendingUp size={20} className="text-emerald-500 mb-2" />
              </div>
              <p className="text-[10px] text-zinc-600 mt-4 font-bold uppercase tracking-widest">From {stats.confirmedBookings} Confirmed Shoots</p>
            </div>
          </motion.div>

          {/* Leads Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users size={80} strokeWidth={3} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">Total Leads</span>
              <h3 className="text-4xl font-black tracking-tighter text-white">{stats.totalLeads}</h3>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{stats.pendingBookings} Pending</span>
                <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{stats.confirmedBookings} Booked</span>
              </div>
            </div>
          </motion.div>

          {/* Conversion Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-8 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target size={80} strokeWidth={3} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 block">Booking Rate</span>
              <h3 className="text-4xl font-black tracking-tighter text-white">{stats.conversionRate}%</h3>
              <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${stats.conversionRate}%` }} />
              </div>
            </div>
          </motion.div>

          {/* Pending Action Card */}
          <Link href="/dashboard/bookings" className="premium-card p-8 rounded-2xl border border-blue-500/20 bg-blue-600/5 hover:bg-blue-600/10 transition-all backdrop-blur-xl group flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 block">Action Required</span>
              <h3 className="text-2xl font-black tracking-tighter text-white">{stats.pendingBookings} Pending Bookings</h3>
            </div>
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest mt-6">
              Review Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 2. RECENT ACTIVITY & MEDIA LIBRARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Media Library */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Media Library</h2>
            <Link 
              href="/dashboard/upload"
              className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              Upload New &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center text-zinc-600 uppercase font-black text-xs tracking-widest">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square bg-zinc-900 overflow-hidden border border-white/5 hover:border-white/20 transition-all rounded-sm">
                  <Image src={photo.image_url} alt={photo.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                    <button onClick={() => setEditingPhoto(photo)} className="text-[10px] font-black uppercase tracking-widest text-white border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all">Edit</button>
                    <button onClick={() => handleDelete(photo.id, photo.public_id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings Sidebar */}
        <div className="space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Recent Requests</h2>
            <Link 
              href="/dashboard/bookings"
              className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="p-6 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-500' : 'bg-zinc-600 animate-pulse'}`} />
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">{booking.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{booking.package_selected}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white block">
                    {new Date(booking.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 block mt-1">{booking.status}</span>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">No requests yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal (Legacy but functional) */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-zinc-950 border border-white/10 p-10 w-full max-w-md shadow-2xl rounded-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Edit Photo</h2>
              <button onClick={() => setEditingPhoto(null)} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Title</label>
                <input name="title" defaultValue={editingPhoto.title} className="w-full bg-zinc-900 border border-white/5 focus:border-blue-500/50 px-6 py-4 text-white outline-none rounded-sm" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</label>
                <select name="category" defaultValue={editingPhoto.category} className="w-full bg-zinc-900 border border-white/5 focus:border-blue-500/50 px-6 py-4 text-white outline-none rounded-sm">
                  <option value="Sports">Sports</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Portraits">Portraits</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <input type="checkbox" name="is_featured" id="edit_featured" defaultChecked={editingPhoto.is_featured} className="w-5 h-5 accent-blue-600" />
                <label htmlFor="edit_featured" className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Feature on Homepage</label>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-white text-black font-black uppercase py-4 hover:bg-zinc-200 rounded-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
