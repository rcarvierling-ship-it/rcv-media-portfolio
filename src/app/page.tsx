"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import SplashLoader from "@/components/SplashLoader";

export default function HomePage() {
  const [featuredPhotos, setFeaturedPhotos] = useState<any[]>([]);
  const [heroSetting, setHeroSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();
        
      if (settingsData) {
        setHeroSetting(settingsData);
      }

      const { data: photosData } = await supabase
        .from("photos")
        .select(`
          *,
          albums!left (
            is_private
          )
        `)
        .eq("is_featured", true)
        .order("created_at", { ascending: false });
        
      if (photosData) {
        // Filter out photos from private albums
        const publicPhotos = photosData.filter(p => !p.albums || p.albums.is_private === false).slice(0, 6);
        setFeaturedPhotos(publicPhotos);
      }
      
      setLoading(false);
    }
    fetchData();
  }, []);

  const heroImage = heroSetting?.hero_image_url;

  return (
    <div className="w-full bg-zinc-950 min-h-screen font-sans selection:bg-white selection:text-black">
      <SplashLoader />
      {/* Global Noise Texture */}
      <div className="fixed inset-0 z-[100] bg-ambient pointer-events-none" />

      {/* 1. EDITORIAL SPLIT HERO */}
      <section className="relative w-full min-h-screen pt-32 pb-24 px-6 flex flex-col md:flex-row items-center max-w-screen-2xl mx-auto gap-12 overflow-hidden">
        
        {/* Left Side: Dramatic Typography */}
        <div className="flex-1 z-10 flex flex-col items-start text-left">
           <motion.div
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 1, ease: "easeOut" }}
           >
              <span className="block text-blue-500 font-black uppercase tracking-[0.4em] text-xs mb-8">Established 2024</span>
              <h1 className="text-[12vw] md:text-[8vw] font-black leading-[0.8] uppercase tracking-tighter text-white mb-10 mix-blend-difference">
                 The Art <br/> of <span className="text-zinc-800 italic">Motion</span>
              </h1>
              <p className="max-w-md text-zinc-400 font-light text-lg leading-relaxed mb-12 uppercase tracking-wide">
                 {heroSetting?.about_bio || "Capturing the raw emotion, intensity, and fleeting moments that define the human experience in motion."}
              </p>
              
              <div className="flex flex-wrap gap-6">
                 <Link href="/portfolio" className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs overflow-hidden">
                    <span className="relative z-10">View Portfolio</span>
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                 </Link>
                 <Link href="/book" className="px-10 py-5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all duration-500">
                    Book a Shoot
                 </Link>
              </div>
           </motion.div>
        </div>

        {/* Right Side: Large Scale Media Showcase */}
        <div className="flex-1 relative w-full h-[60vh] md:h-[80vh]">
           <motion.div
             initial={{ opacity: 0, scale: 1.1 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="w-full h-full relative"
           >
              {/* Main Image Container */}
              <div className="absolute inset-0 border border-white/5 overflow-hidden">
                 <img 
                   src={heroImage || "https://images.unsplash.com/photo-1541252876101-08144b679468?q=80&w=2070&auto=format&fit=crop"} 
                   className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 transition-all duration-1000"
                   alt="Hero"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              </div>

              {/* Floating Accents */}
              <div className="absolute -bottom-10 -left-10 p-10 bg-zinc-950 border border-white/5 hidden lg:block backdrop-blur-xl">
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-2">Portfolio Selection</p>
                 <h4 className="text-white text-xl font-black uppercase tracking-tighter italic">Shot on Location</h4>
              </div>
           </motion.div>
        </div>
      </section>

      {/* 2. THE AGENCY STATEMENT */}
      <section className="py-40 bg-zinc-900/20">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 1 }}
            >
               <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-10 max-w-4xl mx-auto leading-none">
                  A Boutique Agency focused on <span className="text-blue-500">Elite Athletes</span> & Cinematic Brands.
               </h2>
               <div className="w-20 h-1 bg-blue-600 mx-auto" />
            </motion.div>
         </div>
      </section>

      {/* 3. FEATURED WORK (The Wall) */}
      <section className="py-40">
         <div className="max-w-screen-2xl mx-auto px-6">
            <div className="flex justify-between items-end mb-20">
               <div>
                  <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Archive 01</span>
                  <h2 className="text-7xl font-black uppercase tracking-tighter text-white">The Work</h2>
               </div>
               <Link href="/portfolio" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                  View All Captures <span className="text-blue-500">→</span>
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {featuredPhotos.map((photo, i) => (
                 <motion.div
                   key={photo.id}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1, duration: 0.8 }}
                   className="group relative aspect-[4/5] overflow-hidden bg-zinc-900 border border-white/5"
                 >
                    <img 
                      src={photo.image_url} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100"
                      alt={photo.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-10 left-10 translate-y-10 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                       <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">{photo.category || "Lifestyle"}</p>
                       <h3 className="text-white text-2xl font-black uppercase tracking-tighter">{photo.title}</h3>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="py-60 relative overflow-hidden">
         {/* Background Text */}
         <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
            <h2 className="text-[30vw] font-black uppercase leading-none">RCV.MEDIA</h2>
         </div>

         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1 }}
            >
               <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-10 leading-none">Ready to start <br/> the <span className="italic text-zinc-700">Project?</span></h2>
               <p className="text-zinc-500 text-lg uppercase tracking-widest mb-12 font-light">Availability for Q2 2024 is limited.</p>
               <Link href="/book" className="inline-block px-16 py-8 bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-sm hover:bg-blue-700 hover:scale-105 transition-all duration-500 shadow-[0_0_50px_rgba(37,99,235,0.3)]">
                  Secure Your Date
               </Link>
            </motion.div>
         </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-20 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
               <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">RCV<span className="text-zinc-700">.</span>MEDIA</h3>
               <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">All Assets Protected by Copyright © 2024</p>
            </div>
            
            <div className="flex gap-12">
               <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2">Connect</span>
                  <a href="#" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Instagram</a>
                  <a href="#" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">LinkedIn</a>
               </div>
               <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2">Navigation</span>
                  <Link href="/portfolio" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Portfolio</Link>
                  <Link href="/dashboard" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Admin Portal</Link>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
