"use client";

import { useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  updateBookingStatus, 
  sendMessageToClient, 
  updateBookingPipeline, 
  deliverGallery,
  replyToInquiry,
  updatePricingPackage,
  updateSiteIdentity,
  togglePhotoCurated
} from "@/app/actions/booking";
import { 
  MessageSquare, Send, X, DollarSign, 
  ExternalLink, Package, Layout, Link as LinkIcon,
  Mail, Calendar, Clock, CheckCircle2, AlertCircle, Loader2,
  ChevronRight, Camera, Edit3, ArrowRightLeft, LayoutGrid, List,
  Settings, User, Plus, Trash2, Save, Star, Image as ImageIcon,
  Check, Ban, Archive, MapPin, Quote, Key, Lock, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  { id: 'lead', label: 'Leads', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'shooting', label: 'Shooting', icon: Camera, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'editing', label: 'Editing', icon: Edit3, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'delivered', label: 'Delivered', icon: Send, color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
  { id: 'paid', label: 'Payment Received', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
];

export function BookingsAdminClient({ 
  initialBookings, 
  initialBlockedDates,
  initialSettings,
  albums = [],
  initialInquiries = [],
  initialPackages = [],
  initialPhotos = []
}: { 
  initialBookings: any[], 
  initialBlockedDates: any[],
  initialSettings: any,
  albums?: any[],
  initialInquiries?: any[],
  initialPackages?: any[],
  initialPhotos?: any[]
}) {
  const [activeView, setActiveView] = useState<"pipeline" | "curated" | "inquiries" | "settings" | "archive">("pipeline");
  const [bookings, setBookings] = useState(initialBookings);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [blockedDates, setBlockedDates] = useState(initialBlockedDates);
  const [packages, setPackages] = useState(initialPackages);
  const [photos, setPhotos] = useState(initialPhotos);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Settings State
  const [siteSettings, setSiteSettings] = useState(initialSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Unified Pipeline & Status Handlers
  const handleMoveStage = async (bookingId: string, nextStage: string) => {
    const prevBookings = [...bookings];
    let statusUpdate = {};
    if (nextStage === 'paid') statusUpdate = { status: 'completed' };
    else if (nextStage !== 'lead') statusUpdate = { status: 'confirmed' };
    
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, pipeline_stage: nextStage, ...(statusUpdate as any) } : b));
    setIsProcessing(bookingId);
    const result = await updateBookingPipeline(bookingId, { pipeline_stage: nextStage, ...statusUpdate });
    if (!result.success) {
      setBookings(prevBookings);
      alert(`System sync failed: ${result.error || 'Unknown Error'}`);
    } else router.refresh();
    setIsProcessing(null);
  };

  const handleLinkAlbum = async (bookingId: string, albumId: string) => {
    setIsProcessing(bookingId);
    const result = await updateBookingPipeline(bookingId, { linked_album_id: albumId });
    if (result.success) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, linked_album_id: albumId } : b));
      router.refresh();
    } else {
      alert(`System sync failed: ${result.error || 'Unknown Error'}`);
    }
    setIsProcessing(null);
  };

  const handleSetStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    setIsProcessing(id);
    const prevBookings = [...bookings];
    const pipeline_stage = status === 'confirmed' ? 'confirmed' : 'lead';
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status, pipeline_stage } : b));
    const result = await updateBookingPipeline(id, { status, pipeline_stage });
    if (!result.success) {
      setBookings(prevBookings);
      alert(`System sync failed: ${result.error || 'Unknown Error'}`);
    } else router.refresh();
    setIsProcessing(null);
  };

  const handleUpdatePrice = async (id: string, amount: number) => {
    await updateBookingPipeline(id, { total_amount: amount });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, total_amount: amount } : b));
  };

  const handleSaveIdentity = async () => {
    setIsSavingSettings(true);
    const result = await updateSiteIdentity(siteSettings.id, siteSettings);
    if (result.success) alert("Identity Updated!");
    setIsSavingSettings(false);
    router.refresh();
  };

  const handleSavePackage = async (pkg: any) => {
    const result = await updatePricingPackage(pkg.id, pkg);
    if (result.success) alert(`${pkg.name} Updated!`);
    router.refresh();
  };

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;
    setIsBlocking(true);
    const { data, error } = await supabase.from("blocked_dates").insert([{ date: newBlockDate, reason: "Manual Block" }]).select().single();
    if (!error && data) {
      setBlockedDates(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setNewBlockDate("");
      router.refresh();
    }
    setIsBlocking(false);
  };

  // Filtered Views
  const activePipelineBookings = useMemo(() => bookings.filter(b => b.status !== 'canceled' && b.status !== 'completed'), [bookings]);
  const archivedBookings = useMemo(() => bookings.filter(b => b.status === 'canceled' || b.status === 'completed'), [bookings]);
  const getBookingsByStage = (stageId: string) => activePipelineBookings.filter(b => (b.pipeline_stage || 'lead') === stageId);

  return (
    <div className="space-y-12 pb-20">
      {/* COMMAND CENTER HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/5 pb-12">
        <div className="space-y-2">
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em]">Fulfillment.Active</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">Command <br/> <span className="text-zinc-800">Center.</span></h1>
        </div>

        <div className="flex flex-wrap gap-2">
           <button onClick={() => setActiveView("pipeline")} className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all border ${activeView === 'pipeline' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}><LayoutGrid size={16} /> Workflow</button>
           <button onClick={() => setActiveView("inquiries")} className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all border ${activeView === 'inquiries' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}><Mail size={16} /> Inbox ({inquiries.filter(i => i.status === 'new').length})</button>
           <button onClick={() => setActiveView("archive")} className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all border ${activeView === 'archive' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}><Archive size={16} /> History</button>
           <button onClick={() => setActiveView("settings")} className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all border ${activeView === 'settings' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}><Settings size={16} /> Settings</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === "pipeline" && (
          <motion.div key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
            {/* TIER 1 & 2 PIPELINE - Same as before... */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
              {STAGES.map((stage) => (
                <div key={stage.id} className="flex flex-col space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-sm ${stage.bg} border border-white/5`}>
                    <div className="flex items-center gap-3">
                      <stage.icon size={16} className={stage.color} />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white">{stage.label}</h3>
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                      {getBookingsByStage(stage.id).length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {getBookingsByStage(stage.id).map((booking) => (
                      <ProjectCard 
                        key={booking.id} 
                        booking={booking} 
                        stage={stage} 
                        onMove={handleMoveStage} 
                        onSetStatus={handleSetStatus} 
                        onUpdatePrice={handleUpdatePrice} 
                        albums={albums} 
                        onLinkAlbum={handleLinkAlbum} 
                        isProcessing={isProcessing === booking.id} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === "settings" && (
          <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-16 max-w-5xl">
             {/* 1. BOOKING GUARDRAILS */}
             <div className="premium-card p-10 border border-white/5 bg-zinc-900/20 rounded-sm">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center"><Clock size={20} /></div>
                   <div>
                      <h2 className="text-xl font-black uppercase tracking-tighter text-white">Booking Guardrails</h2>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Control your scheduling window</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div>
                      <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">Min. Advance Notice (Days)</label>
                      <div className="flex items-center gap-6">
                         <input 
                           type="range" min="1" max="60" 
                           value={siteSettings.booking_min_advance_days} 
                           onChange={(e) => setSiteSettings({ ...siteSettings, booking_min_advance_days: parseInt(e.target.value) })}
                           className="flex-1 accent-blue-600"
                         />
                         <span className="text-2xl font-black text-white w-12">{siteSettings.booking_min_advance_days}d</span>
                      </div>
                      <p className="mt-4 text-[10px] text-zinc-500 italic">People must book at least {Math.ceil(siteSettings.booking_min_advance_days / 7)} weeks in advance.</p>
                   </div>

                   <div>
                      <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">Max. Booking Horizon (Days)</label>
                      <div className="flex items-center gap-6">
                         <input 
                           type="range" min="30" max="365" 
                           value={siteSettings.booking_max_advance_days} 
                           onChange={(e) => setSiteSettings({ ...siteSettings, booking_max_advance_days: parseInt(e.target.value) })}
                           className="flex-1 accent-blue-600"
                         />
                         <span className="text-2xl font-black text-white w-12">{siteSettings.booking_max_advance_days}d</span>
                      </div>
                   </div>
                </div>

                <div className="mt-12 flex justify-between items-center pt-8 border-t border-white/5">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${siteSettings.booking_is_active ? 'bg-blue-600' : 'bg-zinc-800'}`} onClick={() => setSiteSettings({ ...siteSettings, booking_is_active: !siteSettings.booking_is_active })}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${siteSettings.booking_is_active ? 'left-5' : 'left-1'}`} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Accepting New Leads</span>
                   </div>
                   <button onClick={handleSaveIdentity} className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all rounded-sm">Update Guardrails</button>
                </div>
             </div>

             {/* 2. PRICING ARCHITECTURE */}
             <div className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Pricing Architecture</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {packages.map((pkg) => (
                     <div key={pkg.id} className="premium-card p-8 border border-white/5 bg-zinc-900/20 rounded-sm">
                        <input className="bg-transparent text-xl font-black uppercase text-white mb-6 border-b border-white/5 outline-none w-full" value={pkg.name} onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? { ...p, name: e.target.value } : p))} />
                        <div className="flex items-center gap-2 mb-6">
                           <DollarSign size={16} className="text-emerald-500" />
                           <input className="bg-transparent text-2xl font-black text-white outline-none" value={pkg.price} onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? { ...p, price: e.target.value } : p))} />
                        </div>
                        <button onClick={() => handleSavePackage(pkg)} className="w-full py-3 bg-white/5 border border-white/10 text-white font-black uppercase text-[9px] tracking-widest hover:bg-white/10 transition-all">Save Changes</button>
                     </div>
                   ))}
                </div>
             </div>

             {/* 3. CALENDAR BLACKOUT */}
             <div className="premium-card p-10 border border-white/5 bg-zinc-900/20 rounded-sm">
                <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-8">Calendar Blackout</h2>
                <form onSubmit={handleBlockDate} className="flex gap-4 mb-8">
                   <input required type="date" value={newBlockDate} onChange={(e) => setNewBlockDate(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-sm px-6 py-3 text-white text-xs" />
                   <button disabled={isBlocking} className="px-8 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-sm hover:bg-zinc-200 transition-all">Block Date</button>
                </form>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {blockedDates.map((date) => (
                     <div key={date.id} className="flex justify-between items-center p-4 bg-black/40 rounded-sm border border-white/5 group">
                        <span className="text-zinc-300 font-bold uppercase tracking-widest text-[9px]">{new Date(date.date).toLocaleDateString()}</span>
                        <button onClick={async () => { await supabase.from("blocked_dates").delete().eq("id", date.id); setBlockedDates(prev => prev.filter(d => d.id !== date.id)); }} className="text-zinc-800 group-hover:text-red-500 transition-colors"><X size={14} /></button>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
        
        {/* Inbox & Archive views... */}
      </AnimatePresence>
    </div>
  );
}

// ProjectCard remains the same Fulfillment Engine...
function ProjectCard({ booking, stage, onMove, onSetStatus, onUpdatePrice, albums, onLinkAlbum, isProcessing }: any) {
  const [isDelivering, setIsDelivering] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAlbumLinker, setShowAlbumLinker] = useState(false);
  const linkedAlbum = albums.find((a: any) => a.id === booking.linked_album_id);

  const handleGalleryDelivery = async () => {
    setIsDelivering(true);
    const result = await deliverGallery(booking.id);
    if (result.success) {
      alert("Gallery Link Dispatched to Client!");
    } else {
      alert("Gallery delivery failed. Check Resend logs.");
    }
    setIsDelivering(false);
  };

  return (
    <>
      <motion.div layout className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 rounded-sm relative group hover:border-white/20 transition-all">
        {isProcessing && (<div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-sm"><Loader2 className="animate-spin text-blue-500" /></div>)}
        <div className="flex justify-between items-start mb-6">
            <div className="cursor-pointer group/title" onClick={() => setShowDetails(true)}>
              <h4 className="text-lg font-black uppercase tracking-tight text-white mb-1 leading-none group-hover/title:text-blue-500 transition-colors">{booking.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{booking.shoot_type || booking.package_selected}</span>
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-1"><AlertCircle size={10} /> Details</span>
              </div>
            </div>
            {stage.id === 'lead' ? (
              <button onClick={() => onSetStatus(booking.id, 'cancelled')} className="px-3 py-1 bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all rounded-sm">
                Cancel Request
              </button>
            ) : (
              <button onClick={() => onSetStatus(booking.id, 'cancelled')} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            )}
        </div>
        
        <div className="space-y-4 mb-6">
            {(stage.id === 'lead' || stage.id === 'confirmed') && booking.message && (
              <div className="bg-black/30 p-4 rounded-sm border border-white/5 relative cursor-pointer" onClick={() => setShowDetails(true)}>
                <Quote size={12} className="absolute -top-2 -left-1 text-zinc-800" />
                <p className="text-[11px] text-zinc-500 italic leading-relaxed line-clamp-2">"{booking.message}"</p>
              </div>
            )}
            
            {(stage.id === 'confirmed' || stage.id === 'shooting') && (
              <div className="flex items-center gap-3 text-zinc-400">
                <MapPin size={14} className="text-zinc-600 shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-tight truncate">{booking.location || "Location TBD"}</p>
              </div>
            )}

            {stage.id === 'editing' && (
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Fulfillment Asset</span>
                {linkedAlbum ? (
                  <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/20 rounded-sm">
                    <div className="flex items-center gap-3">
                      <ImageIcon size={14} className="text-blue-500" />
                      <span className="text-[11px] font-bold uppercase text-white truncate max-w-[120px]">{linkedAlbum.title}</span>
                    </div>
                    <button onClick={() => setShowAlbumLinker(true)} className="text-[9px] font-black uppercase text-blue-500 hover:text-white">Change</button>
                  </div>
                ) : (
                  <button onClick={() => setShowAlbumLinker(true)} className="w-full py-3 border border-dashed border-zinc-800 text-zinc-600 hover:border-blue-500 hover:text-blue-500 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Link Gallery
                  </button>
                )}
              </div>
            )}

            {stage.id === 'delivered' && (
              <div className="space-y-4 bg-zinc-950 p-4 border border-white/5 rounded-sm">
                <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  <CheckCircle size={14} /> Ready for Delivery
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LinkIcon size={12} className="text-zinc-600" />
                    <span className="text-[10px] text-zinc-400 font-mono">/gallery/{linkedAlbum?.slug || '...'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock size={12} className="text-zinc-600" />
                    <span className="text-[10px] text-white font-mono bg-white/5 px-2 py-0.5 rounded-sm">PASS: {linkedAlbum?.passcode || 'PENDING'}</span>
                  </div>
                </div>
                <button 
                  disabled={isDelivering || !linkedAlbum}
                  onClick={handleGalleryDelivery} 
                  className="w-full py-3 bg-blue-600 text-white font-black uppercase text-[9px] tracking-widest rounded-sm hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDelivering ? <Loader2 className="animate-spin" size={12} /> : <Send size={12} />} 
                  {isDelivering ? 'Dispatching...' : 'Email Gallery Link'}
                </button>
              </div>
            )}
        </div>

        <div className="space-y-5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 text-zinc-500">
                  <Calendar size={12} />
                  <span>{booking.event_date || 'Date TBD'}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-500">
                  <DollarSign size={14} />
                  <input 
                    type="number" 
                    className="bg-transparent w-20 text-white font-black text-sm outline-none" 
                    defaultValue={booking.total_amount || 0} 
                    onBlur={(e) => onUpdatePrice(booking.id, parseFloat(e.target.value))} 
                  />
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-white/5">
              <button disabled={stage.id === 'lead'} onClick={() => { const idx = STAGES.findIndex(s => s.id === stage.id); onMove(booking.id, STAGES[idx-1].id); }} className="flex-1 py-3 bg-zinc-800 text-white rounded-sm disabled:opacity-20 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                  <ChevronRight size={16} className="rotate-180" />
              </button>
              <button onClick={() => { const idx = STAGES.findIndex(s => s.id === stage.id); onMove(booking.id, STAGES[idx+1].id); }} className={`flex-[3] py-3 rounded-sm flex items-center justify-center font-black uppercase text-[10px] tracking-[0.2em] gap-2 transition-all ${stage.id === 'delivered' ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-white text-black hover:bg-zinc-200'}`}>
                  {stage.id === 'lead' ? 'CONFIRM LEAD' : stage.id === 'delivered' ? 'PAYMENT RECEIVED' : 'NEXT STAGE'} <ChevronRight size={16} />
              </button>
            </div>
        </div>

        {/* Album Linker Overlay */}
        <AnimatePresence>
          {showAlbumLinker && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 z-[100] bg-black/95 p-6 flex flex-col rounded-sm">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Link Gallery</h4>
                <button onClick={() => setShowAlbumLinker(false)} className="text-zinc-500 hover:text-white"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {albums.map((album: any) => (
                  <button 
                    key={album.id} 
                    onClick={() => { onLinkAlbum(booking.id, album.id); setShowAlbumLinker(false); }} 
                    className={`w-full p-4 text-left rounded-sm border transition-all ${booking.linked_album_id === album.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                  >
                    <p className="text-[11px] font-bold uppercase text-white truncate">{album.title}</p>
                    <p className="text-[9px] text-zinc-500 uppercase">{album.is_private ? 'Private Vault' : 'Public Gallery'}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* SHOOT DETAILS MODAL */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full max-w-2xl bg-zinc-900 border border-white/10 p-10 rounded-sm shadow-2xl relative">
              <button onClick={() => setShowDetails(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
              
              <div className="mb-10">
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Project Details</span>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-none mb-2">{booking.name}</h2>
                <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest">{booking.email} • {booking.phone || 'No Phone'}</p>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Shoot Type / Package</p>
                    <p className="text-sm font-bold text-white uppercase">{booking.shoot_type || booking.package_selected}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Location</p>
                    <p className="text-sm font-bold text-white uppercase">{booking.location || 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Logistics</p>
                    <p className="text-sm font-bold text-white uppercase">{booking.event_date} @ {booking.event_time || 'TBD'}</p>
                  </div>
                </div>

                <div className="space-y-6 bg-black/30 p-6 border border-white/5 rounded-sm">
                  <div>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Financial Snapshot</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-white">$</span>
                      <input 
                        type="number" 
                        className="bg-transparent text-3xl font-black text-white outline-none w-full" 
                        defaultValue={booking.total_amount || 0} 
                        onBlur={(e) => onUpdatePrice(booking.id, parseFloat(e.target.value))} 
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Payment Status</p>
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${booking.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {booking.payment_status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {booking.message && (
                <div className="mb-10 p-6 bg-zinc-950 border-l-2 border-blue-600">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-4">Client Message</p>
                  <p className="text-zinc-400 text-sm leading-relaxed italic">"{booking.message}"</p>
                </div>
              )}

              <div className="flex gap-4 pt-10 border-t border-white/5">
                <button onClick={() => setShowDetails(false)} className="flex-1 py-4 bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-zinc-200 transition-all rounded-sm">Close Dashboard</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
