"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, ArrowRight, Download, Image as ImageIcon,
  ChevronLeft, ChevronRight, X, Maximize2,
  Loader2, Save, Calendar, CreditCard, ShieldCheck, FileText, MapPin, Clock, RefreshCw
} from "lucide-react";
import { validateVaultAccess, submitInspiration } from "@/app/actions/booking";
import { CldUploadButton } from "next-cloudinary";
import { createClient } from "@/utils/supabase/client";

export function VaultClient({ 
  album, 
  photos, 
  booking, 
  requiresInspiration 
}: { 
  album: any, 
  photos: any[], 
  booking?: any, 
  requiresInspiration?: boolean 
}) {
  const supabase = createClient();
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(!album.is_private);
  const [isValidating, setIsValidating] = useState(false);
  const [isSavingInspo, setIsSavingInspo] = useState(false);
  const [showInspoForm, setShowInspoForm] = useState(false);
  const [inspoData, setInspoData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  useEffect(() => {
    // Check session storage for existing unlock
    if (album.is_private) {
      const stored = sessionStorage.getItem(`vault_unlocked_${album.id}`);
      if (stored === 'true') {
        setIsUnlocked(true);
      }
    }
  }, [album.id, album.is_private]);

  useEffect(() => {
    if (isUnlocked && booking?.id) {
      async function fetchInspo() {
        const { data } = await supabase
          .from("booking_inspiration")
          .select("*")
          .eq("booking_id", booking.id)
          .single();
        if (data) setInspoData(data);
      }
      fetchInspo();
    }
  }, [isUnlocked, booking?.id, supabase]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidating) return;

    setIsValidating(true);
    const result = await validateVaultAccess(album.id, passcode);
    
    if (result.success) {
      setIsUnlocked(true);
      sessionStorage.setItem(`vault_unlocked_${album.id}`, 'true');
      setError(false);
    } else {
      setError(true);
      setPasscode("");
      setTimeout(() => setError(false), 500);
    }
    setIsValidating(false);
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
           <img 
             src={album.cover_image_url || "https://images.unsplash.com/photo-1541252876101-08144b679468?q=80&w=2070&auto=format&fit=crop"} 
             className="w-full h-full object-cover opacity-20 blur-xl scale-110" 
             alt="background"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(37,99,235,0.3)]">
             <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Private Vault</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-12">
            Secure Gallery for <span className="text-white">{album.client_name || album.title}</span>
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
             <div className="relative">
                <input 
                   disabled={isValidating}
                   type="text" 
                   value={passcode}
                   onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                   placeholder="ENTER PASSCODE"
                   className={`w-full bg-zinc-900/50 border ${error ? 'border-red-500' : 'border-white/10'} px-8 py-6 text-white text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-brand-accent/50 transition-all rounded-sm backdrop-blur-xl uppercase disabled:opacity-50`}
                   autoFocus
                />
                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4"
                  >
                    Incorrect Passcode
                  </motion.p>
                )}
             </div>
             <button 
               type="submit"
               disabled={isValidating}
               className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
             >
               {isValidating ? (
                 <Loader2 className="animate-spin" size={16} />
               ) : (
                 <>Unlock Access <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
               )}
             </button>
          </form>
        </motion.div>

        <footer className="absolute bottom-12 text-center z-10">
           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
             RCV.Media Digital Asset Delivery
           </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div>
                <span className="text-brand-accent text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Client Portal</span>
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white mb-4 leading-none">
                  {album.title}
                </h1>
                <p className="text-zinc-500 font-light text-xl uppercase tracking-widest">{album.client_name || "Photography Collection"}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                 {requiresInspiration && (
                   <button 
                     onClick={() => setShowInspoForm(true)}
                     className="px-8 py-4 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all rounded-sm shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                   >
                      <ImageIcon size={14} /> {inspoData ? 'Update Inspiration' : 'Submit Inspiration'}
                   </button>
                 )}
                 <button className="px-8 py-4 premium-glass text-white text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all">
                    <Download size={14} /> Download All (Zip)
                 </button>
                 {booking && (
                   <a 
                     href={`/book?name=${encodeURIComponent(booking.name)}&email=${encodeURIComponent(booking.email)}&phone=${encodeURIComponent(booking.phone || '')}&past_client=true`}
                     className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-200 transition-all rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                   >
                      <RefreshCw size={14} /> Book Another Session
                   </a>
                 )}
              </div>
           </div>
        </header>

        {/* PROJECT DASHBOARD */}
        {booking && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
             {/* 1. SESSION LOGISTICS */}
             <div className="premium-card p-10 bg-zinc-900/20 border border-white/5 rounded-sm">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-brand-accent"><Calendar size={20} /></div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Session Logistics</h3>
                </div>
                <div className="space-y-6">
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Shoot Date</span>
                      <span className="text-xs font-black text-white">{new Date(booking.event_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Start Time</span>
                      <span className="text-xs font-black text-white">{booking.event_time || "TBD"}</span>
                   </div>
                   <div className="flex justify-between items-start pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Location</span>
                      <span className="text-xs font-black text-white text-right max-w-[150px]">{booking.location || "Not Specified"}</span>
                   </div>
                </div>
             </div>

             {/* 2. INVESTMENT & STATUS */}
             <div className="premium-card p-10 bg-zinc-900/20 border border-white/5 rounded-sm">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-emerald-500"><CreditCard size={20} /></div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Financials</h3>
                </div>
                <div className="space-y-6">
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Package</span>
                      <span className="text-xs font-black text-white">{booking.package_selected || booking.shoot_type}</span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Payment Status</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${booking.final_paid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                         {booking.final_paid ? 'Settled' : 'Pending'}
                      </span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Contract</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${booking.contract_status === 'signed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                         {booking.contract_status === 'signed' ? 'Executed' : 'Pending Signature'}
                      </span>
                   </div>
                </div>
             </div>

             {/* 3. PREP & NOTES */}
             <div className="premium-card p-10 bg-zinc-900/20 border border-white/5 rounded-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <FileText size={80} />
                </div>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-amber-500"><ShieldCheck size={20} /></div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Preparation</h3>
                </div>
                <div className="space-y-6">
                   <div className="p-4 bg-black/40 rounded-sm border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Important Note</p>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                         {booking.client_notes || "Please arrive 10-15 minutes early to allow for gear setup and light testing."}
                      </p>
                   </div>
                   {booking.pricing_packages?.prep_guide && (
                     <a 
                       href={booking.pricing_packages.prep_guide}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[9px] rounded-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
                     >
                        <ArrowRight size={14} /> Open Preparation Guide
                     </a>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* INSPIRATION MODAL/OVERLAY */}
        <AnimatePresence>
          {showInspoForm && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 overflow-y-auto"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-auto"
              >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950/50">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Shoot Inspiration</h2>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Help me deliver exactly what you want</p>
                   </div>
                   <button onClick={() => setShowInspoForm(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all">
                      <X size={20} />
                   </button>
                </div>

                <form className="p-8 space-y-8" onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSavingInspo(true);
                  const fd = new FormData(e.currentTarget);
                  const data = {
                    vibe_description: fd.get('vibe_description'),
                    favorite_poses: fd.get('favorite_poses'),
                    preferred_locations: fd.get('preferred_locations'),
                    outfit_plans: fd.get('outfit_plans'),
                    disliked_photos: fd.get('disliked_photos'),
                    inspo_images: inspoData?.inspo_images || []
                  };
                  const res = await submitInspiration(booking.id, data);
                  if (res.success) {
                    setInspoData({ ...inspoData, ...data });
                    setShowInspoForm(false);
                  }
                  setIsSavingInspo(false);
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Describe the Vibe</label>
                        <textarea name="vibe_description" defaultValue={inspoData?.vibe_description} className="w-full bg-black border border-white/5 rounded-sm p-4 text-white text-sm outline-none focus:border-brand-accent min-h-[100px]" placeholder="Energetic, moody, clean, professional..." />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Favorite Poses</label>
                        <textarea name="favorite_poses" defaultValue={inspoData?.favorite_poses} className="w-full bg-black border border-white/5 rounded-sm p-4 text-white text-sm outline-none focus:border-brand-accent min-h-[100px]" placeholder="Action shots, leaning against wall, close-ups..." />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preferred Locations</label>
                        <textarea name="preferred_locations" defaultValue={inspoData?.preferred_locations} className="w-full bg-black border border-white/5 rounded-sm p-4 text-white text-sm outline-none focus:border-brand-accent min-h-[100px]" placeholder="Stadium, downtown, park, specific studio..." />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Outfit Plans</label>
                        <textarea name="outfit_plans" defaultValue={inspoData?.outfit_plans} className="w-full bg-black border border-white/5 rounded-sm p-4 text-white text-sm outline-none focus:border-brand-accent min-h-[100px]" placeholder="Jerseys, suit, casual streetwear..." />
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Photos/Styles You Do NOT Like</label>
                     <textarea name="disliked_photos" defaultValue={inspoData?.disliked_photos} className="w-full bg-black border border-red-500/5 rounded-sm p-4 text-white text-sm outline-none focus:border-red-500/30 min-h-[80px]" placeholder="I don't like heavy filters, I don't like wide-angle distortions..." />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Visual Inspiration (Images)</label>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {inspoData?.inspo_images?.map((url: string, idx: number) => (
                           <div key={idx} className="aspect-square relative rounded-sm overflow-hidden border border-white/5">
                              <img src={url} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newImages = inspoData.inspo_images.filter((_: any, i: number) => i !== idx);
                                  setInspoData({ ...inspoData, inspo_images: newImages });
                                }}
                                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
                              >
                                 <X size={10} />
                              </button>
                           </div>
                        ))}
                        <CldUploadButton
                          uploadPreset="rcv_media_unsigned" // Ensure this exists in Cloudinary
                          onSuccess={(result: any) => {
                            const url = result.info.secure_url;
                            const currentImages = inspoData?.inspo_images || [];
                            setInspoData({ ...inspoData, inspo_images: [...currentImages, url] });
                          }}
                          className="aspect-square border border-dashed border-white/10 rounded-sm flex flex-col items-center justify-center gap-2 hover:border-brand-accent hover:bg-brand-accent/5 transition-all group"
                        >
                           <ImageIcon size={20} className="text-zinc-600 group-hover:text-brand-accent" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-brand-accent">Add Image</span>
                        </CldUploadButton>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-4">
                     <button 
                       type="submit"
                       disabled={isSavingInspo}
                       className="flex-1 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                     >
                        {isSavingInspo ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Inspiration Board</>}
                     </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {photos.map((photo, i) => (
             <motion.div 
               key={photo.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="group relative aspect-[4/5] bg-zinc-900 rounded-sm overflow-hidden cursor-pointer"
               onClick={() => setSelectedPhoto(photo)}
             >
                <img 
                  src={photo.image_url} 
                  alt={photo.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <div className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white">
                      <Maximize2 size={20} />
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {photos.length === 0 && (
          <div className="py-40 text-center">
             <ImageIcon className="mx-auto text-zinc-800 mb-6" size={60} />
             <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">No photos have been added to this vault yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex flex-col"
          >
             <header className="p-8 flex justify-between items-center relative z-10">
                <div>
                   <h3 className="text-white font-black uppercase tracking-widest text-xs">{selectedPhoto.title || album.title}</h3>
                </div>
                <div className="flex gap-4">
                   <a 
                     href={selectedPhoto.image_url} 
                     download 
                     className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all flex items-center gap-2"
                   >
                      <Download size={20} /> <span className="text-[10px] font-black uppercase tracking-widest">Download High-Res</span>
                   </a>
                   <button onClick={() => setSelectedPhoto(null)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all">
                      <X size={20} />
                   </button>
                </div>
             </header>

             <div className="flex-1 flex items-center justify-center p-4 md:p-20">
                <motion.img 
                  layoutId={selectedPhoto.id}
                  src={selectedPhoto.image_url}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
