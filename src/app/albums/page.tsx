import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AlbumsPage() {
  const supabase = await createClient();
  
  // Fetch public albums
  const { data: albums } = await supabase
    .from("albums")
    .select("*")
    .eq("is_private", false)
    .order("created_at", { ascending: false });

  const displayAlbums = albums || [];

  return (
    <div className="pt-32 pb-24 safe-padding min-h-screen bg-zinc-950 relative">
      <div className="fixed inset-0 z-[100] bg-ambient pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20 text-center md:text-left">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-6 text-white">Albums</h1>
          <p className="text-zinc-400 max-w-2xl text-lg md:text-xl font-light leading-relaxed mx-auto md:mx-0">
            Curated collections of assignments, events, and exclusive projects.
          </p>
        </header>

        {displayAlbums.length === 0 ? (
          <div className="w-full premium-card rounded-2xl p-16 flex flex-col items-center justify-center text-center border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-black/50" />
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M3 18h6"/></svg>
              </div>
              <h3 className="text-2xl font-black uppercase text-white mb-4 tracking-tight">No public albums available</h3>
              <p className="text-zinc-500 max-w-md mx-auto">Check back later for curated collections.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayAlbums.map((album) => (
              <Link key={album.id} href={`/albums/${album.slug}`} className="group block">
                <div className="relative aspect-[4/3] premium-card rounded-2xl overflow-hidden mb-6 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                  {album.cover_image_url ? (
                    <Image
                      src={album.cover_image_url}
                      alt={album.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center">
                      <span className="text-zinc-700 font-black uppercase tracking-widest text-2xl">RCV</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="px-8 py-4 premium-glass text-white text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-xl border border-white/20">
                      View Album
                    </span>
                  </div>
                </div>
                
                <div className="px-2">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-500 transition-all">{album.title}</h2>
                  {album.description && (
                    <p className="text-zinc-500 text-sm mt-3 line-clamp-2 font-light leading-relaxed">{album.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
