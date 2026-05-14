"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { updateSiteSettings } from "@/app/actions/settings";
import { motion } from "framer-motion";
import { Check, Save, User } from "lucide-react";

export default function AboutEditorPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from("site_settings").select("*").limit(1).single();
      if (data) setSettings(data);
      setLoading(false);
    }
    fetchSettings();
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
      about_image_url: formData.get("about_image_url") as string,
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

  if (loading) return <div className="text-zinc-500 uppercase font-black tracking-widest text-xs">Loading Settings...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12 border-b border-white/5 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">About Page Editor</h1>
        <p className="text-zinc-400 font-light text-lg">Customize your bio, cinematic portrait, and brand story.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-12 pb-24">
        {/* Step 1: Branding */}
        <div className="space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">01. Branding & Name</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">First Name / Brand Start</label>
              <input name="about_title_first" defaultValue={settings?.about_title_first} className="w-full bg-zinc-900 border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last Name / Brand End</label>
              <input name="about_title_last" defaultValue={settings?.about_title_last} className="w-full bg-zinc-900 border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50" required />
            </div>
          </div>
        </div>

        {/* Step 2: The Bio */}
        <div className="space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">02. The Story (Bio)</h2>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Professional Bio</label>
            <textarea 
              name="about_bio" 
              defaultValue={settings?.about_bio} 
              rows={8}
              className="w-full bg-zinc-900 border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50 resize-none leading-relaxed" 
              placeholder="Tell your story..."
              required 
            />
          </div>
        </div>

        {/* Step 3: Visuals */}
        <div className="space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">03. Cinematic Portrait</h2>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Profile Image URL</label>
            <input name="about_image_url" defaultValue={settings?.about_image_url} className="w-full bg-zinc-900 border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50" placeholder="https://..." required />
          </div>
          {settings?.about_image_url && (
            <div className="relative aspect-[3/4] w-32 rounded-lg overflow-hidden border border-white/10">
              <img src={settings.about_image_url} className="object-cover w-full h-full" alt="Preview" />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-sm hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving ? 'Syncing...' : success ? <><Check size={18} /> Settings Updated</> : <><Save size={18} /> Update About Page</>}
        </button>
      </form>
    </div>
  );
}
