import { createClient } from "@/utils/supabase/server";
import { checkVaultAccess } from "@/app/actions/vault";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Download, Share2, ShieldCheck, ArrowLeft, 
  Calendar, Camera, User, ExternalLink, Info
} from "lucide-react";
import { logAnalyticsEvent } from "@/app/actions/analytics";

export default async function PrivateVaultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // 1. Security Check
  const hasAccess = await checkVaultAccess(slug);
  if (!hasAccess) {
    redirect("/vault");
  }

  const supabase = await createClient();

  // 2. Fetch Album & Photos
  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!album) {
    redirect("/vault");
  }

  // 3. Log Analytics
  await logAnalyticsEvent({
    event_type: 'vault_view',
    album_id: album.id,
    metadata: { slug }
  });

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", album.id)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Cinematic Header */}
      <header className="relative h-[60vh] flex flex-col justify-end p-12 overflow-hidden border-b border-white/5">
         {album.cover_image_url && (
            <>
              <Image 
                src={album.cover_image_url} 
                alt={album.title} 
                fill 
                className="object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </>
         )}
         
         <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-8">
               <div className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/50 rounded-full flex items-center gap-2">
                  <ShieldCheck size={12} className="text-brand-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Secure Proofing Session</span>
               </div>
               <Link href="/vault" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                  <ArrowLeft size={12} /> Exit Vault
               </Link>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter mb-6 italic leading-[0.8]">
              {album.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
               <div className="flex items-center gap-3"><Calendar size={14} /> {new Date(album.created_at).toLocaleDateString()}</div>
               <div className="flex items-center gap-3"><Camera size={14} /> {photos?.length || 0} Deliverables</div>
               <div className="flex items-center gap-3"><User size={14} /> {album.client_name || "Official Client"}</div>
            </div>
         </div>
      </header>

      {/* Action Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 py-6 mb-12">
         <div className="max-w-7xl mx-auto px-12 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Digital Asset Vault</h2>
               <div className="h-px w-12 bg-zinc-800" />
            </div>
            <div className="flex items-center gap-4">
               <button className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all rounded-sm shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <Download size={14} /> Download Full Collection
               </button>
            </div>
         </div>
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           {photos?.map((photo) => (
             <div key={photo.id} className="group space-y-6">
                <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden border border-white/5 rounded-sm">
                   <Image 
                     src={photo.image_url} 
                     alt={photo.title || "Private Proof"} 
                     fill 
                     className="object-cover transition-transform duration-700 group-hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <a 
                        href={photo.image_url} 
                        download 
                        className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform"
                      >
                         <Download size={20} />
                      </a>
                      <button className="p-4 bg-zinc-900 text-white border border-white/20 rounded-full hover:scale-110 transition-transform">
                         <Share2 size={20} />
                      </button>
                   </div>
                </div>
                <div className="flex justify-between items-start pr-4">
                   <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white mb-1">{photo.title || "Untitled Proof"}</h3>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">{photo.category || "Official Asset"}</p>
                   </div>
                   <div className="text-[10px] font-mono text-zinc-700">#{photo.id.slice(0, 8).toUpperCase()}</div>
                </div>
             </div>
           ))}
        </div>

        {(!photos || photos.length === 0) && (
          <div className="py-32 text-center border border-white/5 border-dashed rounded-sm">
             <Info className="mx-auto mb-6 text-zinc-800" size={48} />
             <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">Encryption Active • No Assets Found in Collection</p>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="mt-48 pt-24 border-t border-white/5 px-12 flex flex-col items-center">
         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
            <ShieldCheck size={24} className="text-zinc-500" />
         </div>
         <p className="text-[10px] font-black uppercase tracking-[1em] text-zinc-500 mb-4 italic">RCV.MEDIA SECURITY</p>
         <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-800 max-w-sm text-center leading-loose">
            All visual assets contained within this vault are protected by intellectual property laws. 
            Unauthorized reproduction or distribution is strictly prohibited.
         </p>
      </footer>
    </div>
  );
}
