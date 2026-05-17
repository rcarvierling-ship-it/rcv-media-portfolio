"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

import { trackEvent } from "@/utils/analytics";

function PortfolioContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (initialCategory && categories.length > 1) {
      const match = categories.find(c => c.toLowerCase() === initialCategory.toLowerCase());
      if (match) setActiveCategory(match);
    }
    trackEvent('portfolio_view');
  }, [initialCategory, categories]);

  useEffect(() => {
    async function fetchPhotos() {
      const { data, error } = await supabase
        .from("photos")
        .select(`
          *,
          albums!left (
            is_private
          )
        `)
        .eq("is_curated", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (data) {
        // Filter out photos from private albums
        const publicPhotos = data.filter(p => !p.albums || p.albums.is_private === false);
        setPhotos(publicPhotos);
        
        // Extract unique categories dynamically and format them!
        const unique = Array.from(new Set(publicPhotos.map(p => p.category).filter(Boolean))) as string[];
        const formatted = unique.map(c => c.trim().charAt(0).toUpperCase() + c.trim().slice(1));
        const sortedUnique = Array.from(new Set(formatted)).sort();
        setCategories(["All", ...sortedUnique]);
      }
      setLoading(false);
    }
    fetchPhotos();
  }, [supabase]);

  const filteredPhotos = activeCategory === "All" 
    ? photos 
    : photos.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % filteredPhotos.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  return (
    <div className="pt-40 pb-24 safe-padding min-h-screen bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-accent/20 blur-[200px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-zinc-900 blur-[200px] rounded-full" />
      </div>

      <div className="max-w-[3200px] mx-auto px-6 relative z-10">
        <header className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent mb-8 block border-l-4 border-brand-accent pl-6 uppercase">The Archive</span>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-foreground mb-12 leading-[0.8]">
              Visual <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 italic">Evidence.</span>
            </h1>
          </motion.div>
          
          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-full border ${
                  activeCategory === category 
                    ? "bg-brand-accent text-black border-brand-accent shadow-brand-glow scale-105" 
                    : "bg-white/5 text-zinc-400 border-white/5 hover:border-brand-accent/50 hover:text-white shadow-premium"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </header>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-zinc-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Loading Portfolio...</div>
        ) : photos.length === 0 ? (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="w-full bg-zinc-900/40 backdrop-blur-md rounded-[3rem] p-32 flex flex-col items-center justify-center text-center border border-white/5 shadow-premium relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-20 h-20 mb-8 mx-auto rounded-full bg-black/40 flex items-center justify-center border border-white/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <h3 className="text-3xl font-black uppercase text-white mb-4 tracking-tighter italic">Gallery Empty</h3>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto font-medium">Visual assets are currently under curation. <br/> Check back for updated photos.</p>
            </div>
          </motion.div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-zinc-400 uppercase tracking-widest text-[10px] font-black pt-8">No photos found in this category.</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="relative break-inside-avoid group cursor-pointer overflow-hidden bg-zinc-100 rounded-[2rem] border border-border shadow-premium hover:shadow-2xl transition-all"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={photo.image_url}
                    alt={photo.title || "Portfolio Image"}
                    width={photo.width || 1200}
                    height={photo.height || 1600}
                    className="w-full h-full sm:h-auto object-cover transition-transform duration-[2s] group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-10">
                    <span className="text-[10px] text-brand-accent uppercase tracking-[0.3em] mb-2 font-black">Asset ID: {photo.id.slice(0, 8)}</span>
                    <span className="text-3xl font-black text-white uppercase tracking-tighter italic">RCV Frame</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
            onClick={closeLightbox}
          >
            <button 
              className="absolute top-10 right-10 text-zinc-500 hover:text-white p-4 z-50 transition-all bg-card border border-white/5 rounded-full shadow-premium"
              onClick={closeLightbox}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <button 
              className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-6 z-50 transition-all bg-card border border-white/5 rounded-full shadow-premium"
              onClick={prevImage}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <button 
              className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-6 z-50 transition-all bg-card border border-white/5 rounded-full shadow-premium"
              onClick={nextImage}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            <div className="relative w-full h-full flex flex-col items-center justify-center gap-12" onClick={e => e.stopPropagation()}>
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="relative max-w-full max-h-[75vh]"
              >
                <img
                  src={filteredPhotos[selectedImageIndex].image_url}
                  alt="Portfolio Image"
                  className="max-w-full max-h-[75vh] object-contain shadow-brand-glow rounded-[1.5rem] border border-white/10"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                   {filteredPhotos[selectedImageIndex].iso && (
                     <div className="px-5 py-2 bg-card border border-white/10 rounded-full text-[9px] font-black text-brand-accent uppercase tracking-widest shadow-lg">
                        ISO {filteredPhotos[selectedImageIndex].iso}
                     </div>
                   )}
                   {filteredPhotos[selectedImageIndex].aperture && (
                     <div className="px-5 py-2 bg-card border border-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
                        {filteredPhotos[selectedImageIndex].aperture.includes('f/') ? filteredPhotos[selectedImageIndex].aperture.toUpperCase() : `F/${filteredPhotos[selectedImageIndex].aperture}`}
                     </div>
                   )}
                   {filteredPhotos[selectedImageIndex].shutter_speed && (
                     <div className="px-5 py-2 bg-card border border-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
                        {filteredPhotos[selectedImageIndex].shutter_speed}S
                     </div>
                   )}
                   {filteredPhotos[selectedImageIndex].focal_length && (
                     <div className="px-5 py-2 bg-card border border-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
                        {filteredPhotos[selectedImageIndex].focal_length}
                     </div>
                   )}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">RCV.Media Portfolio</p>
                <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                  {filteredPhotos[selectedImageIndex].title || "Photography Portfolio"}
                </h4>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-zinc-400 uppercase tracking-widest text-[10px] font-black animate-pulse">Loading Portfolio...</div>}>
      <PortfolioContent />
    </Suspense>
  );
}
