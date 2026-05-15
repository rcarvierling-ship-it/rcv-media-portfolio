"use client";

import { motion } from "framer-motion";
import { Camera, User, Trophy, Calendar, GraduationCap, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const services = [
  {
    id: "seniors",
    title: "Seniors",
    description: "Commemorate your final chapter with a session that reflects your personality and achievements.",
    icon: GraduationCap,
    accent: "pink-500",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop"
  },
  {
    id: "portraits",
    title: "Portraits",
    description: "Professional headshots, lifestyle sessions, and creative portraits tailored to your brand.",
    icon: User,
    accent: "violet-500",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: "sports",
    title: "Sports",
    description: "High-energy action coverage and cinematic athlete portraits that capture the intensity of the game.",
    icon: Trophy,
    accent: "blue-500",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "events",
    title: "Events",
    description: "Comprehensive coverage for parties, corporate events, and special gatherings.",
    icon: Calendar,
    accent: "orange-500",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: "graduation",
    title: "Graduation",
    description: "Celebrate your academic milestone with a dedicated cap & gown session on campus.",
    icon: GraduationCap,
    accent: "amber-500",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "media-days",
    title: "Team Media Days",
    description: "Professional media day experience for teams, including individual and group shots.",
    icon: Users,
    accent: "emerald-500",
    image: "https://images.unsplash.com/photo-1526232759583-26f1b7074b41?q=80&w=2069&auto=format&fit=crop"
  }
];

export function ServicesClient() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-900/20 blur-[150px] rounded-full" />
      </div>

      <div className="container-premium relative z-10">
        <header className="max-w-4xl mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-brand-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Services</span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.9]">
              Visual <br/> <span className="text-zinc-800 italic">Narratives</span>
            </h1>
            <p className="text-zinc-500 font-light text-lg md:text-xl leading-relaxed">
              Professional photography captured with energy and style. From the heat of the game to the quiet confidence of a portrait.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="premium-card rounded-sm group overflow-hidden border border-white/5 bg-zinc-900/10 hover:border-white/10 transition-all flex flex-col"
            >
              <div className="relative h-64 md:h-80 overflow-hidden">
                <Image 
                  src={service.image} 
                  alt={service.title} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute bottom-6 left-6">
                   <div className={`w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-4 text-white`}>
                      <service.icon size={20} />
                   </div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">{service.title}</h3>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <p className="text-zinc-500 text-sm md:text-base leading-relaxed mb-8 flex-1">
                  {service.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href={`/pricing`}
                    className="flex-1 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest text-center rounded-sm hover:bg-zinc-200 transition-all"
                  >
                    View Pricing
                  </Link>
                  <Link 
                    href={`/book`}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest text-center rounded-sm hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Book Now <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Philosophy */}
        <div className="mt-40 pt-24 border-t border-white/5">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                 <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-8 leading-none">
                    Energy and <br/> <span className="text-brand-accent">Surgical Style</span>
                 </h2>
                 <p className="text-zinc-500 text-lg leading-relaxed mb-10 font-light">
                    My approach is defined by intentionality. I don't just take photos; I hunt for the moments that define a career, a milestone, or a feeling. Every shot is a surgical execution of light, timing, and composition.
                 </p>
                 <div className="grid grid-cols-2 gap-10">
                    <div>
                       <span className="block text-3xl font-black text-white mb-2 tracking-tighter">100%</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Client Focus</span>
                    </div>
                    <div>
                       <span className="block text-3xl font-black text-white mb-2 tracking-tighter">48H</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Fast Turnaround</span>
                    </div>
                 </div>
              </div>
              <div className="relative aspect-video lg:aspect-square rounded-sm overflow-hidden border border-white/5">
                 <Image 
                   src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop" 
                   alt="Reese Vierling" 
                   fill 
                   className="object-cover"
                 />
                 <div className="absolute inset-0 bg-brand-accent/10 mix-blend-overlay" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
