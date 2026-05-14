"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, CheckCircle2, Circle, Loader2, Search, Filter } from "lucide-react";
import { updatePhoto } from "@/app/actions/photos";

export function CuratedDashboardClient({ initialPhotos }: { initialPhotos: any[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [loading, setLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "curated" | "pending">("all");

  const handleToggleCurated = async (photo: any) => {
    setLoading(photo.id);
    const newStatus = !photo.is_curated;
    
    try {
      await updatePhoto(photo.id, { is_curated: newStatus });
      setPhotos(prev => prev.map(p => 
        p.id === photo.id ? { ...p, is_curated: newStatus } : p
      ));
    } catch (err) {
      console.error("Failed to update curation status:", err);
    } finally {
      setLoading(null);
    }
  };

  const filteredPhotos = photos.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" ? true : 
                         filter === "curated" ? p.is_curated : !p.is_curated;
    return matchesSearch && matchesFilter;
  });

  const curatedCount = photos.filter(p => p.is_curated).length;

  return (
    <div className="pb-24">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Curation Hub</h1>
          <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Managing the Master Collection • {curatedCount} Assets Live</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand-accent transition-colors" size={14} />
            <input 
              placeholder="Search Archive..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 pl-12 pr-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-brand-accent/30 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 p-1 bg-zinc-900/50 border border-white/5 rounded-sm">
             {(["all", "curated", "pending"] as const).map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] rounded-sm transition-all ${
                   filter === f ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                 }`}
               >
                 {f}
               </button>
             ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-10 4xl:grid-cols-12 gap-4">
        {filteredPhotos.map((photo) => (
          <motion.div
            key={photo.id}
            layout
            className={`group relative aspect-[4/5] rounded-sm overflow-hidden border transition-all duration-500 ${
              photo.is_curated ? 'border-brand-accent/30 shadow-[0_0_20px_var(--accent-glow)]' : 'border-white/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
            }`}
          >
            <Image 
              src={photo.image_url} 
              alt={photo.title || "Archive Image"} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Status Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
               <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">{photo.category || "General"}</span>
               <p className="text-[10px] font-black uppercase text-white truncate mb-4">{photo.title || "Untitled Asset"}</p>
               
               <button 
                 onClick={() => handleToggleCurated(photo)}
                 disabled={loading === photo.id}
                 className={`w-full py-3 rounded-sm flex items-center justify-center gap-2 transition-all ${
                   photo.is_curated 
                   ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                   : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                 }`}
               >
                 {loading === photo.id ? (
                   <Loader2 className="animate-spin" size={12} />
                 ) : photo.is_curated ? (
                   <>Archive Asset <X size={12} /></>
                 ) : (
                   <>Promote to Curated <CheckCircle2 size={12} /></>
                 )}
               </button>
            </div>

            {/* Top Right Quick Badge */}
            <div className="absolute top-3 right-3">
               {photo.is_curated ? (
                 <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white shadow-xl border border-white/20">
                    <Star size={14} fill="currentColor" />
                 </div>
               ) : (
                 <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/30 border border-white/10">
                    <Circle size={14} />
                 </div>
               )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="py-32 text-center border border-white/5 border-dashed rounded-sm">
           <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">No assets match your current parameters</p>
        </div>
      )}
    </div>
  );
}

function X({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
