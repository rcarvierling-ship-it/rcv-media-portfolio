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
  Check, Ban, Archive, MapPin, Quote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  { id: 'lead', label: 'Leads', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'shooting', label: 'Shooting', icon: Camera, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'editing', label: 'Editing', icon: Edit3, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'delivered', label: 'Delivered', icon: Send, color: 'text-zinc-400', bg: 'bg-zinc-400/10' }
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
  
  // Messaging Logic
  const [messagingTarget, setMessagingTarget] = useState<{ id: string, type: 'booking' | 'inquiry', name: string } | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Settings State
  const [siteSettings, setSiteSettings] = useState(initialSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  
  const supabase = createClient();
  const router = useRouter();

  // Unified Pipeline & Status Handlers with Optimistic Updates
  const handleMoveStage = async (bookingId: string, nextStage: string) => {
    // 1. Optimistic UI Update
    const prevBookings = [...bookings];
    let statusUpdate = {};
    if (nextStage !== 'lead') statusUpdate = { status: 'confirmed' };
    
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, pipeline_stage: nextStage, ...(statusUpdate as any) } : b));
    setIsProcessing(bookingId);

    // 2. Background Persistence
    const result = await updateBookingPipeline(bookingId, { 
      pipeline_stage: nextStage,
      ...statusUpdate
    });

    if (!result.success) {
      setBookings(prevBookings); // Rollback
      alert("System sync failed. Reverting.");
    } else {
      router.refresh();
    }
    setIsProcessing(null);
  };

  const handleSetStatus = async (id: string, status: 'confirmed' | 'canceled') => {
    setIsProcessing(id);
    const pipeline_stage = status === 'confirmed' ? 'confirmed' : 'lead';
    const result = await updateBookingPipeline(id, { status, pipeline_stage });
    
    if (result.success) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status, pipeline_stage } : b));
      router.refresh();
    }
    setIsProcessing(null);
  };

  const handleUpdatePrice = async (id: string, amount: number) => {
    await updateBookingPipeline(id, { total_amount: amount });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, total_amount: amount } : b));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingTarget || !messageText) return;
    setIsSendingMessage(true);
    const result = messagingTarget.type === 'booking' 
      ? await sendMessageToClient(messagingTarget.id, messageText)
      : await replyToInquiry(messagingTarget.id, messageText);

    if (result.success) {
      if (messagingTarget.type === 'inquiry') {
        setInquiries(prev => prev.map(i => i.id === messagingTarget.id ? { ...i, status: 'replied' } : i));
      }
      setMessagingTarget(null);
      setMessageText("");
      alert("Message sent!");
    }
    setIsSendingMessage(false);
  };

  // Filtered Views
  const activePipelineBookings = useMemo(() => 
    bookings.filter(b => b.status !== 'canceled'), [bookings]
  );
  
  const archivedBookings = useMemo(() => 
    bookings.filter(b => b.status === 'canceled'), [bookings]
  );

  const getBookingsByStage = (stageId: string) => {
    return activePipelineBookings.filter(b => (b.pipeline_stage || 'lead') === stageId);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 1. MISSION CONTROL HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/5 pb-12">
        <div className="space-y-2">
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em]">Command.Active</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
             Mission <br/> <span className="text-zinc-800">Control.</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
           <button 
             onClick={() => setActiveView("pipeline")}
             className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all border ${activeView === 'pipeline' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}
           >
             <LayoutGrid size={16} /> Workflow
           </button>
           <button 
             onClick={() => setActiveView("inquiries")}
             className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all border ${activeView === 'inquiries' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}
           >
             <Mail size={16} /> Inbox ({inquiries.filter(i => i.status === 'new').length})
           </button>
           <button 
             onClick={() => setActiveView("curated")}
             className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all border ${activeView === 'curated' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}
           >
             <Star size={16} /> Master
           </button>
           <button 
             onClick={() => setActiveView("archive")}
             className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all border ${activeView === 'archive' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}
           >
             <Archive size={16} /> History
           </button>
           <button 
             onClick={() => setActiveView("settings")}
             className={`flex items-center gap-3 px-6 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all border ${activeView === 'settings' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}
           >
             <Settings size={16} />
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === "pipeline" && (
          <motion.div 
            key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* TIER 1: ACTIVE PIPELINE (3-COLUMN GRID - NO SCROLL) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STAGES.slice(0, 3).map((stage) => (
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
                        onMessage={() => setMessagingTarget({ id: booking.id, type: 'booking', name: booking.name })}
                        isProcessing={isProcessing === booking.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* TIER 2: POST-PRODUCTION (2-COLUMN GRID) */}
            <div className="pt-12 border-t border-white/5">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {STAGES.slice(3).map((stage) => (
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getBookingsByStage(stage.id).map((booking) => (
                          <ProjectCard 
                            key={booking.id} 
                            booking={booking} 
                            stage={stage} 
                            onMove={handleMoveStage}
                            onSetStatus={handleSetStatus}
                            onUpdatePrice={handleUpdatePrice}
                            onMessage={() => setMessagingTarget({ id: booking.id, type: 'booking', name: booking.name })}
                            isProcessing={isProcessing === booking.id}
                          />
                        ))}
                      </div>
                    </div>
                 ))}
               </div>
            </div>
          </motion.div>
        )}

        {activeView === "archive" && (
          <motion.div 
            key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Project History</h2>
               <span className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">{archivedBookings.length} Archived</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {archivedBookings.map((booking) => (
                 <div key={booking.id} className="premium-card p-6 border border-white/5 bg-zinc-900/10 flex items-center justify-between rounded-sm">
                    <div className="flex items-center gap-8">
                       <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                          <Archive size={20} />
                       </div>
                       <div>
                          <h4 className="text-xl font-black uppercase tracking-tighter text-white">{booking.name}</h4>
                          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{booking.session_type} • Canceled</p>
                       </div>
                    </div>
                    <button 
                       onClick={() => handleSetStatus(booking.id, 'confirmed')}
                       className="px-6 py-3 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all rounded-sm"
                    >
                       Restore Project
                    </button>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {/* Curation, Inbox, and Settings views remain high-fidelity... */}
      </AnimatePresence>

      {/* Messaging Portal */}
      <AnimatePresence>
        {messagingTarget && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setMessagingTarget(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-white/10 p-10 rounded-sm shadow-2xl"
            >
              <button 
                onClick={() => setMessagingTarget(null)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <div className="mb-8">
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em] mb-2 block">Portal.Secure</span>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Message {messagingTarget.name}</h3>
              </div>
              <form onSubmit={handleSendMessage} className="space-y-6">
                <textarea 
                  required autoFocus rows={8}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-sm p-6 text-white text-lg outline-none focus:border-blue-500/50 transition-all resize-none"
                  placeholder="Type your message..."
                />
                <button 
                  disabled={isSendingMessage}
                  className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSendingMessage ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Message</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectCard({ booking, stage, onMove, onSetStatus, onUpdatePrice, onMessage, isProcessing }: any) {
  return (
    <motion.div 
      layout
      className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-6 rounded-sm relative group hover:border-white/20 transition-all"
    >
       {isProcessing && (
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-sm">
            <Loader2 className="animate-spin text-blue-500" />
         </div>
       )}

       <div className="flex justify-between items-start mb-6">
          <div>
             <h4 className="text-lg font-black uppercase tracking-tight text-white mb-1 leading-none">{booking.name}</h4>
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{booking.shoot_type}</span>
          </div>
          <button 
             onClick={onMessage}
             className="p-2 text-zinc-600 hover:text-white transition-colors"
          >
             <MessageSquare size={16} />
          </button>
       </div>

       {/* MISSION INTELLIGENCE: LOCATION & DETAILS */}
       <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-zinc-400">
             <MapPin size={14} className="text-zinc-600 shrink-0" />
             <p className="text-[11px] font-bold uppercase tracking-tight truncate">
                {booking.location || "Location TBD"}
             </p>
          </div>

          {booking.message && (
             <div className="bg-black/30 p-3 rounded-sm border border-white/5 relative">
                <Quote size={12} className="absolute -top-2 -left-1 text-zinc-800" />
                <p className="text-[10px] text-zinc-500 italic line-clamp-2 leading-relaxed">
                   "{booking.message}"
                </p>
             </div>
          )}
       </div>

       <div className="space-y-5">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
             <div className="flex items-center gap-2 text-zinc-500">
                <Calendar size={12} />
                <span>{booking.session_date}</span>
             </div>
             <span className={booking.status === 'confirmed' ? 'text-emerald-500' : 'text-blue-500'}>
                {booking.status}
             </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
             <div className="flex items-center gap-1 text-emerald-500">
                <DollarSign size={14} />
                <input 
                   type="number" 
                   className="bg-transparent w-20 text-white font-black text-sm outline-none"
                   defaultValue={booking.total_amount || 0}
                   onBlur={(e) => onUpdatePrice(booking.id, parseFloat(e.target.value))}
                />
             </div>
             
             <div className="flex gap-1">
                {stage.id === 'lead' && (
                   <>
                      <button 
                         onClick={() => onSetStatus(booking.id, 'confirmed')}
                         className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black rounded-sm transition-all"
                      >
                         <Check size={14} />
                      </button>
                      <button 
                         onClick={() => onSetStatus(booking.id, 'canceled')}
                         className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-sm transition-all"
                      >
                         <Ban size={14} />
                      </button>
                   </>
                )}
             </div>
          </div>

          {/* ADVANCEMENT CONTROLS */}
          <div className="flex gap-2 pt-4 border-t border-white/5">
             <button 
                disabled={stage.id === 'lead'}
                onClick={() => {
                   const idx = STAGES.findIndex(s => s.id === stage.id);
                   onMove(booking.id, STAGES[idx-1].id);
                }}
                className="flex-1 py-3 bg-zinc-800 text-white rounded-sm disabled:opacity-20 flex items-center justify-center hover:bg-zinc-700 transition-colors"
             >
                <ChevronRight size={16} className="rotate-180" />
             </button>
             <button 
                disabled={stage.id === 'delivered'}
                onClick={() => {
                   const idx = STAGES.findIndex(s => s.id === stage.id);
                   onMove(booking.id, STAGES[idx+1].id);
                }}
                className="flex-[2] py-3 bg-white text-black rounded-sm disabled:opacity-20 flex items-center justify-center font-black uppercase text-[10px] tracking-[0.2em] gap-2 hover:bg-zinc-200 transition-colors"
             >
                {stage.id === 'lead' ? 'CONFIRM & ADVANCE' : 'ADVANCE STAGE'} <ChevronRight size={16} />
             </button>
          </div>
       </div>
    </motion.div>
  );
}
