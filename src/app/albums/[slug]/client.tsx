"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Maximize2, X, ChevronLeft, 
  ChevronRight, Lock, Download, CreditCard,
  Loader2
} from "lucide-react";
import { createCheckoutSession } from "@/app/actions/stripe";

export function AlbumClientView({ 
  album, 
  initialPhotos, 
  isLocked,
  contractId
}: { 
  album: any, 
  initialPhotos: any[], 
  isLocked?: boolean,
  contractId?: string
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

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

  const handleFinalPayment = async () => {
    if (!contractId) return;
    setProcessing(true);
    const res = await createCheckoutSession(contractId, 'final');
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      alert("Payment engine encountered a tactical delay.");
      setProcessing(false);
    }
  };

  return (
    <div className="pt-32 pb-24 safe-padding min-h-screen bg-black relative">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.02)_0%,_transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <Link href="/albums" className="group inline-flex items-center text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em]">
            <ArrowLeft size={14} className="mr-3 transform group-hover:-translate-x-2 transition-transform" /> Back to Collections
          </Link>

          {isLocked && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-brand-accent/10 border border-brand-accent/30 p-4 rounded-sm flex items-center gap-6"
            >
               <div className="flex items-center gap-3">
                  <Lock size={16} className="text-brand-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">High-Res Assets Locked</span>
               </div>
               <button 
                 onClick={handleFinalPayment}
                 disabled={processing}
                 className="px-6 py-2 bg-brand-accent text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-blue-700 transition-all flex items-center gap-2"
               >
                  {processing ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />} Pay Final Balance
               </button>
            </motion.div>
          )}
        </div>
        
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
                className={`relative break-inside-avoid group cursor-none overflow-hidden bg-zinc-900 rounded-sm shadow-2xl border transition-all duration-700 ${isLocked ? 'border-brand-accent/20' : 'border-white/5'}`}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={photo.image_url}
                  alt={photo.title || "Album photo"}
                  width={photo.width || 1200}
                  height={photo.height || 1600}
                  className={`w-full h-auto object-cover transition-all duration-1000 ${isLocked ? 'grayscale opacity-40 blur-sm group-hover:blur-none transition-all' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'}`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                
                {/* Tactical Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-8">
                   <div className="flex justify-end">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                         {isLocked ? <Lock size={16} className="text-brand-accent" /> : <Maximize2 size={16} className="text-white" />}
                      </div>
                   </div>
                   <div>
                      <span className="text-xs font-black text-white uppercase tracking-widest block mb-1">{photo.title || "Untitled Asset"}</span>
                      <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{isLocked ? "ACCESS RESTRICTED" : (photo.category || "Official Media")}</span>
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
                  {!isLocked ? (
                    <a 
                      href={initialPhotos[selectedImageIndex].image_url} 
                      download 
                      className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-3 px-6"
                      onClick={e => e.stopPropagation()}
                    >
                       <Download size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Download Asset</span>
                    </a>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleFinalPayment(); }}
                      className="p-4 bg-brand-accent text-white border border-brand-accent/20 rounded-full hover:bg-blue-700 transition-all flex items-center gap-3 px-6 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                    >
                       <Lock size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Pay to Unlock</span>
                    </button>
                  )}
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
                  className={`max-w-full max-h-[75vh] object-contain rounded-sm ${isLocked ? 'blur-2xl opacity-50 scale-105 transition-all duration-1000' : ''}`}
                />
                
                {isLocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-sm">
                     <div className="p-8 bg-zinc-900 border border-white/5 rounded-2xl text-center space-y-6 max-w-md shadow-2xl">
                        <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto">
                           <Lock size={32} className="text-brand-accent" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Protected Asset</h3>
                        <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                          This high-resolution delivery is restricted. Complete your final project balance to unlock immediate access to all master assets.
                        </p>
                        <button 
                          onClick={handleFinalPayment}
                          className="w-full py-5 bg-brand-accent text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                        >
                           <CreditCard size={14} /> Pay Final Balance
                        </button>
                     </div>
                  </div>
                )}

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
