import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative bg-zinc-950 overflow-hidden border-t border-zinc-900/50">
      {/* Luxury Grid Background */}
      <div className="absolute inset-0 bg-court-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-white mb-6">
              Capture <br/>The Moment.
            </h2>
            <p className="text-zinc-500 max-w-sm font-light leading-relaxed mb-8 text-lg">
              Premium sports, lifestyle, and event photography built for athletes, brands, and moments that move fast.
            </p>
            <Link 
              href="/book"
              className="inline-block px-8 py-4 premium-glass text-white text-xs font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-colors rounded-sm"
            >
              Book a Shoot &rarr;
            </Link>
          </div>
          
          <div className="flex flex-col gap-8 md:col-span-1">
            <h3 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Explore</h3>
            <div className="flex flex-col gap-4 text-sm font-bold text-white uppercase tracking-widest">
              <Link href="/portfolio" className="hover:text-zinc-500 transition-colors w-fit">Portfolio</Link>
              <Link href="/albums" className="hover:text-zinc-500 transition-colors w-fit">Albums</Link>
              <Link href="/about" className="hover:text-zinc-500 transition-colors w-fit">About</Link>
              <Link href="/book" className="hover:text-zinc-500 transition-colors w-fit">Contact</Link>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:col-span-1">
            <h3 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Connect</h3>
            <div className="flex flex-col gap-4 text-sm font-bold text-white uppercase tracking-widest">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-zinc-500 transition-colors w-fit">
                Instagram
              </a>
              <a href="mailto:contact@rcv-media.com" className="hover:text-zinc-500 transition-colors w-fit">
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Massive Wordmark */}
        <div className="w-full mb-12 overflow-hidden flex justify-center">
          <h1 className="text-[15vw] md:text-[18vw] font-black tracking-tighter uppercase text-zinc-900 leading-none select-none">
            RCV.MEDIA
          </h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5">
          <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} Reese Vierling. All rights reserved.
          </span>
          <div className="flex gap-8">
            <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase hover:text-zinc-400 transition-colors cursor-pointer">Privacy</span>
            <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase hover:text-zinc-400 transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
