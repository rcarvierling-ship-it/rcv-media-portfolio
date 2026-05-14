"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function AboutClient({ data }: { data: any }) {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="fixed inset-0 z-[100] bg-ambient pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 h-full flex flex-col md:flex-row items-center gap-16 lg:gap-24">
        
        {/* Left Side: Cinematic Portrait */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="w-full md:w-1/2 relative aspect-[3/4] premium-card rounded-3xl overflow-hidden border border-white/10"
        >
          <Image
            src={data.imageUrl}
            alt={data.titleFirst + " " + data.titleLast}
            fill
            className="object-cover transition-all duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-zinc-950 opacity-40 hidden md:block" />
        </motion.div>
        
        {/* Right Side: Editorial Text */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-2 text-white leading-none">
              {data.titleFirst}
            </h1>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-800 leading-none">
              {data.titleLast}
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="space-y-6 text-zinc-400 font-light text-lg leading-relaxed mb-12 max-w-xl"
          >
            <div className="whitespace-pre-line">
              {data.bio}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link 
              href="/book"
              className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-sm hover:bg-zinc-200 transition-colors text-center"
            >
              Book a Shoot
            </Link>
            <Link 
              href="/portfolio"
              className="px-10 py-5 premium-glass text-white font-black uppercase tracking-widest text-xs rounded-sm hover:bg-white/10 transition-colors text-center"
            >
              View Work
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
