"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/utils/analytics";

export default function HomePage() {
  const [featuredPhotos, setFeaturedPhotos] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [heroSetting, setHeroSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [newestGallery, setNewestGallery] = useState<any>(null);
  const [trendingGallery, setTrendingGallery] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // 1. Fetch site settings and active campaign
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select(`
          *,
          active_campaign:campaigns(*)
        `)
        .limit(1)
        .single();
        
      if (settingsData) {
        setHeroSetting(settingsData);
        if (settingsData.active_campaign) {
          setActiveCampaign(settingsData.active_campaign);
        }
      }

      // 2. Fetch Newest Featured Gallery
      const { data: newestData } = await supabase
        .from("albums")
        .select("*, photos(*)")
        .eq("is_private", false)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (newestData) setNewestGallery(newestData);

      // 3. Fetch Trending Gallery
      const { data: trendingData } = await supabase
        .from("albums")
        .select("*, photos(*)")
        .eq("is_private", false)
        .order("view_count", { ascending: false })
        .limit(1)
        .single();
      
      if (trendingData) setTrendingGallery(trendingData);

      // 4. Fetch Curated Photos
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
        const publicPhotos = photosData.filter(p => !p.albums || p.albums.is_private === false).slice(0, 12);
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

      {/* SEASONAL ALERT BANNER */}
      <AnimatePresence>
        {activeCampaign && (
          <motion.div 
            initial={{ y: -100 }} 
            animate={{ y: 0 }} 
            className="fixed top-0 left-0 right-0 z-[200] bg-brand-accent text-white px-6 py-3 overflow-hidden"
          >
             <div className="max-w-[3200px] mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <span className="px-2 py-0.5 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-sm animate-pulse">Active Season</span>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">{activeCampaign.title} is now open for booking</p>
                </div>
                <Link href={`/campaign/${activeCampaign.slug}`} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group">
                   Claim Offer <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
             </div>
             {/* Animated Progress/Scanning line */}
             <div className="absolute bottom-0 left-0 h-[1px] bg-white/40 animate-scan w-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. EDITORIAL SPLIT HERO */}
      <section className="relative w-full min-h-screen pt-24 md:pt-32 pb-24 px-6 flex flex-col md:flex-row items-center max-w-[3200px] mx-auto gap-12 overflow-hidden">
        
        {/* Left Side: Dramatic Typography */}
        <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10 pt-8 md:pt-0">

           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="mb-8"
           >
             <h1 className="text-6xl sm:text-7xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] text-white">
               Built For
             </h1>
             <h1 className="text-6xl sm:text-7xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-muted">
               The Moment.
             </h1>
           </motion.div>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
             className="text-lg md:text-xl text-zinc-400 font-light max-w-md leading-relaxed mb-12"
           >
             Portraits, seniors, sports, and events — captured with energy and style. Engineered for athletes, graduates, and moments that matter.
           </motion.p>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
             className="flex flex-col sm:flex-row gap-4"
           >
             {activeCampaign ? (
               <Link
                 href={`/campaign/${activeCampaign.slug}`}
                 className="group relative px-10 py-5 bg-brand-accent text-white font-black uppercase tracking-widest text-xs rounded-sm overflow-hidden text-center flex-1 sm:flex-none shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse"
               >
                 <span className="relative z-10">Claim {activeCampaign.title} Offer</span>
               </Link>
             ) : (
               <Link
                 href="/portfolio"
                 onClick={() => trackEvent('book_click', { location: 'hero_portfolio' })}
                 className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-sm overflow-hidden text-center flex-1 sm:flex-none"
               >
                 <div className="absolute inset-0 w-full h-full bg-brand-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                 <span className="relative z-10 group-hover:text-white transition-colors duration-500">View Portfolio</span>
               </Link>
             )}
             <Link
               href="/curated"
               className="px-10 py-5 premium-glass text-white font-black uppercase tracking-widest text-xs hover:border-brand-accent transition-all rounded-sm text-center border border-white/10 flex-1 sm:flex-none"
             >
               Explore The Vault
             </Link>
             <Link
               href="/book"
               onClick={() => trackEvent('book_click', { location: 'hero_main' })}
               className="px-10 py-5 premium-glass text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors rounded-sm text-center border border-white/10 flex-1 sm:flex-none"
             >
               Book a Shoot
             </Link>
           </motion.div>
        </div>

        {/* Right Side: Stacked Photo Collage */}
        <div className="w-full md:w-1/2 relative h-[50vh] sm:h-[60vh] md:h-[80vh]">
           <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 w-4/5 h-4/5 premium-placeholder rounded-2xl shadow-2xl overflow-hidden border border-white/10 z-0 bg-court-grid"
            >
               {heroImage ? (
                 <Image src={heroImage} alt="Hero image" fill className="object-cover object-[center_15%] opacity-80" priority />
               ) : (
                 <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-black opacity-80" />
               )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 left-0 w-2/3 h-2/3 premium-card rounded-2xl shadow-2xl overflow-hidden border border-white/10 z-10 flex items-center justify-center bg-court-grid"
            >
               {featuredPhotos[0]?.image_url ? (
                  <Image src={featuredPhotos[0].image_url} alt="Featured" fill className="object-cover object-[center_15%] opacity-90" />
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
             <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Latest Work</span>
           </motion.div>
        </div>
      </section>

      {/* 2. INFINITE MARQUEE */}
      <div className="w-full border-y border-white/5 bg-zinc-900/50 overflow-hidden py-4 premium-glass relative z-10 flex">
        <div className="flex whitespace-nowrap animate-marquee py-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Seniors</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Portraits</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Sports</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Events</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Graduation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Media Days</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
            </div>
          ))}
        </div>
        <div className="flex whitespace-nowrap animate-marquee py-2" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Seniors</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Portraits</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Sports</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Events</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Graduation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Media Days</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/50" />
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
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:min-h-[900px]">
            {/* Left Huge Card: NEWEST FEATURED GALLERY */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-8 premium-placeholder rounded-sm overflow-hidden group relative h-[600px] lg:h-full bg-court-grid"
            >
               {newestGallery ? (
                 <>
                   <Image 
                     src={newestGallery.photos?.[0]?.image_url || "/placeholder.jpg"} 
                     alt={newestGallery.title} 
                     fill 
                     className="object-cover object-[center_15%] transition-transform duration-[2s] group-hover:scale-[1.02]" 
                     priority
                   />
                   <Link href={`/gallery/${newestGallery.slug}`} className="absolute inset-0 z-20" />
                 </>
               ) : featuredPhotos[0]?.image_url ? (
                 <Image 
                    src={featuredPhotos[0].image_url} 
                    alt="Hero Feature" 
                    fill 
                    className="object-cover object-[center_15%] transition-transform duration-[2s] group-hover:scale-[1.02]" 
                    priority
                 />
               ) : (
                 <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
               )}
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
               <div className="absolute bottom-10 left-10 z-10">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 block mb-2 border border-white/20 px-3 py-1 rounded-full w-fit backdrop-blur-md flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" />
                    Latest Release
                 </span>
                  <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">{newestGallery?.title || "RCV Frame"}</h3>
               </div>
            </motion.div>

            {/* Right Stacked Cards: TRENDING & RECENT */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-full">
               {/* TRENDING CARD */}
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: 0.2 }}
                 className="flex-1 premium-placeholder rounded-sm overflow-hidden group relative min-h-[400px] bg-court-grid"
               >
                 {trendingGallery ? (
                   <>
                     <Image 
                       src={trendingGallery.photos?.[0]?.image_url || "/placeholder.jpg"} 
                       alt={trendingGallery.title} 
                       fill 
                       className="object-cover object-[center_15%] transition-transform duration-[2s] group-hover:scale-[1.02]" 
                     />
                     <Link href={`/gallery/${trendingGallery.slug}`} className="absolute inset-0 z-20" />
                   </>
                 ) : featuredPhotos[1]?.image_url ? (
                   <Image 
                     src={featuredPhotos[1].image_url} 
                     alt="Trending" 
                     fill 
                     className="object-cover object-[center_15%] transition-transform duration-[2s] group-hover:scale-[1.02]" 
                   />
                 ) : (
                   <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-950 border border-white/5" />
                 )}
                 <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
                 <div className="absolute bottom-6 left-6 z-10">
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-accent block mb-1">Trending Collection</span>
                   <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{trendingGallery?.title || "Master Archive"}</h3>
                 </div>
               </motion.div>

               {/* RECENT CURATED CARD */}
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: 0.4 }}
                 className="flex-1 premium-placeholder rounded-sm overflow-hidden group relative min-h-[400px] bg-court-grid"
               >
                 {featuredPhotos[2]?.image_url ? (
                   <Image 
                     src={featuredPhotos[2].image_url} 
                     alt="Recent" 
                     fill 
                     className="object-cover object-[center_15%] transition-transform duration-[2s] group-hover:scale-[1.02]" 
                   />
                 ) : (
                   <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-zinc-950 border border-white/5" />
                 )}
                 <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
                 <div className="absolute bottom-6 left-6 z-10">
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70 block mb-1">Recently Curated</span>
                   <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Visual Dossier</h3>
                 </div>
               </motion.div>
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
              { num: "01", title: "Seniors", desc: "Premium high school and college senior portraits." },
              { num: "02", title: "Portraits", desc: "Bold, cinematic profiles and editorial studio shots." },
              { num: "03", title: "Sports", desc: "High-octane action and game-winning moments." },
              { num: "04", title: "Events", desc: "Comprehensive tournament and corporate event coverage." },
              { num: "05", title: "Graduation", desc: "Cap & gown sessions that celebrate your achievement." },
              { num: "06", title: "Media Days", desc: "High-volume team media day experiences and headshots." }
            ].map((cat, i) => (
              <Link 
                key={cat.num} 
                href={`/portfolio?category=${cat.title.toLowerCase()}`} 
                onClick={() => trackEvent('portfolio_view', { category: cat.title })}
                className="group block h-[400px]"
              >
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
                     <h3 className="text-3xl font-black uppercase text-white mb-4 tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-brand-accent transition-all">{cat.title}</h3>
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-accent">The Moment</span>
                </h2>
                <p className="text-zinc-400 font-light text-lg leading-relaxed mb-10">
                  Delivering imagery that demands attention. From the intensity of a championship game to the milestone of a graduation day.
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
                { num: "01", title: "Senior Sessions", desc: "Creative and cinematic portraiture for high school and college seniors looking for something beyond the ordinary." },
                { num: "02", title: "Portrait Sessions", desc: "Professional headshots and artistic portraits designed to capture personality and style with premium lighting." },
                { num: "03", title: "Sports Coverage", desc: "Start-to-finish storytelling of the match, focusing on peak action, crowd emotion, and pivotal game-winning plays." },
                { num: "04", title: "Cap & Gown", desc: "Commemorate your achievement with high-end graduation sessions at your campus or preferred location." },
                { num: "05", title: "Team Media Days", desc: "High-volume, premium quality headshots, dramatic poses, and team content scaled for entire rosters." }
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

      {/* 6. RECENT FRAMES (GRID PREVIEW) */}
      <section className="py-20 relative z-10 border-t border-white/5 bg-zinc-950">
         <div className="max-w-[3200px] mx-auto px-6 mb-12 flex justify-between items-end">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Recent Frames</h2>
            <Link href="/portfolio" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">View Full Archive &rarr;</Link>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 px-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="aspect-[3/4] h-[500px] md:h-auto premium-placeholder rounded-sm border border-white/10 relative overflow-hidden group bg-court-grid"
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-muted">Capture?</span>
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
              onClick={() => trackEvent('book_click', { location: 'footer_cta' })}
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
