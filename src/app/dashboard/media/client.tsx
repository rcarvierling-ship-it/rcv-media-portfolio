"use client";

import { useState, useMemo } from "react";
import { 
  Search, Filter, Plus, Trash2, 
  Edit3, Star, Check, X, 
  Loader2, Upload, ExternalLink,
  ChevronDown, Grid, List as ListIcon,
  Image as ImageIcon, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { updatePhoto, deletePhoto } from "@/app/actions/photos";
import { createClient } from "@/utils/supabase/client";

export function MediaLibraryClient({ initialPhotos, albums }: { initialPhotos: any[], albums: any[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const categories = ["All", ...Array.from(new Set(initialPhotos.map(p => p.category).filter(Boolean)))];

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const matchesSearch = (p.title?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [photos, searchTerm, categoryFilter]);

  const handleToggleFeatured = async (photo: any) => {
    setIsProcessing(photo.id);
    const result = await updatePhoto(photo.id, { is_featured: !photo.is_featured });
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, is_featured: !p.is_featured } : p));
    setIsProcessing(null);
  };

  const handleDelete = async (photo: any) => {
    if (!confirm("Are you sure? This will delete the photo from the library and Cloudinary permanently.")) return;
    setIsProcessing(photo.id);
    try {
      await deletePhoto(photo.id, photo.public_id);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      if (selectedPhoto?.id === photo.id) setSelectedPhoto(null);
    } catch (err) {
      alert("Delete failed.");
    }
    setIsProcessing(null);
  };

  const handleUpdatePhoto = async (id: string, updates: any) => {
    setIsProcessing(id);
    try {
      await updatePhoto(id, updates);
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      if (selectedPhoto?.id === id) setSelectedPhoto({ ...selectedPhoto, ...updates });
    } catch (err) {
      alert("Update failed.");
    }
    setIsProcessing(null);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Master Media Library</h1>
          <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Managing {photos.length} assets across your entire horizon</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => router.push("/dashboard/upload")} className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2 rounded-sm">
             <Plus size={14} /> Bulk Upload
           </button>
        </div>
      </header>

      {/* FILTERS & SEARCH */}
      <section className="premium-card p-6 bg-zinc-900/20 border border-white/5 rounded-sm flex flex-col md:flex-row gap-6 items-center">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              type="text" 
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 pl-12 pr-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-blue-500/50 transition-all"
            />
         </div>
         <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  categoryFilter === cat ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/5 text-zinc-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
      </section>

      {/* ASSET GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
         {filteredPhotos.map((photo) => (
           <motion.div 
              layout
              key={photo.id}
              className={`relative aspect-square group bg-zinc-900 border transition-all overflow-hidden rounded-sm ${
                selectedPhoto?.id === photo.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/5'
              }`}
           >
              <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                 <div className="flex justify-between items-start">
                    <button 
                      onClick={() => handleToggleFeatured(photo)}
                      className={`p-2 rounded-full transition-all ${photo.is_featured ? 'text-blue-500 bg-white' : 'text-white hover:text-blue-500 bg-black/40'}`}
                    >
                      <Star size={14} fill={photo.is_featured ? "currentColor" : "none"} />
                    </button>
                    <div className="flex gap-2">
                       <button onClick={() => setSelectedPhoto(photo)} className="p-2 text-white hover:text-blue-500 bg-black/40 rounded-full transition-all"><Edit3 size={14} /></button>
                    </div>
                 </div>
                 <div className="flex justify-between items-end">
                    <div className="max-w-[70%]">
                       <p className="text-[10px] font-black uppercase tracking-tighter text-white truncate leading-none mb-1">{photo.title}</p>
                       <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{photo.category}</p>
                    </div>
                    <button onClick={() => handleDelete(photo)} className="p-2 text-zinc-400 hover:text-red-500 bg-black/40 rounded-full transition-all"><Trash2 size={14} /></button>
                 </div>
              </div>

              {isProcessing === photo.id && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                   <Loader2 className="animate-spin text-blue-500" />
                </div>
              )}
           </motion.div>
         ))}
      </div>

      {/* QUICK EDIT SLIDE-OUT / MODAL */}
      <AnimatePresence>
         {selectedPhoto && (
           <div className="fixed inset-0 z-[500] flex items-center justify-end">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedPhoto(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="relative w-full max-w-xl h-full bg-zinc-950 border-l border-white/5 p-12 overflow-y-auto"
              >
                 <button onClick={() => setSelectedPhoto(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                 
                 <div className="mb-12">
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Asset Intelligence</span>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-none mb-4">Edit Details</h2>
                 </div>

                 <div className="aspect-video w-full bg-zinc-900 rounded-sm overflow-hidden mb-12 border border-white/5">
                    <img src={selectedPhoto.image_url} alt="Preview" className="w-full h-full object-cover" />
                 </div>

                 <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset Title</label>
                       <input 
                         className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold"
                         value={selectedPhoto.title || ""}
                         onChange={(e) => setSelectedPhoto({ ...selectedPhoto, title: e.target.value })}
                         onBlur={(e) => handleUpdatePhoto(selectedPhoto.id, { title: e.target.value })}
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</label>
                          <select 
                            className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase"
                            value={selectedPhoto.category || ""}
                            onChange={(e) => handleUpdatePhoto(selectedPhoto.id, { category: e.target.value })}
                          >
                             {["Sports", "Portraits", "Lifestyle", "Events", "Basketball", "Volleyball"].map(cat => (
                               <option key={cat} value={cat}>{cat}</option>
                             ))}
                          </select>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Associated Album</label>
                          <select 
                            className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm font-bold uppercase"
                            value={selectedPhoto.album_id || ""}
                            onChange={(e) => handleUpdatePhoto(selectedPhoto.id, { album_id: e.target.value || null })}
                          >
                             <option value="">No Album</option>
                             {albums.map(a => (
                               <option key={a.id} value={a.id}>{a.title}</option>
                             ))}
                          </select>
                       </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-sm">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Feature on Homepage</p>
                          <p className="text-[9px] text-zinc-500 uppercase">Surface this asset in "The Edit" carousel</p>
                       </div>
                       <button 
                         onClick={() => handleToggleFeatured(selectedPhoto)}
                         className={`w-12 h-6 rounded-full relative transition-all ${selectedPhoto.is_featured ? 'bg-blue-600' : 'bg-zinc-800'}`}
                       >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedPhoto.is_featured ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>

                    <div className="pt-10 border-t border-white/5">
                       <button 
                         onClick={() => handleDelete(selectedPhoto)}
                         className="w-full py-4 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-sm flex items-center justify-center gap-2"
                       >
                          <Trash2 size={14} /> Delete Asset Permanently
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
