"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  FolderPlus, Lock, Unlock, Settings2, 
  Trash2, ExternalLink, ChevronRight,
  User, ShieldCheck, Image as ImageIcon,
  RefreshCw, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AlbumManager() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    const { data } = await supabase
      .from("albums")
      .select("*, photos(count)")
      .order("created_at", { ascending: false });
    if (data) setAlbums(data);
    setLoading(false);
  }

  const generatePasscode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "RCV-";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      client_name: formData.get("client_name") as string,
      is_private: formData.get("is_private") === "on",
      passcode: formData.get("passcode") as string,
    };

    if (editingAlbum?.id) {
      await supabase.from("albums").update(data).eq("id", editingAlbum.id);
    } else {
      await supabase.from("albums").insert([data]);
    }

    setIsCreating(false);
    setEditingAlbum(null);
    fetchAlbums();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will NOT delete the photos, but the album itself will be gone.")) return;
    await supabase.from("albums").delete().eq("id", id);
    fetchAlbums();
  };

  if (loading) return <div className="p-12 text-zinc-500 uppercase font-black tracking-widest text-xs">Accessing Vaults...</div>;

  return (
    <div className="space-y-12 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2 italic">Galleries</h1>
          <p className="text-zinc-500 font-black tracking-[0.4em] uppercase text-[10px]">Private Client Vaults & Public Collections</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 rounded-full shadow-brand-glow animate-pulse"
        >
          <FolderPlus size={14} /> New Gallery
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div key={album.id} className="premium-card rounded-2xl border border-white/5 bg-card backdrop-blur-xl overflow-hidden group shadow-premium hover:border-brand-accent/30 transition-all">
            <div className="aspect-[16/9] bg-zinc-800 relative">
               {album.cover_image_url ? (
                 <img src={album.cover_image_url} alt={album.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    <ImageIcon size={40} />
                 </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
               <div className="absolute top-4 right-4">
                  {album.is_private ? (
                    <div className="px-3 py-1 bg-brand-accent rounded-full flex items-center gap-2 shadow-brand-glow">
                       <Lock size={10} className="text-black" />
                       <span className="text-[8px] font-black uppercase tracking-widest text-black">Private Vault</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-zinc-800 rounded-full flex items-center gap-2">
                       <Unlock size={10} className="text-zinc-400" />
                       <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Public Gallery</span>
                    </div>
                  )}
               </div>
            </div>

            <div className="p-8">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">{album.title}</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <User size={10} /> {album.client_name || "General Client"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingAlbum(album)} className="p-2 text-zinc-600 hover:text-white transition-colors">
                       <Settings2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(album.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                       <Trash2 size={16} />
                    </button>
                  </div>
               </div>

                <div className="space-y-4 mb-8 pt-6 border-t border-white/5">
                   <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Vault Location</span>
                      <div className="flex items-center justify-between p-3 bg-secondary rounded-sm border border-white/5 group/url">
                         <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[200px]">
                           {album.is_private ? `/vault/${album.slug}` : `/albums/${album.slug}`}
                         </span>
                         <button 
                           onClick={() => handleCopy(`${window.location.origin}${album.is_private ? '/vault/' : '/albums/'}${album.slug}`, album.id + '_url')}
                           className="text-brand-accent hover:text-white transition-colors"
                         >
                            {copiedId === album.id + '_url' ? <Check size={12} className="text-brand-accent" /> : <Copy size={12} />}
                         </button>
                      </div>
                   </div>

                   {album.is_private && album.passcode && (
                     <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Access Passcode</span>
                        <div className="flex items-center justify-between p-3 bg-brand-accent/5 rounded-sm border border-brand-accent/20 group/pass">
                           <span className="text-[10px] font-mono font-black tracking-widest text-brand-accent">{album.passcode}</span>
                           <button 
                             onClick={() => handleCopy(album.passcode, album.id + '_pass')}
                             className="text-brand-accent hover:text-white transition-colors"
                           >
                              {copiedId === album.id + '_pass' ? <Check size={12} className="text-brand-accent" /> : <Copy size={12} />}
                           </button>
                        </div>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div>
                      <span className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Engagement</span>
                      <span className="text-sm font-black text-brand-accent">{album.vault_views || 0} Views</span>
                   </div>
                   <div>
                      <span className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Sync Status</span>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                         <ImageIcon size={10} /> {album.photos?.[0]?.count || 0} Assets
                      </span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <Link 
                     href={`/dashboard/galleries/${album.id}`}
                     className="flex-1 py-3 bg-secondary text-white text-[10px] font-black uppercase tracking-widest text-center hover:bg-zinc-700 transition-colors rounded-sm border border-white/5"
                   >
                     Manage Media
                   </Link>
                   <Link 
                     href={album.is_private ? `/vault/${album.slug}` : `/albums/${album.slug}`}
                     target="_blank"
                     className="flex-1 py-3 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest text-center hover:brightness-110 transition-all rounded-sm flex items-center justify-center gap-2 shadow-brand-glow"
                   >
                     View Live <ExternalLink size={10} />
                   </Link>
                </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {(isCreating || editingAlbum) && (
          <AlbumModal 
            album={editingAlbum} 
            onClose={() => { setIsCreating(false); setEditingAlbum(null); }}
            onSave={handleSave}
            generatePasscode={generatePasscode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AlbumModal({ album, onClose, onSave, generatePasscode }: any) {
  const [passcode, setPasscode] = useState(album?.passcode || "");
  const [isPrivate, setIsPrivate] = useState(album?.is_private || false);

  const togglePrivacy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsPrivate(checked);
    if (checked && !passcode) {
      setPasscode(generatePasscode());
    }
  };

  return (
    <div className="fixed inset-0 bg-background/90 z-[500] flex items-center justify-center p-4 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-white/10 p-10 w-full max-w-xl rounded-[2.5rem] shadow-2xl"
      >
         <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-8">
           {album ? "Modify Vault" : "Create New Vault"}
         </h2>
         
         <form onSubmit={onSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Album Title</label>
                 <input name="title" defaultValue={album?.title} required className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none focus:border-brand-accent rounded-full text-sm font-bold shadow-inner" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL Slug</label>
                 <input name="slug" defaultValue={album?.slug} placeholder="athlete-name-event" required className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none focus:border-brand-accent rounded-full text-sm font-bold shadow-inner" />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Client Name</label>
               <input name="client_name" defaultValue={album?.client_name} placeholder="e.g. LeBron James" className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none focus:border-brand-accent rounded-full text-sm font-bold shadow-inner" />
            </div>

            <div className="p-6 bg-zinc-900/50 rounded-xl border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Privacy Lock</h4>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Require a passcode to view this gallery</p>
                 </div>
                 <input 
                   type="checkbox" 
                   name="is_private" 
                   checked={isPrivate} 
                   onChange={togglePrivacy}
                   className="w-6 h-6 accent-brand-accent" 
                 />
              </div>
               <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Passcode</label>
                    {isPrivate && (
                      <button 
                        type="button" 
                        onClick={() => setPasscode(generatePasscode())}
                        className="text-[9px] font-black uppercase tracking-widest text-brand-accent hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw size={10} /> Regenerate
                      </button>
                    )}
                 </div>
                 <input 
                   name="passcode" 
                   value={passcode} 
                   onChange={(e) => setPasscode(e.target.value)}
                   placeholder="SECRET123" 
                   className="w-full bg-background border border-white/5 px-6 py-4 text-white outline-none focus:border-brand-accent rounded-full font-mono tracking-widest shadow-inner" 
                 />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
               <button type="submit" className="flex-1 py-5 bg-brand-accent text-black font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all rounded-full shadow-brand-glow">
                  {album ? "Save Changes" : "Establish Vault"}
               </button>
               <button type="button" onClick={onClose} className="flex-1 py-5 bg-secondary text-white font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all rounded-full border border-white/5">
                  Cancel
               </button>
            </div>
         </form>
      </motion.div>
    </div>
  );
}
