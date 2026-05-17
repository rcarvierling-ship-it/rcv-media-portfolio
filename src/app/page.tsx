"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { trackEvent } from "@/utils/analytics";

export default function HomePage() {
  const [featuredPhotos, setFeaturedPhotos] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [heroSetting, setHeroSetting] = useState<any>(null);
  const [heroPhoto, setHeroPhoto] = useState<any | null>(null);
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
        
        // Fetch matching hero photo details for dynamic EXIF tags
        if (settingsData.hero_image_url) {
          const { data: pData } = await supabase
            .from("photos")
            .select("*")
            .eq("image_url", settingsData.hero_image_url)
            .limit(1);
          if (pData && pData.length > 0) {
            setHeroPhoto(pData[0]);
          }
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
      
      if (newestData) {
        if (newestData.photos) {
          newestData.photos = newestData.photos.filter((p: any) => p.is_curated);
        }
        setNewestGallery(newestData);
      }

      // 3. Fetch Trending Gallery
      const { data: trendingData } = await supabase
        .from("albums")
        .select("*, photos(*)")
        .eq("is_private", false)
        .order("view_count", { ascending: false })
        .limit(1)
        .single();
      
      if (trendingData) {
        if (trendingData.photos) {
          trendingData.photos = trendingData.photos.filter((p: any) => p.is_curated);
        }
        setTrendingGallery(trendingData);
      }

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
    <div className="w-full bg-background min-h-screen font-sans selection:bg-primary selection:text-primary-foreground text-foreground">
      {/* Global Noise Texture */}
      <div className="fixed inset-0 z-[100] bg-ambient pointer-events-none opacity-50" />

      {/* SEASONAL ALERT BANNER */}
      <AnimatePresence>
        {activeCampaign && (
          <motion.div 
            initial={{ y: -100 }} 
            animate={{ y: 0 }} 
            className="fixed top-0 left-0 right-0 z-[200] bg-primary text-primary-foreground px-6 py-3 overflow-hidden shadow-lg border-b border-white/5"
          >
             <div className="max-w-[3200px] mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <span className="px-2 py-0.5 bg-brand-accent text-black text-[8px] font-black uppercase tracking-widest rounded-sm">Active Season</span>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">{activeCampaign.title} is now open for booking</p>
                </div>
                <Link href={`/campaign/${activeCampaign.slug}`} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group">
                   Claim Offer <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. EDITORIAL SPLIT HERO */}
      <section className="relative w-full min-h-screen pt-40 md:pt-48 pb-24 px-6 flex flex-col md:flex-row items-center max-w-[3200px] mx-auto gap-12 overflow-hidden">
        
        {/* Left Side: Dramatic Typography */}
        <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10 pt-8 md:pt-0">
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="mb-10"
           >
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent mb-6 block border-l-4 border-brand-accent pl-4">RCV.MEDIA Portfolio</span>
             <h1 className="text-6xl sm:text-7xl md:text-[8vw] font-black uppercase tracking-tighter leading-[0.8] text-foreground mb-4">
               Precision <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white italic">Visuals.</span>
             </h1>
           </motion.div>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
             className="text-lg md:text-xl text-zinc-500 font-medium max-w-lg leading-relaxed mb-16"
           >
             High-end portraiture and athletic media for those who demand excellence. Captured with precision, delivered with speed.
           </motion.p>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
             className="flex flex-wrap gap-4"
           >
             {activeCampaign ? (
               <Link
                 href={`/campaign/${activeCampaign.slug}`}
                 className="group relative px-12 py-5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-full overflow-hidden text-center flex-1 sm:flex-none shadow-2xl transition-all hover:scale-105 active:scale-95"
               >
                 <span className="relative z-10">Claim {activeCampaign.title} Offer</span>
               </Link>
             ) : (
               <Link
                 href="/portfolio"
                 className="group relative px-12 py-5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-full overflow-hidden text-center flex-1 sm:flex-none shadow-2xl transition-all hover:scale-105 active:scale-95"
               >
                 <span className="relative z-10">View Portfolio</span>
               </Link>
             )}
             <Link
               href="/book"
               className="px-12 py-5 bg-brand-accent text-black font-black uppercase tracking-widest text-[10px] hover:bg-brand-accent/90 transition-all rounded-full text-center flex-1 sm:flex-none shadow-brand-glow active:scale-95"
             >
               Book Session
             </Link>
           </motion.div>
        </div>

        {/* Right Side: Large Editorial Frame */}
        <div className="w-full md:w-1/2 relative h-[60vh] md:h-[85vh]">
           <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-card border border-white/5 rounded-[3rem] shadow-premium overflow-hidden group"
            >
               {heroImage ? (
                 <Image src={heroImage} alt="Hero image" fill className="object-cover object-[center_15%] transition-transform duration-[3s] group-hover:scale-105" priority />
               ) : (
                 <div className="absolute inset-0 bg-zinc-100" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
               
               {/* Metadata Overlay (Concept Style) */}
               <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                  <div>
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent mb-2 block">Featured Work</span>
                     <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Featured Collections</h2>
                  </div>
                  <div className="hidden lg:flex gap-2">
                     <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[8px] font-black uppercase text-white tracking-widest">
                       ISO {heroPhoto?.iso || featuredPhotos[0]?.iso || "100"}
                     </div>
                     <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[8px] font-black uppercase text-white tracking-widest">
                       {heroPhoto?.aperture 
                         ? (heroPhoto.aperture.includes('f/') ? heroPhoto.aperture : `f/${heroPhoto.aperture}`) 
                         : (featuredPhotos[0]?.aperture 
                             ? (featuredPhotos[0].aperture.includes('f/') ? featuredPhotos[0].aperture : `f/${featuredPhotos[0].aperture}`) 
                             : "f/1.2")}
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* Floating Chip */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-12 left-12 z-20 bg-card px-6 py-3 rounded-full border border-white/10 shadow-2xl flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse shadow-brand-glow" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Now Booking</span>
            </motion.div>
        </div>
      </section>

      {/* 2. INFINITE MARQUEE */}
      <div className="w-full border-y border-white/5 bg-card/50 overflow-hidden py-4 premium-glass relative z-10 flex">
        <div className="flex whitespace-nowrap animate-marquee py-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Seniors</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Portraits</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Sports</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Events</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Graduation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Media Days</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. FEATURED WORK (MAGAZINE GRID) */}
      <section className="py-32 relative z-10 bg-background">
        <div className="max-w-[3200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
            <div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground mb-2 leading-none">The Edit</h2>
              <p className="text-secondary-foreground font-black uppercase tracking-[0.2em] text-[10px]">Selected Editorial Highlights</p>
            </div>
            <Link href="/portfolio" className="text-foreground hover:text-zinc-600 uppercase tracking-[0.2em] text-[10px] font-black pb-1 border-b border-foreground hover:border-zinc-400 transition-all w-fit">
              Explore Archive <ArrowUpRight size={12} className="inline ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:min-h-[900px]">
            {/* Left Huge Card: NEWEST FEATURED GALLERY */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-8 rounded-[2.5rem] overflow-hidden group relative h-[600px] lg:h-full bg-zinc-100 shadow-premium border border-border"
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
                 <div className="absolute inset-0 bg-zinc-100" />
               )}
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
               <div className="absolute bottom-12 left-12 z-10">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white block mb-4 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full w-fit flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-accent rounded-full shadow-brand-glow" />
                    Latest release
                 </span>
                  <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white italic">{newestGallery?.title || "RCV Frame"}</h3>
               </div>
            </motion.div>

            {/* Right Stacked Cards: TRENDING & RECENT */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
               {/* TRENDING CARD */}
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: 0.2 }}
                 className="flex-1 rounded-[2.5rem] overflow-hidden group relative min-h-[400px] bg-secondary border border-white/5 shadow-premium"
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
                   <div className="absolute inset-0 bg-secondary" />
                 )}
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                 <div className="absolute bottom-8 left-8 z-10">
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-accent block mb-2">Trending Collection</span>
                   <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{trendingGallery?.title || "Master Archive"}</h3>
                 </div>
               </motion.div>

               {/* RECENT CURATED CARD */}
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, delay: 0.4 }}
                 className="flex-1 rounded-[2.5rem] overflow-hidden group relative min-h-[400px] bg-secondary border border-white/5 shadow-premium"
               >
                 {featuredPhotos[2]?.image_url ? (
                   <Image 
                     src={featuredPhotos[2].image_url} 
                     alt="Recent" 
                     fill 
                     className="object-cover object-[center_15%] transition-transform duration-[2s] group-hover:scale-[1.02]" 
                   />
                 ) : (
                   <div className="absolute inset-0 bg-secondary" />
                 )}
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                 <div className="absolute bottom-8 left-8 z-10">
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70 block mb-2">Recently Curated</span>
                   <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Curated Work</h3>
                 </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NUMBERED DISCIPLINES */}
      <section className="py-32 relative z-10 border-t border-white/5 bg-background">
        <div className="max-w-[3200px] mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground mb-4 leading-none">Specialties</h2>
            <p className="text-secondary-foreground font-light max-w-xl text-lg">Mastering the art of motion, portraiture, and narrative across all fields of play.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                className="group block h-[450px]"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-card p-12 rounded-[2.5rem] h-full relative overflow-hidden transition-all duration-500 group-hover:-translate-y-2 border border-white/5 hover:border-brand-accent hover:shadow-2xl hover:shadow-brand-glow/10 shadow-premium"
                >
                  <div className="absolute top-12 right-12 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                    {cat.num}
                  </div>
                  
                  <div className="absolute bottom-10 left-10 pr-10">
                     <h3 className="text-3xl font-black uppercase text-foreground mb-4 tracking-tighter group-hover:text-brand-accent transition-all">{cat.title}</h3>
                     <p className="text-secondary-foreground text-sm font-medium leading-relaxed max-w-[200px]">{cat.desc}</p>
                  </div>
                  
                  {/* Hover Arrow */}
                  <div className="absolute bottom-10 right-10 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    <ArrowUpRight size={20} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. STICKY SPLIT LAYOUT (EXPERIENCE) */}
      <section className="relative z-10 border-t border-white/5 bg-background">
        <div className="max-w-[3200px] mx-auto px-6 py-20 md:py-32">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            {/* Sticky Left Column */}
            <div className="lg:w-1/3 relative">
              <div className="sticky top-40">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-6 border border-white/5 px-4 py-1.5 rounded-full w-fit">Services</span>
                <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-foreground leading-[0.9] mb-8">
                  Built For <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white">The Moment</span>
                </h2>
                <p className="text-secondary-foreground font-light text-lg leading-relaxed mb-10">
                  Delivering imagery that demands attention. From the intensity of a championship game to the milestone of a graduation day.
                </p>
                <Link
                  href="/book"
                  className="inline-block px-12 py-5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-full hover:brightness-110 transition-colors shadow-xl shadow-black/10"
                >
                  Inquire Now
                </Link>
              </div>
            </div>

            {/* Scrolling Right Column (Stacked Cards) */}
            <div className="lg:w-2/3 flex flex-col gap-8">
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
                  className="bg-card p-12 md:p-16 rounded-[3rem] border border-white/5 flex flex-col md:flex-row gap-10 items-start hover:border-brand-accent transition-all duration-500 shadow-premium hover:shadow-2xl"
                >
                  <div className="text-6xl font-black text-white/5 w-24 leading-none">
                    {service.num}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-4">{service.title}</h3>
                    <p className="text-secondary-foreground font-light leading-relaxed max-w-xl">{service.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. RECENT FRAMES (GRID PREVIEW) */}
      <section className="py-20 relative z-10 border-t border-white/5 bg-background">
         <div className="max-w-[3200px] mx-auto px-6 mb-12 flex justify-between items-end">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">Recent Frames</h2>
            <Link href="/portfolio" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-foreground">View Full Archive <ArrowUpRight size={12} className="inline ml-1" /></Link>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 px-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="aspect-[3/4] h-[500px] md:h-auto rounded-3xl border border-white/5 relative overflow-hidden group bg-secondary"
              >
                 {featuredPhotos[i]?.image_url ? (
                   <Image src={featuredPhotos[i].image_url} alt="Recent Frame" fill className="object-cover transition-all duration-700" />
                 ) : (
                   <div className="absolute inset-0 bg-secondary" />
                 )}
                 <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                 <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">View Frame</span>
                 </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* 7. MASSIVE CTA */}
      <section className="py-40 relative z-10 border-t border-white/5 overflow-hidden bg-background">
        <div className="absolute inset-0 opacity-10 z-0 bg-court-grid" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10vw] md:text-9xl font-black uppercase tracking-tighter text-foreground mb-16 leading-none"
          >
            Ready To <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white">Capture?</span>
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
              className="px-16 py-7 bg-brand-accent text-black font-black uppercase tracking-[0.2em] text-sm rounded-full hover:bg-brand-accent/90 transition-all hover:scale-110 active:scale-95 shadow-brand-glow"
            >
              Book a Shoot
            </Link>
            <Link
              href="/portfolio"
              className="px-16 py-7 bg-card border border-white/5 text-foreground font-black uppercase tracking-[0.2em] text-sm rounded-full hover:bg-secondary transition-all hover:scale-105 active:scale-95 shadow-premium"
            >
              View Archive
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
