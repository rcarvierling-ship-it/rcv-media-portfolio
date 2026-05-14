"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, ArrowRight, Download, Image as ImageIcon,
  ChevronLeft, ChevronRight, X, Maximize2,
  Loader2
} from "lucide-react";
import { validateVaultAccess } from "@/app/actions/booking";

export function VaultClient({ album, photos }: { album: any, photos: any[] }) {
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(!album.is_private);
  const [isValidating, setIsValidating] = useState(false);
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
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(37,99,235,0.3)]">
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
                   className={`w-full bg-zinc-900/50 border ${error ? 'border-red-500' : 'border-white/10'} px-8 py-6 text-white text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-blue-500/50 transition-all rounded-sm backdrop-blur-xl uppercase disabled:opacity-50`}
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
        <header className="mb-20">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div>
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Client Delivery</span>
                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white mb-4 leading-none">
                  {album.title}
                </h1>
                <p className="text-zinc-500 font-light text-xl uppercase tracking-widest">{album.client_name || "Photography Collection"}</p>
              </div>
              <div className="flex gap-4">
                 <button className="px-8 py-4 premium-glass text-white text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all">
                    <Download size={14} /> Download All (Zip)
                 </button>
              </div>
           </div>
        </header>

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
