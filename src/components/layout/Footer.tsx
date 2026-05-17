"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  return (
    <footer className="relative bg-zinc-950 overflow-hidden border-t border-white/5">
      {/* Luxury Grid Background */}
      <div className="absolute inset-0 bg-court-grid opacity-10 pointer-events-none" />
      
      <div className="container-premium pt-32 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="md:col-span-2">
            <h2 className="text-4xl font-black tracking-tighter uppercase text-white mb-6 leading-none italic">
              Capture <br/>The Moment.
            </h2>
            <p className="text-zinc-400 max-w-sm font-light leading-relaxed mb-10 text-lg">
              Portraits, seniors, sports, and events — captured with energy and style. Built for athletes, graduates, and brands.
            </p>
            <Link 
              href="/book"
              className="inline-block px-10 py-5 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-brand-glow hover:scale-[1.02] transition-all rounded-full"
            >
              Book a Shoot
            </Link>
          </div>
          
          <div className="flex flex-col gap-10 md:col-span-1">
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] border-b border-white/5 pb-4 w-fit">Explore</h3>
            <div className="flex flex-col gap-5 text-[11px] font-black text-white uppercase tracking-widest">
              <Link href="/portfolio" className="hover:text-brand-accent transition-colors w-fit">Portfolio</Link>
              <Link href="/services" className="hover:text-brand-accent transition-colors w-fit">Services</Link>
              <Link href="/pricing" className="hover:text-brand-accent transition-colors w-fit">Pricing</Link>
              <Link href="/about" className="hover:text-brand-accent transition-colors w-fit">About</Link>
              <Link href="/book" className="hover:text-brand-accent transition-colors w-fit">Contact</Link>
            </div>
          </div>
          
          <div className="flex flex-col gap-10 md:col-span-1">
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] border-b border-white/5 pb-4 w-fit">Connect</h3>
            <div className="flex flex-col gap-5 text-[11px] font-black text-white uppercase tracking-widest">
              <a href="https://www.instagram.com/rcv.media/" target="_blank" rel="noreferrer" className="hover:text-brand-accent transition-colors w-fit">
                Instagram
              </a>
              <a href="mailto:info@rcv-media.com" className="hover:text-brand-accent transition-colors w-fit">
                Email
              </a>
            </div>
          </div>
        </div>
        
        {/* Massive Wordmark */}
        <div className="w-full mb-12 overflow-hidden flex justify-center">
          <h1 className="text-[15vw] md:text-[18vw] font-black tracking-tighter uppercase text-white/[0.02] leading-none select-none italic">
            RCV.MEDIA
          </h1>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5">
          <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">
            © {new Date().getFullYear()} Reese Vierling.
          </span>
          <div className="flex gap-10">
            <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase hover:text-white transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
