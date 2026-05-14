"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  FolderPlus, Lock, Unlock, Settings2, 
  Trash2, ExternalLink, ChevronRight,
  User, ShieldCheck, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AlbumManager() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  
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
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Album Manager</h1>
          <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Private Client Vaults & Public Collections</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <FolderPlus size={14} /> New Album
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div key={album.id} className="premium-card rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl overflow-hidden group">
            <div className="aspect-[16/9] bg-zinc-800 relative">
               {album.cover_image_url ? (
                 <img src={album.cover_image_url} alt={album.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    <ImageIcon size={40} />
                 </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
               <div className="absolute top-4 right-4">
                  {album.is_private ? (
                    <div className="px-3 py-1 bg-blue-600 rounded-full flex items-center gap-2">
                       <Lock size={10} className="text-white" />
                       <span className="text-[8px] font-black uppercase tracking-widest text-white">Private Vault</span>
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

               <div className="flex items-center gap-6 mb-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <div className="flex items-center gap-2">
                     <ImageIcon size={12} /> {album.photos?.[0]?.count || 0} Photos
                  </div>
                  {album.passcode && (
                    <div className="flex items-center gap-2 text-blue-500">
                       <ShieldCheck size={12} /> {album.passcode}
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href={`/dashboard/albums/${album.id}`}
                    className="flex-1 py-3 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest text-center hover:bg-zinc-700 transition-colors rounded-sm"
                  >
                    Manage Media
                  </Link>
                  <Link 
                    href={`/gallery/${album.slug}`}
                    target="_blank"
                    className="flex-1 py-3 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest text-center hover:bg-white/5 transition-colors rounded-sm flex items-center justify-center gap-2"
                  >
                    View <ExternalLink size={10} />
                  </Link>
               </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {(isCreating || editingAlbum) && (
          <div className="fixed inset-0 bg-black/90 z-[500] flex items-center justify-center p-4 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 p-10 w-full max-w-xl rounded-2xl"
            >
               <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-8">
                 {editingAlbum ? "Modify Vault" : "Create New Vault"}
               </h2>
               
               <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Album Title</label>
                       <input name="title" defaultValue={editingAlbum?.title} required className="w-full bg-zinc-900 border border-white/5 px-6 py-4 text-white outline-none focus:border-blue-500/50 rounded-sm" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL Slug</label>
                       <input name="slug" defaultValue={editingAlbum?.slug} placeholder="athlete-name-event" required className="w-full bg-zinc-900 border border-white/5 px-6 py-4 text-white outline-none focus:border-blue-500/50 rounded-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Client Name</label>
                     <input name="client_name" defaultValue={editingAlbum?.client_name} placeholder="e.g. LeBron James" className="w-full bg-zinc-900 border border-white/5 px-6 py-4 text-white outline-none focus:border-blue-500/50 rounded-sm" />
                  </div>

                  <div className="p-6 bg-zinc-900/50 rounded-xl border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-white">Privacy Lock</h4>
                          <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Require a passcode to view this gallery</p>
                       </div>
                       <input type="checkbox" name="is_private" defaultChecked={editingAlbum?.is_private} className="w-6 h-6 accent-blue-600" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Passcode</label>
                       <input name="passcode" defaultValue={editingAlbum?.passcode} placeholder="SECRET123" className="w-full bg-black border border-white/5 px-6 py-4 text-white outline-none focus:border-blue-500/50 rounded-sm font-mono tracking-widest" />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button type="submit" className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200">
                        {editingAlbum ? "Save Changes" : "Establish Vault"}
                     </button>
                     <button type="button" onClick={() => { setIsCreating(false); setEditingAlbum(null); }} className="flex-1 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800">
                        Cancel
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
