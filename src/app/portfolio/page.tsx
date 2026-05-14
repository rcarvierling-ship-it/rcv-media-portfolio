"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

const categories = ["All", "Sports", "Basketball", "Volleyball", "Portraits", "Lifestyle", "Events"];

function PortfolioContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (initialCategory) {
      const match = categories.find(c => c.toLowerCase() === initialCategory.toLowerCase());
      if (match) setActiveCategory(match);
    }
  }, [initialCategory]);

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
    <div className="pt-32 pb-24 safe-padding min-h-screen bg-zinc-950 relative">
      <div className="fixed inset-0 z-[100] bg-ambient pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-8xl font-black uppercase tracking-tighter mb-12 text-white"
          >
            Portfolio
          </motion.h1>
          
          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-wrap gap-3"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-full border ${
                  activeCategory === category 
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                    : "premium-glass text-zinc-400 hover:text-white border-white/10 hover:border-white/30"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </header>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-sm">Loading...</div>
        ) : photos.length === 0 ? (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="w-full premium-card rounded-2xl p-16 flex flex-col items-center justify-center text-center border border-white/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-black/50" />
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <h3 className="text-2xl font-black uppercase text-white mb-4 tracking-tight">Gallery is empty</h3>
              <p className="text-zinc-500 mb-8 max-w-md mx-auto">High-impact shots are currently being curated. Check back soon for the latest galleries.</p>
            </div>
          </motion.div>
        ) : filteredPhotos.length === 0 ? (
           <div className="text-zinc-500 uppercase tracking-widest text-sm font-bold pt-8">No photos in this category.</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="relative break-inside-avoid group cursor-pointer overflow-hidden bg-zinc-900 rounded-lg aspect-[4/5] sm:aspect-auto"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={photo.image_url}
                    alt={photo.title || "Portfolio Image"}
                    width={photo.width || 1200}
                    height={photo.height || 1600}
                    className="w-full h-full sm:h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <span className="text-xs text-zinc-400 uppercase tracking-widest mb-2 font-bold">{photo.category || "Highlight"}</span>
                    <span className="text-xl font-black text-white uppercase">{photo.title || "Untitled"}</span>
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
            className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={closeLightbox}
          >
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white p-2 z-50 transition-colors"
              onClick={closeLightbox}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 z-50 transition-colors"
              onClick={prevImage}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 z-50 transition-colors"
              onClick={nextImage}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-full max-h-full"
              >
                <img
                  src={filteredPhotos[selectedImageIndex].image_url}
                  alt={filteredPhotos[selectedImageIndex].title || "Image"}
                  className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-md"
                />
                <div className="absolute -bottom-12 left-0 right-0 text-center text-white/70">
                  <span className="font-black uppercase tracking-widest text-white">{filteredPhotos[selectedImageIndex].title || "Untitled"}</span>
                  {filteredPhotos[selectedImageIndex].category && (
                    <>
                      <span className="mx-3 text-white/30">•</span>
                      <span className="uppercase tracking-widest text-xs font-bold text-zinc-500">{filteredPhotos[selectedImageIndex].category}</span>
                    </>
                  )}
                </div>
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
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 uppercase tracking-widest text-xs font-black">Syncing Portfolio...</div>}>
      <PortfolioContent />
    </Suspense>
  );
}
