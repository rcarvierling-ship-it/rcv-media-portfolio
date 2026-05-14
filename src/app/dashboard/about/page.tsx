"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { updateSiteSettings } from "@/app/actions/settings";
import { Check, Save, Image as ImageIcon, X } from "lucide-react";

export default function AboutEditorPage() {
  const [settings, setSettings] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const [{ data: settingsData }, { data: photosData }] = await Promise.all([
        supabase.from("site_settings").select("*").limit(1).single(),
        supabase.from("photos").select("*").order("created_at", { ascending: false })
      ]);
      if (settingsData) setSettings(settingsData);
      if (photosData) setPhotos(photosData);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const updates = {
      about_title_first: formData.get("about_title_first") as string,
      about_title_last: formData.get("about_title_last") as string,
      about_bio: formData.get("about_bio") as string,
      instagram_url: formData.get("instagram_url") as string,
      contact_email: formData.get("contact_email") as string,
      about_image_url: settings.about_image_url, 
    };

    try {
      await updateSiteSettings(updates);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Failed to save about settings.");
    } finally {
      setSaving(false);
    }
  };

  const selectImage = (url: string) => {
    setSettings({ ...settings, about_image_url: url });
    setShowPhotoPicker(false);
  };

  if (loading) return <div className="text-zinc-500 uppercase font-black tracking-widest text-xs">Loading Settings...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12 border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Identity & Bio Editor</h1>
        <p className="text-zinc-400 font-light text-lg uppercase tracking-widest text-[10px]">Surgically curate your professional narrative.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-12 pb-24">
        {/* Step 1: Branding */}
        <div className="space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">01. Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">First Name</label>
              <input name="about_title_first" defaultValue={settings?.about_title_first} className="w-full bg-zinc-900 border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last Name</label>
              <input name="about_title_last" defaultValue={settings?.about_title_last} className="w-full bg-zinc-900 border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50" required />
            </div>
          </div>
        </div>

        {/* Step 2: Visuals (Portrait Picker) */}
        <div className="space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">02. Cinematic Portrait</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="relative aspect-[3/4] w-48 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 group shadow-2xl">
                {settings?.about_image_url ? (
                  <Image src={settings.about_image_url} alt="Portrait" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 font-black uppercase text-[8px] tracking-widest">No Image</div>
                )}
                <button 
                  type="button"
                  onClick={() => setShowPhotoPicker(true)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white"
                >
                  Change Photo
                </button>
             </div>
             <div className="flex-1 space-y-4">
                <p className="text-zinc-500 text-xs leading-relaxed max-w-xs">Select a high-resolution portrait from your master library. This image represents your professional identity on the About page.</p>
                <button 
                  type="button" 
                  onClick={() => setShowPhotoPicker(true)}
                  className="px-6 py-3 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:bg-white hover:text-black transition-all flex items-center gap-2"
                >
                  <ImageIcon size={14} /> Open Master Library
                </button>
             </div>
          </div>
        </div>

        {/* Step 3: Bio */}
        <div className="space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">03. The Narrative</h2>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Professional Bio</label>
            <textarea 
              name="about_bio" 
              defaultValue={settings?.about_bio} 
              rows={8}
              className="w-full bg-zinc-900 border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50 resize-none text-sm leading-loose" 
              required 
            />
          </div>
        </div>

        {/* Step 4: Network */}
        <div className="space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">04. Professional Network</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Instagram URL</label>
              <input 
                name="instagram_url" 
                defaultValue={settings?.instagram_url} 
                placeholder="https://instagram.com/username"
                className="w-full bg-zinc-900 border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contact Email</label>
              <input 
                name="contact_email" 
                defaultValue={settings?.contact_email} 
                placeholder="contact@rcv-media.com"
                className="w-full bg-zinc-900 border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50" 
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-sm hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving ? 'Syncing...' : success ? <><Check size={18} /> Settings Updated</> : <><Save size={18} /> Update About Page</>}
        </button>
      </form>

      {/* PHOTO PICKER MODAL */}
      {showPhotoPicker && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-8 backdrop-blur-xl">
           <div className="bg-zinc-950 border border-white/5 w-full max-w-5xl h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                 <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Select Portrait</h2>
                 <button onClick={() => setShowPhotoPicker(false)} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {photos.map(photo => (
                   <div 
                     key={photo.id} 
                     onClick={() => selectImage(photo.image_url)}
                     className={`relative aspect-square cursor-pointer group border-2 transition-all ${settings.about_image_url === photo.image_url ? 'border-brand-accent' : 'border-transparent hover:border-white/20'}`}
                   >
                      <Image src={photo.image_url} alt="Selection" fill className="object-cover" />
                      {settings.about_image_url === photo.image_url && (
                        <div className="absolute inset-0 bg-brand-accent/20 flex items-center justify-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-white bg-brand-accent px-3 py-1">Active</span>
                        </div>
                      )}
                   </div>
                 ))}
                 {photos.length === 0 && <p className="col-span-full text-center py-20 text-zinc-600 font-black uppercase tracking-widest text-xs">No photos in library yet.</p>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
