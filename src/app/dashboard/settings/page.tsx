"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { updateSiteSettings } from "@/app/actions/settings";

export default function SettingsDashboardPage() {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const updates = {
      hero_title: formData.get("hero_title") as string,
      hero_subtitle: formData.get("hero_subtitle") as string,
      instagram_url: formData.get("instagram_url") as string,
      contact_email: formData.get("contact_email") as string,
    };

    try {
      await updateSiteSettings(updates);
      setSettings({ ...settings, ...updates });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">Site Settings</h1>
        <p className="text-zinc-400">Configure global website data.</p>
      </header>

      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-tight mb-4 border-b border-zinc-800 pb-2">Homepage Hero</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Hero Title</label>
              <input 
                name="hero_title"
                defaultValue={settings?.hero_title}
                className="w-full bg-black border border-zinc-800 focus:border-white px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Hero Subtitle</label>
              <input 
                name="hero_subtitle"
                defaultValue={settings?.hero_subtitle}
                className="w-full bg-black border border-zinc-800 focus:border-white px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-tight mb-4 border-b border-zinc-800 pb-2">Contact & Socials</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Instagram URL</label>
              <input 
                name="instagram_url"
                defaultValue={settings?.instagram_url}
                className="w-full bg-black border border-zinc-800 focus:border-white px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Contact Email</label>
              <input 
                name="contact_email"
                type="email"
                defaultValue={settings?.contact_email}
                className="w-full bg-black border border-zinc-800 focus:border-white px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 font-bold text-sm uppercase tracking-widest">
              Settings saved successfully!
            </div>
          )}

          <button 
            type="submit"
            disabled={saving}
            className="w-full px-8 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      )}
    </div>
  );
}
