"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, CheckCircle2, Circle, 
  Search, Filter, Save, Image as ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function AlbumMediaManager() {
  const { id } = useParams();
  const [album, setAlbum] = useState<any>(null);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    const [albumRes, photosRes] = await Promise.all([
      supabase.from("albums").select("*").eq("id", id).single(),
      supabase.from("photos").select("*").order("created_at", { ascending: false })
    ]);

    if (albumRes.data) setAlbum(albumRes.data);
    if (photosRes.data) {
      setAllPhotos(photosRes.data);
      const inAlbum = photosRes.data.filter(p => p.album_id === id).map(p => p.id);
      setSelectedIds(new Set(inAlbum));
    }
    setLoading(false);
  }

  const togglePhoto = (photoId: string) => {
    const next = new Set(selectedIds);
    if (next.has(photoId)) {
      next.delete(photoId);
    } else {
      next.add(photoId);
    }
    setSelectedIds(next);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // 1. Remove all currently assigned photos from this album
    await supabase
      .from("photos")
      .update({ album_id: null })
      .eq("album_id", id);

    // 2. Assign selected photos to this album
    if (selectedIds.size > 0) {
      await supabase
        .from("photos")
        .update({ album_id: id })
        .in("id", Array.from(selectedIds));
      
      // 3. Update cover image if not set
      if (!album.cover_image_url && selectedIds.size > 0) {
        const firstPhoto = allPhotos.find(p => selectedIds.has(p.id));
        if (firstPhoto) {
          await supabase.from("albums").update({ cover_image_url: firstPhoto.image_url }).eq("id", id);
        }
      }
    }

    setIsSaving(false);
    router.refresh();
    router.push("/dashboard/albums");
  };

  const filteredPhotos = allPhotos.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-12 text-zinc-500 uppercase font-black tracking-widest text-xs">Mapping Media...</div>;

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <Link href="/dashboard/albums" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
             <ArrowLeft size={14} /> Back to Albums
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Manage Media: {album?.title}</h1>
          <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Select photos to include in this vault ({selectedIds.size} selected)</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-10 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? "Syncing..." : "Save Selection"} <Save size={14} />
        </button>
      </header>

      <section className="premium-card p-6 bg-zinc-900/20 border border-white/5 rounded-2xl">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
               <input 
                 type="text" 
                 placeholder="Search your library..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 pl-12 pr-6 py-3 rounded-full text-sm text-white outline-none focus:border-blue-500/50 transition-all"
               />
            </div>
            <div className="flex gap-4">
               <button onClick={() => setSelectedIds(new Set())} className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white">Clear All</button>
               <button onClick={() => setSelectedIds(new Set(allPhotos.map(p => p.id)))} className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white">Select All</button>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredPhotos.map((photo) => {
               const isSelected = selectedIds.has(photo.id);
               return (
                  <motion.div 
                    key={photo.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => togglePhoto(photo.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      isSelected ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                     <img src={photo.image_url} alt={photo.title} className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40'}`} />
                     <div className="absolute top-2 right-2">
                        {isSelected ? (
                          <CheckCircle2 size={20} className="text-blue-500 bg-black rounded-full" />
                        ) : (
                          <Circle size={20} className="text-white/20" />
                        )}
                     </div>
                     {photo.album_id && photo.album_id !== id && (
                       <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[8px] font-black uppercase tracking-widest text-zinc-400">
                          In other album
                       </div>
                     )}
                  </motion.div>
               );
            })}
         </div>
      </section>
    </div>
  );
}
