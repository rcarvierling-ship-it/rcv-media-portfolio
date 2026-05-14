"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Maximize2, X, ChevronLeft, 
  ChevronRight, Download
} from "lucide-react";

export function AlbumClientView({ 
  album, 
  initialPhotos, 
}: { 
  album: any, 
  initialPhotos: any[], 
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);
  
  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % initialPhotos.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + initialPhotos.length) % initialPhotos.length);
    }
  };

  return (
    <div className="pt-32 pb-24 safe-padding min-h-screen bg-black relative">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.02)_0%,_transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <Link href="/albums" className="group inline-flex items-center text-zinc-500 hover:text-white mb-16 transition-colors text-[10px] font-black uppercase tracking-[0.3em]">
          <ArrowLeft size={14} className="mr-3 transform group-hover:-translate-x-2 transition-transform" /> Back to Collections
        </Link>
        
        <header className="mb-24 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
             <div className="h-px w-12 bg-brand-accent shadow-[0_0_10px_var(--accent-glow)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent">Official Collection</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-8 text-white italic leading-[0.85]"
          >
            {album.title}
          </motion.h1>
          {album.description && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-zinc-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl"
            >
              {album.description}
            </motion.p>
          )}
        </header>

        {initialPhotos.length === 0 ? (
          <div className="py-40 text-center border border-white/5 rounded-2xl bg-zinc-900/10">
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">Currently Curating Collection</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {initialPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                className="relative break-inside-avoid group cursor-none overflow-hidden bg-zinc-900 rounded-sm shadow-2xl border border-white/5"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={photo.image_url}
                  alt={photo.title || "Album photo"}
                  width={photo.width || 1200}
                  height={photo.height || 1600}
                  className="w-full h-auto object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                
                {/* Tactical Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-8">
                   <div className="flex justify-end">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                         <Maximize2 size={16} className="text-white" />
                      </div>
                   </div>
                   <div>
                      <span className="text-xs font-black text-white uppercase tracking-widest block mb-1">{photo.title || "Untitled Asset"}</span>
                      <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{photo.category || "Official Media"}</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX HUB */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 md:p-16"
            onClick={closeLightbox}
          >
            {/* Control Bar */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-[1100]">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                     <span className="text-[10px] font-black text-brand-accent">{selectedImageIndex + 1}</span>
                  </div>
                  <div className="h-px w-8 bg-zinc-800" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{initialPhotos.length} TOTAL ASSETS</span>
               </div>
               
               <div className="flex items-center gap-4">
                  <a 
                    href={initialPhotos[selectedImageIndex].image_url} 
                    download 
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-3 px-6"
                    onClick={e => e.stopPropagation()}
                  >
                     <Download size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Download Asset</span>
                  </a>
                  <button onClick={closeLightbox} className="p-4 bg-white/5 border border-white/10 rounded-full text-zinc-500 hover:text-white transition-all">
                     <X size={20} />
                  </button>
               </div>
            </div>

            {/* Navigation */}
            <button className="absolute left-8 top-1/2 -translate-y-1/2 p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/40 hover:text-white transition-all z-[1100]" onClick={prevImage}>
              <ChevronLeft size={32} strokeWidth={3} />
            </button>
            <button className="absolute right-8 top-1/2 -translate-y-1/2 p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/40 hover:text-white transition-all z-[1100]" onClick={nextImage}>
              <ChevronRight size={32} strokeWidth={3} />
            </button>

            {/* Image Stage */}
            <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="relative max-w-full max-h-full flex flex-col items-center shadow-[0_0_100px_rgba(0,0,0,0.8)]"
              >
                <img
                  src={initialPhotos[selectedImageIndex].image_url}
                  alt={initialPhotos[selectedImageIndex].title || "Image"}
                  className="max-w-full max-h-[75vh] object-contain rounded-sm"
                />
                
                <div className="mt-12 text-center">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic mb-2">{initialPhotos[selectedImageIndex].title || "Untitled Asset"}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">RCV.MEDIA // VISUAL INTELLIGENCE</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
