"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

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
        .eq("is_curated", true)
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
      {/* Global Noise Texture */}
      <div className="fixed inset-0 z-[100] bg-ambient pointer-events-none" />

      {/* 1. EDITORIAL SPLIT HERO */}
      <section className="relative w-full min-h-screen pt-24 md:pt-32 pb-24 px-6 flex flex-col md:flex-row items-center max-w-[3200px] mx-auto gap-12 overflow-hidden">
        
        {/* Left Side: Dramatic Typography */}
        <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10 pt-8 md:pt-0">
           {/* Vertical Label */}
           <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-black tracking-[0.3em] uppercase text-zinc-600 hidden xl:block">
             RCV.MEDIA // SPORTS PHOTOGRAPHY
           </div>

           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="mb-8"
           >
             <h1 className="text-[12vw] md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] text-white">
               Built For
             </h1>
             <h1 className="text-[12vw] md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-800">
               The Moment.
             </h1>
           </motion.div>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
             className="text-lg md:text-xl text-zinc-400 font-light max-w-md leading-relaxed mb-12"
           >
             Premium sports, lifestyle, and event photography engineered for athletes, brands, and moments that move fast.
           </motion.p>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
             className="flex flex-col sm:flex-row gap-6"
           >
             <Link
               href="/portfolio"
               className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-sm overflow-hidden text-center"
             >
               <div className="absolute inset-0 w-full h-full bg-blue-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
               <span className="relative z-10 group-hover:text-white transition-colors duration-500">View Portfolio</span>
             </Link>
             <Link
               href="/book"
               className="px-10 py-5 premium-glass text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors rounded-sm text-center border border-white/10"
             >
               Book a Shoot
             </Link>
           </motion.div>
        </div>

        {/* Right Side: Stacked Photo Collage */}
        <div className="w-full md:w-1/2 relative h-[60vh] md:h-[80vh]">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
             animate={{ opacity: 1, scale: 1, rotate: 0 }}
             transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
             className="absolute top-0 right-0 w-4/5 h-4/5 premium-placeholder rounded-2xl shadow-2xl overflow-hidden border border-white/10 z-0 bg-court-grid"
           >
              {heroImage ? (
                <Image src={heroImage} alt="Hero image" fill className="object-cover opacity-80" priority />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-zinc-900 to-black opacity-80" />
              )}
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: 50, y: 50 }}
             animate={{ opacity: 1, x: 0, y: 0 }}
             transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
             className="absolute bottom-0 left-0 w-2/3 h-2/3 premium-card rounded-2xl shadow-2xl overflow-hidden border border-white/10 z-10 flex items-center justify-center bg-court-grid"
           >
              {featuredPhotos[0]?.image_url ? (
                 <Image src={featuredPhotos[0].image_url} alt="Featured" fill className="object-cover opacity-90" />
              ) : (
                 <div className="text-center p-6">
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-600 block mb-2">RCV.MEDIA</span>
                    <span className="text-xl font-black uppercase text-zinc-800">Visuals</span>
                 </div>
              )}
           </motion.div>

           {/* Latest Work Floating Chip */}
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
             className="absolute top-12 left-0 z-20 premium-glass px-6 py-3 rounded-full border border-white/20 shadow-2xl flex items-center gap-3 backdrop-blur-2xl"
           >
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Latest Work</span>
           </motion.div>
        </div>
      </section>

      {/* 2. INFINITE MARQUEE */}
      <div className="w-full border-y border-white/5 bg-zinc-900/50 overflow-hidden py-4 premium-glass relative z-10 flex">
        <div className="flex whitespace-nowrap animate-marquee py-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Sports Photography</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Athlete Portraits</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Tournament Coverage</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Team Media Days</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Louisville KY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
            </div>
          ))}
        </div>
        <div className="flex whitespace-nowrap animate-marquee py-2" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Sports Photography</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Athlete Portraits</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Tournament Coverage</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Team Media Days</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Louisville KY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. FEATURED WORK (MAGAZINE GRID) */}
      <section className="py-32 relative z-10 bg-zinc-950">
        <div className="max-w-[3200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
            <div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-2 leading-none">The Edit</h2>
              <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">Selected Editorial Highlights</p>
            </div>
            <Link href="/portfolio" className="text-white hover:text-zinc-400 uppercase tracking-[0.2em] text-[10px] font-black pb-1 border-b border-white hover:border-zinc-400 transition-all w-fit">
              Explore Archive &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[800px]">
            {/* Left Huge Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-8 premium-placeholder rounded-sm overflow-hidden group relative h-[500px] lg:h-full bg-court-grid"
            >
               {featuredPhotos[0]?.image_url ? (
                 <Image src={featuredPhotos[0].image_url} alt="Hero Feature" fill className="object-cover transition-transform duration-[2s] group-hover:scale-[1.02]" />
               ) : (
                 <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
               )}
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
               <div className="absolute bottom-10 left-10">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 block mb-2 border border-white/20 px-3 py-1 rounded-full w-fit backdrop-blur-md">Featured Gallery</span>
                 <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">{featuredPhotos[0]?.title || "Gallery Curating"}</h3>
               </div>
            </motion.div>

            {/* Right Stacked Cards */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-full">
               {[1, 2].map((i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.8, delay: i * 0.2 }}
                   className="flex-1 premium-placeholder rounded-sm overflow-hidden group relative min-h-[300px] bg-court-grid"
                 >
                   {featuredPhotos[i]?.image_url ? (
                     <Image src={featuredPhotos[i].image_url} alt={`Feature ${i}`} fill className="object-cover transition-transform duration-[2s] group-hover:scale-[1.02]" />
                   ) : (
                     <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-950 border border-white/5" />
                   )}
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
                   <div className="absolute bottom-6 left-6">
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70 block mb-1">{featuredPhotos[i]?.category || "Editorial"}</span>
                     <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{featuredPhotos[i]?.title || "Coming Soon"}</h3>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. NUMBERED DISCIPLINES */}
      <section className="py-32 relative z-10 border-t border-white/5 bg-zinc-950">
        <div className="max-w-[3200px] mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 leading-none">Specialties</h2>
            <p className="text-zinc-500 font-light max-w-xl text-lg">Mastering the art of motion, portraiture, and narrative across all fields of play.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Sports", desc: "High-octane action and game-winning moments." },
              { num: "02", title: "Basketball", desc: "Hardwood coverage from tip-off to the final buzzer." },
              { num: "03", title: "Volleyball", desc: "Court-side intensity and dynamic vertical plays." },
              { num: "04", title: "Portraits", desc: "Bold, cinematic athlete profiles and editorial shots." },
              { num: "05", title: "Lifestyle", desc: "Brand narratives and off-court authentic moments." },
              { num: "06", title: "Events", desc: "Comprehensive tournament and media day coverage." }
            ].map((cat, i) => (
              <Link key={cat.num} href={`/portfolio?category=${cat.title.toLowerCase()}`} className="group block h-[400px]">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="premium-placeholder bg-court-grid p-10 rounded-sm h-full relative overflow-hidden transition-all duration-500 group-hover:-translate-y-2 border border-white/5 hover:border-white/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                >
                  <div className="absolute top-10 right-10 text-5xl font-black text-zinc-800/30 group-hover:text-zinc-700/50 transition-colors">
                    {cat.num}
                  </div>
                  
                  <div className="absolute bottom-10 left-10 pr-10">
                     <h3 className="text-3xl font-black uppercase text-white mb-4 tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-500 transition-all">{cat.title}</h3>
                     <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-[200px]">{cat.desc}</p>
                  </div>
                  
                  {/* Hover Arrow */}
                  <div className="absolute bottom-10 right-10 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. STICKY SPLIT LAYOUT (EXPERIENCE) */}
      <section className="relative z-10 border-t border-white/5 bg-zinc-950">
        <div className="max-w-[3200px] mx-auto px-6 py-20 md:py-32">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            {/* Sticky Left Column */}
            <div className="lg:w-1/3 relative">
              <div className="sticky top-40">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-6 border border-zinc-800 px-3 py-1 rounded-full w-fit">Services</span>
                <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-8">
                  Built For <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-800">The Moment</span>
                </h2>
                <p className="text-zinc-400 font-light text-lg leading-relaxed mb-10">
                  Delivering imagery that demands attention. From the intensity of a championship game to the sleek aesthetic of a media day.
                </p>
                <Link
                  href="/book"
                  className="inline-block px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-sm hover:bg-zinc-200 transition-colors"
                >
                  Inquire Now
                </Link>
              </div>
            </div>

            {/* Scrolling Right Column (Stacked Cards) */}
            <div className="lg:w-2/3 flex flex-col gap-6">
              {[
                { num: "01", title: "Game Day Coverage", desc: "Start-to-finish storytelling of the match, focusing on peak action, crowd emotion, and pivotal plays." },
                { num: "02", title: "Athlete Portraits", desc: "Studio-quality lighting and cinematic direction brought to any location to build powerful athlete brands." },
                { num: "03", title: "Team Media Days", desc: "High-volume, premium quality headshots, dramatic poses, and team content scaled for entire rosters." },
                { num: "04", title: "Tournament Coverage", desc: "Multi-day endurance shooting covering multiple courts, brackets, and championship ceremonies." },
                { num: "05", title: "Lifestyle Content", desc: "Off-court editorial imagery for apparel brands, sponsorships, and social media campaigns." }
              ].map((service, i) => (
                <motion.div 
                  key={service.num}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="premium-card p-12 md:p-16 rounded-sm border border-white/5 flex flex-col md:flex-row gap-8 items-start hover:border-white/20 transition-colors duration-500"
                >
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-800 w-20">
                    {service.num}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">{service.title}</h3>
                    <p className="text-zinc-400 font-light leading-relaxed max-w-xl">{service.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. RECENT FRAMES (HORIZONTAL SCROLL PREVIEW) */}
      <section className="py-20 relative z-10 border-t border-white/5 bg-zinc-950 overflow-hidden">
         <div className="max-w-[3200px] mx-auto px-6 mb-12 flex justify-between items-end">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Recent Frames</h2>
         </div>
         
         {/* Horizontal Scroll Track */}
         <div className="flex gap-4 px-6 overflow-x-auto pb-8 hide-scrollbar snap-x w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="min-w-[300px] md:min-w-[400px] h-[500px] premium-placeholder rounded-sm border border-white/10 shrink-0 snap-center relative overflow-hidden group bg-court-grid"
              >
                 {featuredPhotos[i]?.image_url ? (
                   <Image src={featuredPhotos[i].image_url} alt="Recent Frame" fill className="object-cover transition-all duration-700" />
                 ) : (
                   <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-black" />
                 )}
                 <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">View Frame</span>
                 </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* 7. MASSIVE CTA */}
      <section className="py-40 relative z-10 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 premium-placeholder bg-court-grid opacity-50 z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-0" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10vw] md:text-9xl font-black uppercase tracking-tighter text-white mb-16 leading-none"
          >
            Ready To <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">Capture?</span>
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link
              href="/book"
              className="px-14 py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-sm hover:bg-zinc-200 transition-all hover:scale-105 transform duration-300"
            >
              Book a Shoot
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
