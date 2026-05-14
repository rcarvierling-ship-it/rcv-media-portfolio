"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { createAlbum, updateAlbum, deleteAlbum } from "@/app/actions/albums";
import { Copy, Share2, Eye, EyeOff } from "lucide-react";

type Album = {
  id: string;
  title: string;
  description: string;
  slug: string;
  is_private: boolean;
  passcode?: string;
  client_name?: string;
};

export default function AlbumsDashboardPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchAlbums() {
      const { data } = await supabase.from("albums").select("*").order("created_at", { ascending: false });
      if (data) setAlbums(data);
      setLoading(false);
    }
    fetchAlbums();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? Photos inside will NOT be deleted.")) return;
    try {
      await deleteAlbum(id);
      setAlbums(albums.filter(a => a.id !== id));
    } catch (error) {
      alert("Failed to delete album.");
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      is_private: formData.get("is_private") === "on",
      passcode: formData.get("passcode") as string,
      client_name: formData.get("client_name") as string,
    };

    try {
      if (isCreating) {
        await createAlbum(data);
        const { data: newAlbums } = await supabase.from("albums").select("*").order("created_at", { ascending: false });
        if (newAlbums) setAlbums(newAlbums);
      } else if (editingAlbum) {
        await updateAlbum(editingAlbum.id, data);
        setAlbums(albums.map(a => a.id === editingAlbum.id ? { ...a, ...data } : a));
      }
      setIsCreating(false);
      setEditingAlbum(null);
    } catch (error) {
      alert("Failed to save album.");
    }
  };

  const copyShareLink = (slug: string) => {
    const link = `${window.location.origin}/gallery/${slug}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(slug);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Albums & Galleries</h1>
          <p className="text-zinc-400 font-light text-lg">Manage public collections and private client portals.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all rounded-sm"
        >
          Create New Album
        </button>
      </div>

      {loading ? (
        <div className="text-zinc-500 uppercase font-black tracking-widest text-sm">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {albums.map((album) => (
            <div key={album.id} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all rounded-sm">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">
                    {album.title}
                  </h3>
                  {album.is_private ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-sm">
                      <EyeOff size={10} /> Private Portal
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-sm">
                      <Eye size={10} /> Public
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <span>/{album.slug}</span>
                  {album.client_name && <span>Client: {album.client_name}</span>}
                  {album.passcode && <span>Passcode: <span className="text-white">{album.passcode}</span></span>}
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-none border-zinc-800">
                <button 
                  onClick={() => copyShareLink(album.slug)}
                  className={`flex items-center gap-2 px-4 py-2 border border-zinc-800 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm hover:bg-zinc-800 ${copySuccess === album.slug ? 'text-emerald-400 border-emerald-400/50' : 'text-zinc-400'}`}
                >
                  <Share2 size={12} /> {copySuccess === album.slug ? 'Copied' : 'Share Link'}
                </button>
                <button 
                  onClick={() => setEditingAlbum(album)}
                  className="px-4 py-2 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all rounded-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(album.id)}
                  className="px-4 py-2 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all rounded-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {albums.length === 0 && <p className="text-zinc-500 font-bold uppercase tracking-widest text-center py-20 border border-dashed border-zinc-800">No albums yet.</p>}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreating || editingAlbum) && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-900 p-10 w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                {isCreating ? "New Album" : "Edit Portal"}
              </h2>
              <button onClick={() => { setIsCreating(false); setEditingAlbum(null); }} className="text-zinc-500 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Album Title</label>
                <input name="title" defaultValue={editingAlbum?.title} className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500/50 px-6 py-4 text-white outline-none rounded-sm" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="is_private" id="is_private" defaultChecked={editingAlbum ? editingAlbum.is_private : false} className="w-5 h-5 accent-blue-600 bg-zinc-900 border-zinc-800" />
                    <label htmlFor="is_private" className="text-[10px] font-black uppercase tracking-widest text-white">Private Client Portal</label>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                    Private portals are hidden from the public site and require a passcode to view.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Client Name (Optional)</label>
                  <input name="client_name" defaultValue={editingAlbum?.client_name} className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500/50 px-6 py-4 text-white outline-none rounded-sm" placeholder="e.g. LeBron James" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Passcode (For Private Portals)</label>
                <input name="passcode" defaultValue={editingAlbum?.passcode} className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500/50 px-6 py-4 text-white outline-none rounded-sm font-mono tracking-widest" placeholder="Case-sensitive passcode" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description (Optional)</label>
                <textarea name="description" defaultValue={editingAlbum?.description} className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500/50 px-6 py-4 text-white outline-none rounded-sm resize-none" rows={3}></textarea>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-white text-black font-black uppercase tracking-widest text-xs py-5 hover:bg-zinc-200 transition-all rounded-sm">
                  {isCreating ? "Create Album" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
