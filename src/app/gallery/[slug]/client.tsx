"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Download, Lock, ChevronLeft, ChevronRight, X } from "lucide-react";

export function GalleryClient({ album }: { album: any }) {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(!album.is_private);
  const [error, setError] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const supabase = createClient();

  // Check local storage for existing session
  useEffect(() => {
    if (album.is_private) {
      const savedPass = localStorage.getItem(`gallery_${album.id}`);
      if (savedPass === album.passcode) {
        setIsAuthorized(true);
      }
    }
  }, [album.id, album.is_private, album.passcode]);

  // Fetch photos once authorized
  useEffect(() => {
    if (isAuthorized) {
      async function fetchPhotos() {
        setLoading(true);
        const { data } = await supabase
          .from("photos")
          .select("*")
          .eq("album_id", album.id)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false });
        
        if (data) setPhotos(data);
        setLoading(false);
      }
      fetchPhotos();
    }
  }, [isAuthorized, album.id, supabase]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === album.passcode) {
      setIsAuthorized(true);
      localStorage.setItem(`gallery_${album.id}`, passcode);
      setError(false);
    } else {
      setError(true);
      setPasscode("");
    }
  };

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);

  const downloadImage = async (url: string, filename: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'rcv-media-photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[600] bg-black flex items-center justify-center p-6">
        <div className="fixed inset-0 bg-ambient opacity-50 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full premium-card p-12 border border-white/10 rounded-2xl relative z-10 text-center"
        >
          <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Lock className="text-brand-accent" size={24} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Private Gallery</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-8">
            {album.client_name ? `For ${album.client_name}` : album.title}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <input 
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Passcode"
                className={`w-full bg-zinc-900 border ${error ? 'border-red-500' : 'border-zinc-800'} focus:border-white px-6 py-4 text-white text-center outline-none rounded-sm font-black tracking-[0.5em]`}
                autoFocus
              />
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2">Incorrect Passcode</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-white text-black font-black uppercase tracking-widest text-xs py-5 hover:bg-zinc-200 transition-all rounded-sm"
            >
              Access Gallery
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-ambient pointer-events-none" />
      
      <div className="max-w-[1800px] mx-auto relative z-10">
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 text-brand-accent mb-6"
            >
              <div className="w-8 h-px bg-brand-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Client Portal</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-white mb-6 leading-none"
            >
              {album.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-lg font-light max-w-xl"
            >
              {album.description || `Exclusive high-resolution gallery curated for ${album.client_name || 'you'}.`}
            </motion.p>
          </div>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm backdrop-blur-sm"
          >
             {photos.length} Deliverables
          </motion.button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="text-zinc-600 font-black uppercase tracking-widest text-sm animate-pulse">Initializing Portal...</div>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group break-inside-avoid bg-zinc-900 rounded-sm overflow-hidden"
                >
                  <div className="relative aspect-auto cursor-pointer" onClick={() => openLightbox(index)}>
                    <Image 
                      src={photo.image_url} 
                      alt={photo.title || "Portal Photo"} 
                      width={photo.width || 800} 
                      height={photo.height || 1000}
                      className="w-full transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6">
                       <div className="flex justify-end">
                         <button 
                           onClick={(e) => { e.stopPropagation(); downloadImage(photo.image_url, `${album.slug}-${index}.jpg`); }}
                           className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-full hover:scale-110 transition-transform"
                         >
                           <Download size={18} />
                         </button>
                       </div>
                       <span className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-brand-accent pl-4">
                         {photo.title || `RCV-${index + 1}`}
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
            onClick={closeLightbox}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white p-2 z-[1001]" onClick={closeLightbox}>
              <X size={32} />
            </button>
            
            <div className="relative w-full h-full flex flex-col items-center justify-center gap-8" onClick={e => e.stopPropagation()}>
              <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={photos[selectedImageIndex].image_url}
                  className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(59,130,246,0.1)]"
                />
                <button 
                  className="absolute left-0 text-white/30 hover:text-white transition-colors p-4"
                  onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((selectedImageIndex - 1 + photos.length) % photos.length); }}
                >
                  <ChevronLeft size={64} strokeWidth={1} />
                </button>
                <button 
                  className="absolute right-0 text-white/30 hover:text-white transition-colors p-4"
                  onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((selectedImageIndex + 1) % photos.length); }}
                >
                  <ChevronRight size={64} strokeWidth={1} />
                </button>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
                  {selectedImageIndex + 1} / {photos.length}
                </span>
                <button 
                  onClick={() => downloadImage(photos[selectedImageIndex].image_url, `${album.slug}-${selectedImageIndex}.jpg`)}
                  className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-zinc-200 transition-all rounded-sm"
                >
                  <Download size={16} /> Download High-Res
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
