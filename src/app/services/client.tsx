"use client";

import { motion } from "framer-motion";
import { 
  Camera, User, Trophy, 
  Calendar, Zap, ArrowRight,
  ShieldCheck, Globe, Star,
  GraduationCap, Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SERVICES = [
  {
    id: "seniors",
    title: "Seniors",
    description: "Creative and high-end portrait sessions celebrating your milestone graduation year.",
    icon: Star,
    accent: "brand-accent",
    image: "https://images.unsplash.com/photo-1522071823991-b9677232c32f?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "portraits",
    title: "Portraits",
    description: "Clean and professional headshots, lifestyle sessions, and creative studio portraits.",
    icon: User,
    accent: "brand-accent",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: "sports",
    title: "Sports",
    description: "High-energy action coverage, game day photos, and cinematic player profiles.",
    icon: Trophy,
    accent: "brand-accent",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "events",
    title: "Events",
    description: "Comprehensive coverage for corporate events, community gatherings, and celebrations.",
    icon: Calendar,
    accent: "brand-accent",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: "graduation",
    title: "Graduation",
    description: "Cap & gown sessions celebrating your high school or college graduation on campus.",
    icon: GraduationCap,
    accent: "brand-accent",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "team-media-days",
    title: "Team Media Days",
    description: "Professional roster headshots, group photos, and premium media day packages.",
    icon: Users,
    accent: "brand-accent",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop"
  }
];

export function ServicesClient() {
  return (
    <div className="space-y-32 pb-32">
      {/* 1. SERVICE GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {SERVICES.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative h-[600px] rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-900"
          >
            <Image 
              src={service.image} 
              alt={service.title} 
              fill 
              className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            
            <div className="absolute inset-x-0 bottom-0 p-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                  <service.icon size={24} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-white italic">{service.title}</h3>
              </div>
              
              <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md">
                {service.description}
              </p>
              
              <Link 
                href="/book"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-brand-accent transition-all group/btn"
              >
                Book Now <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </section>

      {/* 2. OPERATIONAL STANDARDS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-zinc-950 border border-white/5 p-16 rounded-[4rem] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 blur-[120px] rounded-full" />
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="space-y-6">
                 <ShieldCheck className="text-brand-accent" size={40} />
                 <h4 className="text-2xl font-black uppercase tracking-tight text-white italic">Premium Standards</h4>
                 <p className="text-zinc-500 text-sm leading-relaxed font-medium">We deploy high-end professional cameras and premium lighting equipment to capture every detail with stunning clarity.</p>
              </div>
              <div className="space-y-6">
                 <Zap className="text-brand-accent" size={40} />
                 <h4 className="text-2xl font-black uppercase tracking-tight text-white italic">Rapid Delivery</h4>
                 <p className="text-zinc-500 text-sm leading-relaxed font-medium">Our optimized workflow ensures that your photos are edited and delivered through a private online gallery with industry-leading speed.</p>
              </div>
              <div className="space-y-6">
                 <Globe className="text-brand-accent" size={40} />
                 <h4 className="text-2xl font-black uppercase tracking-tight text-white italic">Seamless Interface</h4>
                 <p className="text-zinc-500 text-sm leading-relaxed font-medium">From booking your session to downloading your high-res photos, we provide a seamless and professional client experience.</p>
              </div>
           </div>
        </div>
      </section>

      {/* 3. FINAL CTA */}
      <section className="py-24 text-center space-y-12">
         <div className="space-y-4">
            <h2 className="text-7xl font-black uppercase tracking-tighter text-white italic leading-none">Ready to book a session?</h2>
            <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-xs">RCV.MEDIA PHOTOGRAPHY</p>
         </div>
         <Link 
            href="/contact"
            className="inline-flex items-center gap-4 px-16 py-8 bg-brand-accent text-black font-black uppercase tracking-widest text-xs rounded-full hover:brightness-110 transition-all shadow-brand-glow active:scale-95"
         >
            Book a Session <ArrowRight size={18} />
         </Link>
      </section>
    </div>
  );
}
