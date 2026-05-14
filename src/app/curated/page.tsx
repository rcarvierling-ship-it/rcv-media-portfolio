"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowRight, 
  Maximize2, 
  X, 
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star
} from "lucide-react";
import Link from "next/link";

export default function CuratedCollectionPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCurated() {
      const { data } = await supabase
        .from("photos")
        .select("*, albums(title)")
        .eq("is_curated", true)
        .order("created_at", { ascending: false });
      
      if (data) setPhotos(data);
      setLoading(false);
    }
    fetchCurated();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-800" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* 1. CINEMATIC HEADER */}
      <section className="relative h-[80vh] flex flex-col justify-center px-6 lg:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black z-10" />
          {photos[0] && (
             <motion.img 
               initial={{ scale: 1.1, opacity: 0 }}
               animate={{ scale: 1, opacity: 0.5 }}
               transition={{ duration: 2 }}
               src={photos[0].image_url} 
               className="w-full h-full object-cover"
             />
          )}
        </div>

        <div className="relative z-20 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em] mb-6 block">The Master Collection</span>
            <h1 className="text-[12vw] md:text-[10vw] font-black uppercase tracking-tighter leading-[0.8] mb-8">
              Director's <br/> <span className="text-zinc-800 italic">Cut.</span>
            </h1>
            <p className="text-zinc-500 text-lg md:text-2xl font-light max-w-2xl leading-relaxed">
              A curated showcase of my most impactful work. Every frame captured to define the essence of motion, emotion, and the raw intensity of the moment.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-10 right-10 z-20">
           <motion.div 
             animate={{ y: [0, 10, 0] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="flex flex-col items-center gap-4"
           >
              <span className="text-[9px] font-black uppercase tracking-[0.3em] rotate-90 origin-right text-zinc-600">Scroll to Explore</span>
              <div className="w-[1px] h-20 bg-gradient-to-b from-zinc-800 to-transparent" />
           </motion.div>
        </div>
      </section>

      {/* 2. THE SHOWCASE GRID */}
      <section className="px-6 lg:px-20 py-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: (i % 2) * 0.2 }}
              className="group cursor-none"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden mb-8">
                 <img 
                   src={photo.image_url} 
                   className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                   alt={photo.title}
                 />
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transform scale-50 group-hover:scale-100 transition-all duration-500">
                       <Maximize2 size={32} />
                    </div>
                 </div>
              </div>
              <div className="flex justify-between items-end">
                 <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2 block">
                       {photo.albums?.title || "Photography"}
                    </span>
                    <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                       {photo.title || "Untitled Moment"}
                    </h3>
                 </div>
                 <div className="text-[10px] font-black text-zinc-800">
                    MASTER NO. {String(i + 1).padStart(2, '0')}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        {photos.length === 0 && (
           <div className="py-40 text-center border border-zinc-900 border-dashed rounded-sm">
              <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">The collection is currently private.</p>
           </div>
        )}
      </section>

      {/* 3. CALL TO ACTION */}
      <section className="py-60 px-6 text-center bg-zinc-950">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
        >
          <h2 className="text-[10vw] font-black uppercase tracking-tighter leading-none mb-12">
            Build The <br/> <span className="text-blue-500 italic">Vision.</span>
          </h2>
          <Link 
            href="/book" 
            className="inline-flex items-center gap-4 px-12 py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-zinc-200 transition-all hover:scale-105"
          >
            Start Your Project <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedPhoto && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex flex-col"
           >
              <header className="p-8 flex justify-between items-center relative z-10">
                 <div>
                    <span className="text-blue-500 text-[9px] font-black uppercase tracking-widest block mb-1">Master Collection</span>
                    <h3 className="text-white font-black uppercase tracking-widest text-xs">
                      {selectedPhoto.title || "Elite Moment"}
                    </h3>
                 </div>
                 <button onClick={() => setSelectedPhoto(null)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all">
                    <X size={24} />
                 </button>
              </header>

              <div className="flex-1 flex items-center justify-center p-4 lg:p-20">
                 <motion.img 
                   layoutId={selectedPhoto.id}
                   src={selectedPhoto.image_url}
                   className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                 />
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
