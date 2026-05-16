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
              <input name="about_title_first" defaultValue={settings?.about_title_first} className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last Name</label>
              <input name="about_title_last" defaultValue={settings?.about_title_last} className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" required />
            </div>
          </div>
        </div>

        {/* Step 2: Visuals (Portrait Picker) */}
        <div className="space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">02. Cinematic Portrait</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="relative aspect-[3/4] w-48 rounded-[1.5rem] overflow-hidden border border-white/10 bg-background group shadow-2xl">
                {settings?.about_image_url ? (
                  <Image src={settings.about_image_url} alt="Portrait" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800 font-black uppercase text-[8px] tracking-widest">No Image</div>
                )}
                <button 
                  type="button"
                  onClick={() => setShowPhotoPicker(true)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm"
                >
                   Adjust Persona
                </button>
             </div>
             <div className="flex-1 space-y-6">
                <p className="text-zinc-500 text-[11px] font-medium leading-relaxed max-w-xs uppercase tracking-wide">Select a high-resolution portrait from your master library. This image represents your professional identity on the About page.</p>
                <button 
                  type="button" 
                  onClick={() => setShowPhotoPicker(true)}
                  className="px-8 py-4 bg-secondary border border-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:brightness-110 transition-all flex items-center gap-2 rounded-full shadow-premium"
                >
                  <ImageIcon size={14} className="text-brand-accent" /> Master Library Access
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
              className="w-full bg-secondary border border-white/5 px-8 py-6 text-white outline-none rounded-[1.5rem] focus:border-brand-accent shadow-inner resize-none text-sm leading-loose font-medium" 
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
                className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contact Email</label>
              <input 
                name="contact_email" 
                defaultValue={settings?.contact_email} 
                placeholder="contact@rcv-media.com"
                className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" 
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full py-6 bg-brand-accent text-black font-black uppercase tracking-widest text-sm rounded-full hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-brand-glow disabled:opacity-50"
        >
          {saving ? 'Syncing...' : success ? <><Check size={18} /> DNA Updated</> : <><Save size={18} /> Update About Page</>}
        </button>
      </form>

      {/* PHOTO PICKER MODAL */}
      {showPhotoPicker && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[500] flex items-center justify-center p-8">
           <div className="bg-card border border-white/10 w-full max-w-5xl h-[80vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Select Portrait</h2>
                 <button onClick={() => setShowPhotoPicker(false)} className="p-3 bg-secondary text-white hover:brightness-110 transition-all rounded-full border border-white/10"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {photos.map(photo => (
                    <div 
                      key={photo.id} 
                      onClick={() => selectImage(photo.image_url)}
                      className={`relative aspect-square cursor-pointer group border-2 rounded-xl overflow-hidden transition-all ${settings.about_image_url === photo.image_url ? 'border-brand-accent shadow-brand-glow' : 'border-transparent hover:border-white/20'}`}
                    >
                       <Image src={photo.image_url} alt="Selection" fill className="object-cover" />
                       {settings.about_image_url === photo.image_url && (
                         <div className="absolute inset-0 bg-brand-accent/20 flex items-center justify-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black bg-brand-accent px-3 py-1">Active</span>
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
