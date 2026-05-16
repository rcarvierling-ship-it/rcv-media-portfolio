"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { updateSiteSettings } from "@/app/actions/settings";
import { 
  Save, Globe, User, Shield, 
  Palette, Mail, Instagram, 
  Image as ImageIcon, Calendar,
  Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsDashboardPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    setError(null);

    const formData = new FormData(e.currentTarget);
    const updates: any = {};
    
    // Identity
    updates.hero_title = formData.get("hero_title");
    updates.hero_subtitle = formData.get("hero_subtitle");
    updates.hero_image_url = formData.get("hero_image_url");
    
    // About Page
    updates.about_title_first = formData.get("about_title_first");
    updates.about_title_last = formData.get("about_title_last");
    updates.about_bio = formData.get("about_bio");
    updates.about_image_url = formData.get("about_image_url");
    
    // Logistics
    updates.booking_is_active = formData.get("booking_is_active") === "on";
    updates.booking_min_advance_days = parseInt(formData.get("booking_min_advance_days") as string || "21");
    updates.booking_max_advance_days = parseInt(formData.get("booking_max_advance_days") as string || "180");
    
    // Branding
    updates.accent_color = formData.get("accent_color");
    updates.instagram_url = formData.get("instagram_url");
    updates.contact_email = formData.get("contact_email");

    try {
      await updateSiteSettings(updates);
      setSettings({ ...settings, ...updates });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to sync settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-12 flex items-center justify-center">
       <Loader2 className="animate-spin text-zinc-500" />
    </div>
  );

  return (
    <div className="pb-24 max-w-6xl">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Command Settings</h1>
          <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Configuring your global digital footprint</p>
        </div>
        <div className="flex items-center gap-4">
           <AnimatePresence>
             {success && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-brand-accent text-[10px] font-black uppercase tracking-widest bg-brand-accent/5 px-4 py-2 border border-brand-accent/10 rounded-sm">
                  <CheckCircle2 size={14} /> System Synced
               </motion.div>
             )}
             {error && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/5 px-4 py-2 border border-red-500/10 rounded-sm">
                  <AlertCircle size={14} /> Sync Failed
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Sections */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Section: Homepage Identity */}
          <section className="premium-card p-10 bg-zinc-900/40 border border-white/5 rounded-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Globe size={120} /></div>
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                <div className="p-3 bg-brand-accent/10 rounded-sm text-brand-accent"><Globe size={20} /></div>
                <div>
                   <h2 className="text-xl font-black uppercase tracking-tight text-white">Homepage Identity</h2>
                   <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Main landing page messaging & imagery</p>
                </div>
             </div>

             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hero Title</label>
                      <input name="hero_title" defaultValue={settings?.hero_title} className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hero Subtitle</label>
                      <input name="hero_subtitle" defaultValue={settings?.hero_subtitle} className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hero Background Image URL</label>
                   <div className="flex gap-4">
                      <input name="hero_image_url" defaultValue={settings?.hero_image_url} className="flex-1 bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold" />
                      <div className="w-14 h-14 bg-zinc-800 rounded-sm overflow-hidden border border-white/5">
                         <img src={settings?.hero_image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* Section: About Page Mastery */}
          <section className="premium-card p-10 bg-zinc-900/40 border border-white/5 rounded-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5"><User size={120} /></div>
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                <div className="p-3 bg-brand-accent/10 rounded-sm text-brand-accent"><User size={20} /></div>
                <div>
                   <h2 className="text-xl font-black uppercase tracking-tight text-white">About Page Mastery</h2>
                   <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Managing your personal bio & profile</p>
                </div>
             </div>

             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">First Name</label>
                      <input name="about_title_first" defaultValue={settings?.about_title_first} className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last Name</label>
                      <input name="about_title_last" defaultValue={settings?.about_title_last} className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Biography</label>
                   <textarea name="about_bio" rows={6} defaultValue={settings?.about_bio} className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold resize-none leading-relaxed" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Profile Image URL</label>
                   <div className="flex gap-4">
                      <input name="about_image_url" defaultValue={settings?.about_image_url} className="flex-1 bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold" />
                      <div className="w-14 h-14 bg-zinc-800 rounded-sm overflow-hidden border border-white/5">
                         <img src={settings?.about_image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* Section: Fulfillment Logistics */}
          <section className="premium-card p-10 bg-zinc-900/40 border border-white/5 rounded-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Calendar size={120} /></div>
             <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                <div className="p-3 bg-amber-600/10 rounded-sm text-amber-500"><Calendar size={20} /></div>
                <div>
                   <h2 className="text-xl font-black uppercase tracking-tight text-white">Fulfillment Logistics</h2>
                   <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Booking system constraints & logic</p>
                </div>
             </div>

             <div className="space-y-10">
                <div className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-sm">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Open for Bookings</p>
                      <p className="text-[9px] text-zinc-500 uppercase">Toggle the visibility of your booking engine</p>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setSettings({...settings, booking_is_active: !settings.booking_is_active})}
                     className={`w-14 h-7 rounded-full relative transition-all ${settings?.booking_is_active ? 'bg-brand-accent' : 'bg-background'}`}
                   >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings?.booking_is_active ? 'left-8' : 'left-1'}`} />
                      <input type="checkbox" name="booking_is_active" checked={settings?.booking_is_active} className="hidden" readOnly />
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Min Advance Days</label>
                      <input name="booking_min_advance_days" type="number" defaultValue={settings?.booking_min_advance_days} className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Max Advance Days</label>
                      <input name="booking_max_advance_days" type="number" defaultValue={settings?.booking_max_advance_days} className="w-full bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold" />
                   </div>
                </div>
             </div>
          </section>
        </div>

        {/* Right Column: Global Sidebar */}
        <div className="lg:col-span-4 space-y-12">
          
          <div className="sticky top-12 space-y-12">
             {/* Branding Hub */}
             <section className="premium-card p-10 bg-zinc-900/40 border border-white/5 rounded-sm">
                <div className="flex items-center gap-4 mb-10">
                   <div className="p-3 bg-brand-accent/10 rounded-sm text-brand-accent"><Palette size={20} /></div>
                   <div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-white">The Vibe</h2>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Global Accent Color</label>
                      <div className="flex gap-4">
                         <input name="accent_color" defaultValue={settings?.accent_color} className="flex-1 bg-black/40 border border-white/10 px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-[10px] font-mono" />
                         <div className="w-14 h-14 rounded-full border border-white/10" style={{ backgroundColor: settings?.accent_color }} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Instagram Handle</label>
                      <div className="relative">
                         <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                         <input name="instagram_url" defaultValue={settings?.instagram_url} className="w-full bg-black/40 border border-white/10 pl-14 pr-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold" />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Professional Email</label>
                      <div className="relative">
                         <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                         <input name="contact_email" type="email" defaultValue={settings?.contact_email} className="w-full bg-black/40 border border-white/10 pl-14 pr-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all text-sm font-bold" />
                      </div>
                   </div>
                </div>
             </section>

             {/* Action Station */}
             <div className="p-10 bg-card border border-white/10 rounded-sm backdrop-blur-xl shadow-premium">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full py-6 bg-brand-accent text-black font-black uppercase tracking-[0.3em] text-xs hover:brightness-110 transition-all flex items-center justify-center gap-3 group shadow-brand-glow"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>Establish Changes <Save size={18} className="group-hover:scale-110 transition-transform" /></>
                  )}
                </button>
                <p className="text-center mt-6 text-[8px] font-black uppercase tracking-widest text-zinc-500">Global System Sync Required</p>
             </div>
          </div>

        </div>
      </form>
    </div>
  );
}
