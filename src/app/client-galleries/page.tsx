import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Lock, ArrowRight, Camera } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Galleries | RCV.Media",
  description: "Access your professional photography galleries. Public collections and secure private vaults.",
};

export default async function ClientGalleriesPage() {
  const supabase = await createClient();
  
  // Fetch public albums
  const { data: albums } = await supabase
    .from("albums")
    .select("*")
    .eq("is_private", false)
    .order("created_at", { ascending: false });

  const displayAlbums = albums || [];

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-accent/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-zinc-900/20 blur-[150px] rounded-full" />
      </div>

      <div className="container-premium relative z-10">
        <header className="max-w-4xl mb-24">
          <span className="text-brand-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Portals</span>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.9]">
            Client <br/> <span className="text-zinc-800 italic">Galleries</span>
          </h1>
          <p className="text-zinc-500 font-light text-lg md:text-xl leading-relaxed">
            Your memories, preserved with precision. Access public collections or enter your secure private vault.
          </p>
        </header>

        {/* Private Vault Entry CTA */}
        <div className="mb-24">
           <Link href="/vault" className="group block">
              <div className="premium-card p-8 md:p-16 rounded-sm border border-brand-accent/20 bg-brand-accent/5 hover:bg-brand-accent/10 hover:border-brand-accent/40 transition-all relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Lock size={120} />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 rounded-full bg-brand-accent text-white flex items-center justify-center">
                          <Lock size={20} />
                       </div>
                       <span className="text-brand-accent text-[10px] font-black uppercase tracking-[0.4em]">Secure Access</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">The Private Vault</h2>
                    <p className="text-zinc-400 max-w-xl text-base md:text-lg mb-10 font-light">
                       Enter your unique passcode to access your private high-resolution gallery and download your assets.
                    </p>
                    <span className="inline-flex items-center gap-3 text-white text-[11px] font-black uppercase tracking-[0.2em] border-b-2 border-brand-accent pb-2 group-hover:gap-5 transition-all">
                       Enter Vault <ArrowRight size={16} />
                    </span>
                 </div>
              </div>
           </Link>
        </div>

        {/* Public Albums Section */}
        <div className="space-y-12">
           <div className="flex items-end justify-between border-b border-white/5 pb-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Public Collections</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{displayAlbums.length} Albums</span>
           </div>

           {displayAlbums.length === 0 ? (
             <div className="py-20 text-center bg-zinc-900/10 border border-dashed border-white/5 rounded-sm">
                <Camera className="mx-auto text-zinc-800 mb-4" size={40} />
                <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">No public collections at this time.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayAlbums.map((album) => (
                  <Link key={album.id} href={`/albums/${album.slug}`} className="group block">
                    <div className="relative aspect-[4/3] premium-card rounded-sm overflow-hidden mb-6 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/5">
                      {album.cover_image_url ? (
                        <Image
                          src={album.cover_image_url}
                          alt={album.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                          <Camera size={32} className="text-zinc-800" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    </div>
                    <div className="px-2">
                       <h4 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-brand-accent transition-colors leading-none mb-2">{album.title}</h4>
                       <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                          {new Date(album.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                       </p>
                    </div>
                  </Link>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
