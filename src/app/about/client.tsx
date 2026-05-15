"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Instagram, Mail, ArrowRight, 
  MapPin, Zap, Target, Shield 
} from "lucide-react";
import { useRef } from "react";

export function AboutClient({ data }: { data: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-brand-accent selection:text-white">
      {/* Background Intelligence */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        
        {/* VISION LAYER: Fixed/Sticky Side (Portrait) */}
        <div className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 relative h-[70vh] overflow-hidden group">
          <motion.div 
            style={{ scale: imageScale, opacity: imageOpacity }}
            className="w-full h-full relative"
          >
            <Image
              src={data.imageUrl}
              alt={`${data.titleFirst} ${data.titleLast}`}
              fill
              className="object-cover transition-all duration-1000 grayscale hover:grayscale-0"
              priority
            />
          </motion.div>
          
          {/* Tactical Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent hidden lg:block" />
          
          <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
              <div className="flex flex-col gap-2">
                 <div className="h-px w-24 bg-brand-accent shadow-[0_0_15px_var(--accent-glow)]" />
              </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <MapPin size={12} className="text-brand-accent" /> Louisville, KY // USA
             </div>
          </div>

          {/* Floating Branded Element */}
          <div className="absolute top-12 left-12">
             <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-xl bg-black/20">
                <span className="text-[10px] font-black text-white">RCV</span>
             </div>
          </div>
        </div>

        {/* NARRATIVE LAYER: Scrollable Content */}
        <div className="lg:w-1/2 relative bg-black p-12 lg:p-24 flex flex-col justify-center">
          <header className="mb-20">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               className="flex items-center gap-4 mb-8"
             >
                <div className="h-px w-8 bg-zinc-800" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">The Narrative</span>
             </motion.div>
             
             <motion.div
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             >
               <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-white italic leading-[0.8] mb-4">
                 {data.titleFirst}
               </h1>
               <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-transparent stroke-text leading-[0.8] mb-12">
                 {data.titleLast}
               </h1>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.4 }}
               className="space-y-8 text-zinc-400 font-light text-xl leading-relaxed max-w-xl"
             >
               <div className="whitespace-pre-line border-l border-zinc-900 pl-8 py-2">
                 {data.bio}
               </div>
             </motion.div>
          </header>

          {/* Tactical Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
             <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-accent">
                   <Zap size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">High-Velocity Delivery</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-bold uppercase leading-relaxed tracking-wider">
                   Fast-paced environments demand instant results. I prioritize a high-speed workflow without sacrificing precision.
                </p>
             </div>
             <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-accent">
                   <Target size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Surgical Composition</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-bold uppercase leading-relaxed tracking-wider">
                   Every frame is a tactical decision. I hunt for the geometry and emotion that defines the premium visual experience.
                </p>
             </div>
          </div>

          {/* Social & Contact Hub */}
          <div className="pt-12 border-t border-white/5 space-y-12">
             <div className="flex flex-col sm:flex-row gap-8">
                {data.instagramUrl && (
                  <a 
                    href={data.instagramUrl} 
                    target="_blank" 
                    className="flex items-center gap-4 group"
                  >
                     <div className="p-4 bg-zinc-900 rounded-full group-hover:bg-brand-accent transition-all">
                        <Instagram size={20} className="text-white" />
                     </div>
                     <div>
                        <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">Instagram</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Follow the Vision</span>
                     </div>
                  </a>
                )}
                <a 
                  href={`mailto:${data.contactEmail}`}
                  className="flex items-center gap-4 group"
                >
                   <div className="p-4 bg-zinc-900 rounded-full group-hover:bg-brand-accent transition-all">
                      <Mail size={20} className="text-white" />
                   </div>
                    <div>
                       <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">Official Contact</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-white">Start a Project</span>
                    </div>
                </a>
             </div>

             <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/book"
                  className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-sm hover:bg-zinc-200 transition-all text-center flex items-center justify-center gap-3 group"
                >
                  Initiate Booking <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link 
                  href="/portfolio"
                  className="px-10 py-5 border border-white/10 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-sm hover:bg-white hover:text-black transition-all text-center"
                >
                  View Full Edit
                </Link>
             </div>
          </div>
          
          <div className="mt-32">
             <p className="text-[8px] font-black uppercase tracking-[1em] text-zinc-900 italic">RCV.MEDIA // FOUNDED 2024</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
          color: transparent;
        }
        .stroke-text:hover {
          -webkit-text-stroke: 1px rgba(255,255,255,1);
          transition: all 0.5s ease;
        }
      `}</style>
    </div>
  );
}
