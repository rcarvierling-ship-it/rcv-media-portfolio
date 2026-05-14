"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Palette, Check, RefreshCw, GripVertical, Move, X, Maximize2 } from "lucide-react";
import { reorderPhotos } from "@/app/actions/photos";

const COLOR_PRESETS = [
  { name: "Electric Blue", color: "#3b82f6" },
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
  const [featuredPhotos, setFeaturedPhotos] = useState(
    allPhotos.filter(p => p.is_featured).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  );
  const [showPhotoPicker, setShowPhotoPicker] = useState<{ active: boolean, target: 'hero' | 'featured' }>({ active: false, target: 'hero' });
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [activeColor, setActiveColor] = useState(initialSettings?.accent_color || "#3b82f6");
  
  const supabase = createClient();
  const router = useRouter();


  const updateAccentColor = async (color: string) => {
    setActiveColor(color);
    setIsSaving(true);
    const { error } = await supabase.from("site_settings").update({ accent_color: color }).eq("id", settings.id);
    if (!error) {
      router.refresh();
      // To show immediate effect without refresh if possible, but refresh is safer
      setTimeout(() => window.location.reload(), 500);
    }
    setIsSaving(false);
  };

  const updateHeroImage = async (url: string) => {
    setIsSaving(true);
    const { error } = await supabase.from("site_settings").update({ hero_image_url: url }).eq("id", settings.id);
    if (!error) {
      setSettings({ ...settings, hero_image_url: url });
      setShowPhotoPicker({ active: false, target: 'hero' });
      router.refresh();
    }
    setIsSaving(false);
  };

  const toggleFeatured = async (photo: any) => {
    const isNowFeatured = !photo.is_featured;
    const { error } = await supabase.from("photos").update({ is_featured: isNowFeatured }).eq("id", photo.id);
    if (!error) {
       router.refresh();
       window.location.reload(); 
    }
  };

  const handleReorder = async (newOrder: any[]) => {
    setFeaturedPhotos(newOrder);
    setIsReordering(true);
    try {
      const updates = newOrder.map((p, i) => ({ id: p.id, sort_order: i + 1 }));
      await reorderPhotos(updates);
    } catch (err) {
      console.error("Reorder failed:", err);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-16 pb-24">
      
      {/* 0. VIBE SWITCH (ACCENT COLOR) */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Palette className="text-zinc-500" size={20} />
          <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500">The Vibe Switch</h2>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-xl backdrop-blur-sm">
          <p className="text-zinc-500 text-sm mb-8 max-w-2xl leading-relaxed">
            Change the global accent color of the entire website. This will update buttons, glows, borders, and gradients across every page instantly.
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

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Current Theme:</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-black rounded-full border border-white/10">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColor }} />
                 <span className="text-[10px] font-mono text-zinc-400 uppercase">{activeColor}</span>
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
      </section>

      {/* 1. HERO SECTION EDITOR */}
      <section>
        <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-6">Homepage Hero</h2>
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video bg-black rounded-sm overflow-hidden border border-zinc-800">
               {settings?.hero_image_url ? (
                 <Image src={settings.hero_image_url} alt="Hero" fill className="object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-zinc-700 font-bold uppercase tracking-widest text-xs">No Hero Image</div>
               )}
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-black uppercase tracking-tight text-lg mb-2">Main Hero Image</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-6">This is the large split image shown on the homepage hero section.</p>
                <button 
                  onClick={() => setShowPhotoPicker({ active: true, target: 'hero' })}
                  className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  Change Hero Image
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CONTENT EDITOR */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-2">Featured Photos</h2>
            <p className="text-zinc-600 text-xs">These 6 images appear in the "The Edit" section on the homepage.</p>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={() => setIsReorderModalOpen(true)}
               className="px-6 py-3 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all flex items-center gap-2 border border-white/5"
             >
               <Move size={14} /> Edit Carousel Order
             </button>
             <button 
               onClick={() => setShowPhotoPicker({ active: true, target: 'featured' })}
               className="text-xs font-black uppercase tracking-widest text-brand-accent hover:text-brand-accent flex items-center gap-2"
             >
               Manage Featured
             </button>
          </div>
        </div>
 
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
           {featuredPhotos.map((photo, i) => (
             <div 
               key={photo.id} 
               className="relative aspect-square bg-zinc-900 border border-zinc-800 overflow-hidden group"
             >
                <Image src={photo.image_url} alt="Featured" fill className="object-cover" />
                <div className="absolute top-2 left-2 bg-black/80 text-[8px] font-black px-2 py-1 text-white rounded-full">#{i+1}</div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button onClick={() => toggleFeatured(photo)} className="text-[8px] font-black uppercase tracking-widest text-red-500">Remove</button>
                </div>
             </div>
           ))}
           {featuredPhotos.length < 6 && (
             <button 
                onClick={() => setShowPhotoPicker({ active: true, target: 'featured' })}
                className="aspect-square border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 hover:border-zinc-500 hover:text-zinc-500 transition-all"
             >
                <span className="text-xs font-black uppercase tracking-widest">Add Slot</span>
             </button>
           )}
        </div>
      </section>

      {/* PHOTO PICKER MODAL */}
      {showPhotoPicker.active && (
        <div className="fixed inset-0 bg-black/95 z-[400] flex items-center justify-center p-8">
           <div className="bg-zinc-950 border border-zinc-900 w-full max-w-5xl h-[80vh] flex flex-col">
              <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
                 <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Select Image</h2>
                 <button onClick={() => setShowPhotoPicker({ active: false, target: 'hero' })} className="text-zinc-500 hover:text-white">Close</button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {photos.map(photo => (
                   <div 
                     key={photo.id} 
                     onClick={() => showPhotoPicker.target === 'hero' ? updateHeroImage(photo.image_url) : toggleFeatured(photo)}
                     className="relative aspect-square cursor-pointer group border-2 border-transparent hover:border-brand-accent transition-all"
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
                      <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 italic">The Edit <span className="text-zinc-600 not-italic">//</span> Reorder</h2>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Drag items to surgically arrange your homepage sequence</p>
                   </div>
                   <div className="flex items-center gap-6">
                      {isReordering && (
                        <div className="flex items-center gap-2 text-brand-accent animate-pulse">
                           <RefreshCw size={12} className="animate-spin" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Syncing Order...</span>
                        </div>
                      )}
                      <button 
                        onClick={() => setIsReorderModalOpen(false)}
                        className="p-4 bg-white text-black hover:bg-zinc-200 transition-all rounded-full shadow-2xl"
                      >
                         <Check size={20} strokeWidth={4} />
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
                          className={`relative flex items-center gap-6 p-4 bg-zinc-900 border-2 transition-all cursor-grab active:cursor-grabbing group rounded-sm overflow-hidden ${
                            isReordering ? 'border-brand-accent shadow-[0_0_20px_var(--accent-glow)]' : 'border-white/5 hover:border-white/10 shadow-xl'
                          }`}
                        >
                           {/* Index Badge */}
                           <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center font-black italic text-zinc-500 border border-white/5 shrink-0">
                              {i+1}
                           </div>

                           {/* Preview Image */}
                           <div className="relative h-20 aspect-[16/10] bg-black border border-white/5 shrink-0 overflow-hidden">
                              <Image src={photo.image_url} alt="Preview" fill className="object-cover pointer-events-none" />
                           </div>

                           {/* Details */}
                           <div className="flex-1 min-w-0">
                              <h4 className="text-white font-black uppercase tracking-tight text-xs truncate mb-1">{photo.title || "Untitled Asset"}</h4>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{photo.category || "Featured Photo"}</p>
                           </div>

                           {/* Position Label */}
                           <div className="hidden md:block px-4 py-2 bg-black/40 border border-white/5 rounded-sm">
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Position 0{i+1}</span>
                           </div>

                           {/* Grip Handle */}
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
