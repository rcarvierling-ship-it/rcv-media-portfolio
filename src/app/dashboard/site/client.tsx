"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { 
  Palette, Check, RefreshCw, GripVertical, 
  Move, X, Maximize2, Save, User, Globe, 
  Instagram, Mail, ImageIcon, Sparkles, CheckCircle2,
  Settings2, Eye, Shield, Loader2
} from "lucide-react";
import { reorderPhotos } from "@/app/actions/photos";
import { updateSiteSettings } from "@/app/actions/settings";

const COLOR_PRESETS = [
  { name: "Neon Green", color: "#C8FF00" },
  { name: "Blood Red", color: "#ef4444" },
  { name: "Championship Gold", color: "#fbbf24" },
  { name: "Stealth Zinc", color: "#71717a" },
  { name: "Emerald Green", color: "#10b981" },
  { name: "Vivid Purple", color: "#a855f7" },
  { name: "Pure White", color: "#ffffff" },
];

export function SiteEditorClient({ initialSettings, allPhotos }: { initialSettings: any, allPhotos: any[] }) {
  const [settings, setSettings] = useState(initialSettings);
  const [photos] = useState(allPhotos);
  const [activeTab, setActiveTab] = useState<"brand" | "homepage" | "about" | "accent" | "featured" | "seo">("brand");
  
  const [featuredPhotos, setFeaturedPhotos] = useState(
    allPhotos.filter(p => p.is_featured).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  );
  
  // Modals & Pickers
  const [showPhotoPicker, setShowPhotoPicker] = useState<{ active: boolean, target: 'hero' | 'featured' | 'about' | null }>({ active: false, target: null });
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeColor, setActiveColor] = useState(initialSettings?.accent_color || "#C8FF00");

  const supabase = createClient();
  const router = useRouter();

  const handleUpdateSettings = async (updates: any) => {
    setIsSaving(true);
    setSuccess(false);
    try {
      await updateSiteSettings(updates);
      setSettings((prev: any) => ({ ...prev, ...updates }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      router.refresh();
    } catch (err) {
      alert("Failed to sync settings changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateAccentColor = async (color: string) => {
    setActiveColor(color);
    await handleUpdateSettings({ accent_color: color });
    // Let global CSS reload accent color seamlessly
    setTimeout(() => window.location.reload(), 500);
  };

  const selectPickerPhoto = async (photoUrl: string) => {
    if (showPhotoPicker.target === 'hero') {
      await handleUpdateSettings({ hero_image_url: photoUrl });
    } else if (showPhotoPicker.target === 'about') {
      await handleUpdateSettings({ about_image_url: photoUrl });
    }
    setShowPhotoPicker({ active: false, target: null });
  };

  const toggleFeatured = async (photo: any) => {
    const isNowFeatured = !photo.is_featured;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("photos").update({ is_featured: isNowFeatured }).eq("id", photo.id);
      if (!error) {
        // Refresh local list
        setFeaturedPhotos(prev => {
          if (isNowFeatured) {
            return [...prev, { ...photo, is_featured: true }].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          } else {
            return prev.filter(p => p.id !== photo.id);
          }
        });
        router.refresh();
      }
    } catch (e) {
      alert("Failed to adjust feature status.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = (newOrder: any[]) => {
    setFeaturedPhotos(newOrder);
    setHasUnsavedChanges(true);
  };

  const saveReorder = async () => {
    setIsReordering(true);
    try {
      const updates = featuredPhotos.map((p, i) => ({ id: p.id, sort_order: i + 1 }));
      await reorderPhotos(updates);
      setHasUnsavedChanges(false);
      router.refresh();
    } catch (err) {
      console.error("Reorder failed:", err);
      alert("Failed to sync sequence.");
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* TABS CONTROLLER */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-8">
        {[
          { id: "brand", label: "Brand Info", icon: User },
          { id: "homepage", label: "Homepage Hero", icon: Globe },
          { id: "about", label: "Bio & Narrative", icon: Sparkles },
          { id: "accent", label: "Accent Color DNA", icon: Palette },
          { id: "featured", label: "Featured Edit", icon: ImageIcon },
          { id: "seo", label: "SEO Metadata", icon: Settings2 }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                isActive 
                  ? "bg-brand-accent border-brand-accent text-black shadow-brand-glow" 
                  : "bg-card border-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "brand" && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await handleUpdateSettings({
                about_title_first: fd.get("about_title_first"),
                about_title_last: fd.get("about_title_last"),
                contact_email: fd.get("contact_email"),
                instagram_url: fd.get("instagram_url")
              });
            }} className="max-w-4xl bg-card border border-white/5 p-10 rounded-[2.5rem] shadow-premium space-y-8">
              <div className="flex justify-between items-center pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white">Brand Info</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Configuring identity assets and reach points</p>
                </div>
                {success && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/5 px-4 py-2 rounded-full border border-brand-accent/20">
                     DNA Updated
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">First Name</label>
                  <input name="about_title_first" defaultValue={settings?.about_title_first} required className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last Name</label>
                  <input name="about_title_last" defaultValue={settings?.about_title_last} required className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5"><Mail size={12} /> Contact Email</label>
                  <input name="contact_email" type="email" defaultValue={settings?.contact_email} required className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5"><Instagram size={12} /> Instagram Link</label>
                  <input name="instagram_url" type="url" defaultValue={settings?.instagram_url} placeholder="https://instagram.com/..." className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" />
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="w-full py-5 bg-brand-accent text-black text-[10px] font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all rounded-full flex items-center justify-center gap-2 shadow-brand-glow disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save Identity
              </button>
            </form>
          )}

          {activeTab === "homepage" && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await handleUpdateSettings({
                hero_title: fd.get("hero_title"),
                hero_subtitle: fd.get("hero_subtitle")
              });
            }} className="max-w-5xl bg-card border border-white/5 p-10 rounded-[2.5rem] shadow-premium space-y-8">
              <div className="flex justify-between items-center pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white">Homepage Hero</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Configure layout visuals and splash elements</p>
                </div>
                {success && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/5 px-4 py-2 rounded-full border border-brand-accent/20">
                     Hero Updated
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hero Main Title</label>
                    <input name="hero_title" defaultValue={settings?.hero_title} required className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hero Subtitle Text</label>
                    <input name="hero_subtitle" defaultValue={settings?.hero_subtitle} required className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" />
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full py-5 bg-brand-accent text-black text-[10px] font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all rounded-full flex items-center justify-center gap-2 shadow-brand-glow disabled:opacity-50">
                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save Hero Details
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Hero Display Asset</label>
                  <div className="relative aspect-[16/10] bg-background rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
                    {settings?.hero_image_url ? (
                      <Image src={settings.hero_image_url} alt="Hero Background" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 font-bold uppercase tracking-widest text-[9px]">No Hero Background</div>
                    )}
                    <button 
                      type="button"
                      onClick={() => setShowPhotoPicker({ active: true, target: 'hero' })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm"
                    >
                      Pick from Master
                    </button>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowPhotoPicker({ active: true, target: 'hero' })}
                    className="w-full py-3.5 bg-secondary border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-full flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon size={14} /> Browse Master Library
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "about" && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await handleUpdateSettings({
                about_bio: fd.get("about_bio")
              });
            }} className="max-w-4xl bg-card border border-white/5 p-10 rounded-[2.5rem] shadow-premium space-y-8">
              <div className="flex justify-between items-center pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white">Bio & Narrative</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Refine your professional creative biography</p>
                </div>
                {success && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/5 px-4 py-2 rounded-full border border-brand-accent/20">
                     Bio Saved
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="space-y-4 shrink-0">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Persona Portrait</label>
                  <div className="relative aspect-[3/4] w-48 rounded-[2rem] overflow-hidden border border-white/10 bg-background group shadow-2xl">
                    {settings?.about_image_url ? (
                      <Image src={settings.about_image_url} alt="Persona portrait" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 font-bold uppercase tracking-widest text-[8px]">No Portrait</div>
                    )}
                    <button 
                      type="button"
                      onClick={() => setShowPhotoPicker({ active: true, target: 'about' })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm"
                    >
                      Update Portrait
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowPhotoPicker({ active: true, target: 'about' })}
                    className="w-full py-3.5 bg-secondary border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors rounded-full flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon size={14} /> Browse Portrait
                  </button>
                </div>

                <div className="flex-1 space-y-6 w-full">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Narrative Bio Text</label>
                    <textarea 
                      name="about_bio" 
                      defaultValue={settings?.about_bio} 
                      rows={8}
                      className="w-full bg-secondary border border-white/5 px-8 py-6 text-white outline-none rounded-[1.5rem] focus:border-brand-accent shadow-inner resize-none text-sm leading-loose font-medium" 
                      required 
                    />
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full py-5 bg-brand-accent text-black text-[10px] font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all rounded-full flex items-center justify-center gap-2 shadow-brand-glow disabled:opacity-50">
                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save Creative Story
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "accent" && (
            <div className="max-w-4xl bg-card border border-white/5 p-10 rounded-[2.5rem] shadow-premium space-y-8">
              <div className="flex justify-between items-center pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white">Accent Color DNA</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Interact with your global theme colors</p>
                </div>
              </div>

              <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                Surgically adjust the global accent color of the entire website. This will update buttons, glows, borders, and gradients across every page instantly.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => updateAccentColor(preset.color)}
                    className={`group relative flex flex-col items-center gap-3 transition-all ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div 
                      className={`w-14 h-14 rounded-full border-2 transition-all flex items-center justify-center ${activeColor === preset.color ? 'border-white scale-110' : 'border-transparent hover:border-white/20'}`}
                      style={{ backgroundColor: preset.color }}
                    >
                      {activeColor === preset.color && <Check className="text-black" size={24} strokeWidth={4} />}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeColor === preset.color ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Current DNA:</span>
                  <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-white/10 shadow-inner">
                     <div className="w-2.5 h-2.5 rounded-full shadow-glow" style={{ backgroundColor: activeColor }} />
                     <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">{activeColor}</span>
                  </div>
                </div>
                {isSaving && (
                   <div className="flex items-center gap-2 text-brand-accent animate-pulse">
                     <RefreshCw size={12} className="animate-spin" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Syncing Site vibe...</span>
                   </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "featured" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5 max-w-7xl">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white">Featured Photos Carousel</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Select and sequence the highlight photos featured in 'The Edit' homepage list</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsReorderModalOpen(true)}
                    className="px-6 py-3.5 bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 border border-white/5 rounded-full"
                  >
                    <Move size={14} /> Edit Carousel Sequence
                  </button>
                  <button 
                    onClick={() => setShowPhotoPicker({ active: true, target: 'featured' })}
                    className="px-6 py-3.5 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all rounded-full shadow-brand-glow"
                  >
                    Manage Featured
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl">
                 {featuredPhotos.map((photo, i) => (
                   <div 
                     key={photo.id} 
                     className="relative aspect-square bg-card border border-white/5 rounded-2xl overflow-hidden group shadow-premium"
                   >
                      <Image src={photo.image_url} alt="Featured" fill className="object-cover" />
                      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-[8px] font-black px-2.5 py-1 text-white rounded-full border border-white/10">#{i+1}</div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button onClick={() => toggleFeatured(photo)} className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 backdrop-blur-md hover:bg-red-500 hover:text-white transition-all">Remove</button>
                      </div>
                   </div>
                 ))}
                 {featuredPhotos.length === 0 && (
                   <p className="col-span-full py-16 text-center text-zinc-600 font-black uppercase tracking-widest text-xs">No featured photos yet. Click 'Manage Featured' to assign some!</p>
                 )}
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await handleUpdateSettings({
                seo_title_default: fd.get("seo_title_default"),
                seo_description_default: fd.get("seo_description_default")
              });
            }} className="max-w-4xl bg-card border border-white/5 p-10 rounded-[2.5rem] shadow-premium space-y-8">
              <div className="flex justify-between items-center pb-6 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white">SEO Metadata</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Configure global title and meta description fallback settings</p>
                </div>
                {success && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/5 px-4 py-2 rounded-full border border-brand-accent/20">
                     SEO Synced
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SEO Default Title</label>
                  <input name="seo_title_default" defaultValue={settings?.seo_title_default || "RCV.Media | Premium Photography"} required className="w-full bg-secondary border border-white/5 px-6 py-4 text-white outline-none rounded-full focus:border-brand-accent shadow-inner text-sm font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SEO Default Description</label>
                  <textarea 
                    name="seo_description_default" 
                    defaultValue={settings?.seo_description_default || "Premium sports, portraits, seniors, and event photography captured with cinematic energy and state-of-the-art style by Reese Vierling."} 
                    rows={4}
                    className="w-full bg-secondary border border-white/5 px-8 py-6 text-white outline-none rounded-[1.5rem] focus:border-brand-accent shadow-inner resize-none text-sm leading-loose font-medium" 
                    required 
                  />
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="w-full py-5 bg-brand-accent text-black text-[10px] font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all rounded-full flex items-center justify-center gap-2 shadow-brand-glow disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save Search Metadata
              </button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {/* PHOTO PICKER MODAL */}
      {showPhotoPicker.active && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[400] flex items-center justify-center p-8">
           <div className="bg-card border border-white/10 w-full max-w-5xl h-[80vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Master Selector</h2>
                 <button onClick={() => setShowPhotoPicker({ active: false, target: null })} className="p-3 bg-secondary text-white hover:brightness-110 transition-all rounded-full border border-white/10">
                    <X size={20} />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {photos.map(photo => (
                   <div 
                     key={photo.id} 
                     onClick={() => showPhotoPicker.target === 'featured' ? toggleFeatured(photo) : selectPickerPhoto(photo.image_url)}
                     className="relative aspect-square cursor-pointer group border-2 border-transparent hover:border-brand-accent rounded-xl overflow-hidden transition-all hover:shadow-brand-glow"
                   >
                      <Image src={photo.image_url} alt="Selection" fill className="object-cover" />
                      {photo.is_featured && showPhotoPicker.target === 'featured' && (
                        <div className="absolute inset-0 bg-brand-accent/20 flex items-center justify-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-white bg-brand-accent px-3 py-1">Featured</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white">Select</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* CAROUSEL REORDER MODAL */}
      <AnimatePresence>
        {isReorderModalOpen && (
          <div className="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-8 backdrop-blur-2xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-zinc-950 border border-white/5 w-full max-w-6xl rounded-sm flex flex-col h-[85vh] shadow-[0_0_100px_rgba(0,0,0,0.8)]"
             >
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                   <div>
                      <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 italic">The Edit <span className="text-zinc-600 not-italic">//</span> Sequence</h2>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Drag items to surgically arrange your homepage sequence</p>
                   </div>
                   <div className="flex items-center gap-6">
                      {isReordering && (
                        <div className="flex items-center gap-2 text-brand-accent animate-pulse">
                           <RefreshCw size={12} className="animate-spin" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Syncing Hub...</span>
                        </div>
                      )}
                      {hasUnsavedChanges && !isReordering && (
                        <button 
                          onClick={saveReorder}
                          className="px-8 py-4 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-brand-glow flex items-center gap-2 rounded-full"
                        >
                           <Check size={14} strokeWidth={3} /> Apply Sequence
                        </button>
                      )}
                      <button 
                        onClick={() => setIsReorderModalOpen(false)}
                        className="p-4 bg-secondary text-white hover:brightness-110 transition-all rounded-full border border-white/10"
                      >
                         <X size={20} strokeWidth={3} />
                      </button>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12">
                   <Reorder.Group 
                     axis="y" 
                     values={featuredPhotos} 
                     onReorder={handleReorder}
                     className="space-y-4 max-w-3xl mx-auto"
                   >
                      {featuredPhotos.map((photo, i) => (
                        <Reorder.Item 
                          key={photo.id} 
                          value={photo}
                          whileDrag={{ 
                            scale: 1.02, 
                            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                            zIndex: 100 
                          }}
                          className={`relative flex items-center gap-6 p-5 bg-card border-2 transition-all cursor-grab active:cursor-grabbing group rounded-2xl overflow-hidden ${
                            isReordering ? 'opacity-50 grayscale pointer-events-none' : 'border-white/5 hover:border-white/10 shadow-xl'
                          }`}
                        >
                           <div className="w-14 h-14 bg-secondary flex items-center justify-center font-black italic text-zinc-500 border border-white/5 shrink-0 rounded-xl">
                              {i+1}
                           </div>

                           <div className="relative h-20 aspect-[16/10] bg-background border border-white/5 shrink-0 overflow-hidden rounded-lg">
                              <Image src={photo.image_url} alt="Preview" fill className="object-cover pointer-events-none" />
                           </div>

                           <div className="flex-1 min-w-0">
                              <h4 className="text-white font-black uppercase tracking-tight text-xs truncate mb-1">{photo.title || "Untitled Asset"}</h4>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{photo.category || "Featured Photo"}</p>
                           </div>

                           <div className="hidden md:block px-4 py-2 bg-black/40 border border-white/5 rounded-sm">
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Position 0{i+1}</span>
                           </div>

                           <div className="p-4 bg-zinc-950/50 rounded-sm border border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                              <GripVertical size={20} className="text-white" />
                           </div>
                        </Reorder.Item>
                      ))}
                   </Reorder.Group>
                </div>

                <div className="p-8 border-t border-white/5 bg-zinc-900/10 flex justify-center">
                   <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-700">RCV.MEDIA // VISUAL INTELLIGENCE SEQUENCER</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
