"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, Calendar, DollarSign, 
  ArrowRight, Mail, Phone, Trash2,
  RefreshCw, Check, Clock, Loader2, Plus,
  Inbox as InboxIcon, CheckCircle2, Camera, Scissors, ShieldCheck,
  Archive, Settings, LayoutGrid, X, AlertCircle, Quote, MapPin, 
  Image as ImageIcon, Link as LinkIcon, Lock, CheckCircle, Send,
  ChevronRight, Save, DollarSign as DollarSignIcon, Zap, Copy
} from "lucide-react";
import { 
  updateBookingPipeline, 
  deleteBooking, 
  updateBookingStatus, 
  acceptInquiryAsBooking,
  deliverGallery,
  updatePricingPackage,
  replyToInquiry,
  updateSiteIdentity
} from "@/app/actions/booking";
import { createContractFromBooking } from "@/app/actions/contracts";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getNextAction, getInquiryAction, type NextAction } from "@/utils/workflow";

const STAGE_ICONS: Record<string, any> = {
  lead: InboxIcon,
  confirmed: CheckCircle2,
  shooting: Camera,
  editing: Scissors,
  delivered: ShieldCheck,
};

export function PipelineClient({ 
  initialPipeline, 
  inquiries: initialInquiries, 
  archivedBookings,
  packages: initialPackages,
  siteSettings: initialSiteSettings,
  blockedDates: initialBlockedDates,
  albums,
  marketingVault
}: { 
  initialPipeline: any[], 
  inquiries: any[],
  archivedBookings: any[],
  packages: any[],
  siteSettings: any,
  blockedDates: any[],
  albums: any[],
  marketingVault: any[]
}) {
  const [activeView, setActiveView] = useState<"command_center" | "pipeline" | "inquiries" | "archive" | "marketing_vault" | "settings">("command_center");
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [packages, setPackages] = useState(initialPackages);
  const [siteSettings, setSiteSettings] = useState(initialSiteSettings);
  const [blockedDates, setBlockedDates] = useState(initialBlockedDates);
  const [vault, setVault] = useState(marketingVault);
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [creatingContractId, setCreatingContractId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  // --- ACTIONS ---
  const handleCreateContract = async (bookingId: string) => {
    setCreatingContractId(bookingId);
    const res = await createContractFromBooking(bookingId);
    if (res.success) {
      router.push('/dashboard/contracts');
    }
    setCreatingContractId(null);
  };

  const handleMove = async (id: string, currentStage: string, customUpdates?: any) => {
    const stages = initialPipeline.map(s => s.id);
    const currentIndex = stages.indexOf(currentStage);
    const nextStage = customUpdates ? currentStage : stages[currentIndex + 1];

    if (!nextStage) return;

    setUpdatingId(id);
    const updates = customUpdates || { pipeline_stage: nextStage };
    const result = await updateBookingPipeline(id, updates);
    
    if (result.success) {
      setPipeline(prev => prev.map(stage => {
        if (stage.id === currentStage && !customUpdates) {
          return { ...stage, items: stage.items.filter((i: any) => i.id !== id) };
        }
        if (stage.id === nextStage) {
          if (customUpdates) {
            return { ...stage, items: stage.items.map((i: any) => i.id === id ? { ...i, ...customUpdates } : i) };
          } else {
            const item = prev.find(s => s.id === currentStage)?.items.find((i: any) => i.id === id);
            return { ...stage, items: [item, ...stage.items] };
          }
        }
        return stage;
      }));
      router.refresh();
    }
    setUpdatingId(null);
  };

  const handleSetStatus = async (id: string, status: string) => {
    setIsProcessing(id);
    const result = await updateBookingStatus(id, status);
    if (result.success) {
      router.refresh();
      // If we're moving out of pipeline (cancelling), we'd usually refresh the whole state
      if (status === 'cancelled') {
        setActiveView('archive');
      }
    }
    setIsProcessing(null);
  };

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBlocking(true);
    const { error } = await supabase.from("blocked_dates").insert({ date: newBlockDate });
    if (!error) {
      setBlockedDates([...blockedDates, { id: Math.random().toString(), date: newBlockDate }]);
      setNewBlockDate("");
    }
    setIsBlocking(false);
  };

  const handleSavePackage = async (pkg: any) => {
    await updatePricingPackage(pkg.id, pkg);
    alert("Pricing Intelligence Updated.");
  };

  const handleSaveSettings = async () => {
    await updateSiteIdentity(siteSettings.id, siteSettings);
    alert("Operational Guardrails Updated.");
  };

  const handleReply = async (inquiryId: string) => {
    if (!replyMessage.trim()) return;
    setIsProcessing(inquiryId);
    const res = await replyToInquiry(inquiryId, replyMessage);
    if (res.success) {
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: 'replied' } : i));
      setReplyingTo(null);
      setReplyMessage("");
      alert("Intelligence Dispatched: Reply sent.");
    }
    setIsProcessing(null);
  };

  // --- RENDERING ---
  return (
    <div className="flex flex-col h-full space-y-12">
      {/* TACTICAL NAVIGATION */}
      <div className="flex flex-wrap gap-4 items-center">
         <button 
           onClick={() => setActiveView('command_center')}
           className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeView === 'command_center' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5'}`}
         >
           <ShieldCheck size={14} /> Today's Pulse
         </button>
         <button 
           onClick={() => setActiveView('pipeline')}
           className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeView === 'pipeline' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5'}`}
         >
           <LayoutGrid size={14} /> Strategic Pipeline
         </button>
         <button 
           onClick={() => setActiveView('inquiries')}
           className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 relative ${activeView === 'inquiries' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5'}`}
         >
           <InboxIcon size={14} /> Inquiry Inbox
           {inquiries.filter(i => i.status === 'new').length > 0 && (
             <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent text-[8px] flex items-center justify-center rounded-full text-white">{inquiries.filter(i => i.status === 'new').length}</span>
           )}
         </button>
         <button 
           onClick={() => setActiveView('marketing_vault')}
           className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeView === 'marketing_vault' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5'}`}
         >
           <Zap size={14} /> Content Vault
         </button>
         <button 
           onClick={() => setActiveView('archive')}
           className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeView === 'archive' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5'}`}
         >
           <Archive size={14} /> Project Archive
         </button>
         <button 
           onClick={() => setActiveView('settings')}
           className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeView === 'settings' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5'}`}
         >
           <Settings size={14} /> Ops Settings
         </button>
      </div>

      <AnimatePresence mode="wait">
        {activeView === "command_center" && (
          <motion.div key="command_center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
             <CommandCenter 
               pipeline={pipeline} 
               inquiries={inquiries} 
               siteSettings={siteSettings}
               onMove={handleMove}
               onAccept={async (id: string) => {
                 setIsProcessing(id);
                 const res = await acceptInquiryAsBooking(id);
                 if (res.success) {
                   setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'accepted' } : i));
                   router.refresh();
                 }
                 setIsProcessing(null);
               }}
             />
          </motion.div>
        )}

        {activeView === "pipeline" && (
          <motion.div 
            key="pipeline" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex-1 overflow-x-auto pb-6 -mx-8 px-8 flex gap-6 scrollbar-hide"
          >
            {pipeline.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col h-full">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stage.bg}`}>
                      {(() => {
                        const Icon = STAGE_ICONS[stage.id] || Clock;
                        return <Icon size={16} className={stage.color} />;
                      })()}
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white">{stage.label}</h3>
                    <span className="text-[10px] font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">
                      {stage.items.length}
                    </span>
                  </div>
                </div>

                {/* Items Container */}
                <div className="flex-1 bg-zinc-900/10 border border-white/5 rounded-sm p-4 space-y-4 overflow-y-auto min-h-[500px]">
                   <AnimatePresence mode="popLayout">
                      {stage.items.map((item: any) => (
                        <ProjectCard 
                          key={item.id}
                          item={item}
                          stage={stage}
                          onMove={handleMove}
                          onDelete={handleSetStatus}
                          onContract={handleCreateContract}
                          isProcessing={isProcessing === item.id || updatingId === item.id || creatingContractId === item.id}
                          albums={albums}
                        />
                      ))}
                   </AnimatePresence>

                   {stage.items.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center py-20 opacity-10 border border-dashed border-white/10 rounded-sm">
                        <Clock size={32} className="text-zinc-500 mb-4" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">No leads in queue</p>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeView === "inquiries" && (
          <motion.div key="inquiries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 max-w-5xl">
            <div className="grid grid-cols-1 gap-4">
              {inquiries.filter(i => i.status === 'new').length === 0 ? (
                <div className="text-center py-32 bg-zinc-900/10 border border-dashed border-white/5 rounded-sm">
                  <Mail className="mx-auto text-zinc-800 mb-4" size={40} />
                  <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Inbox is clear. Zero backlog.</p>
                </div>
              ) : (
                inquiries.filter(i => i.status === 'new').map((inquiry) => (
                  <div key={inquiry.id} className="premium-card p-10 border border-white/5 bg-zinc-900/20 rounded-sm flex flex-col md:flex-row justify-between gap-8 group hover:border-brand-accent/20 transition-all">
                    <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent text-[9px] font-black uppercase tracking-widest rounded-full border border-brand-accent/20">New Inquiry</span>
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{new Date(inquiry.created_at).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-2 leading-none">{inquiry.name}</h3>
                        <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest mb-6">{inquiry.email} • {inquiry.subject}</p>
                        <div className="bg-black/40 p-8 rounded-sm border border-white/5 relative">
                          <Quote size={20} className="absolute -top-4 -left-2 text-zinc-800" />
                          <p className="text-zinc-400 text-sm italic leading-relaxed">"{inquiry.message}"</p>
                        </div>
                      </div>

                      {replyingTo === inquiry.id && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/5">
                           <textarea 
                             autoFocus
                             placeholder="Write your response..."
                             className="w-full bg-black border border-brand-accent/30 rounded-sm p-6 text-zinc-300 text-sm outline-none focus:border-brand-accent min-h-[150px] font-medium leading-relaxed shadow-[0_0_30px_rgba(59,130,246,0.05)]"
                             value={replyMessage}
                             onChange={(e) => setReplyMessage(e.target.value)}
                           />
                           <div className="flex gap-3">
                              <button 
                                onClick={() => handleReply(inquiry.id)}
                                disabled={isProcessing === inquiry.id}
                                className="flex-1 py-4 bg-brand-accent text-white font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all rounded-sm flex items-center justify-center gap-3"
                              >
                                {isProcessing === inquiry.id ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} Dispatch Intelligence
                              </button>
                              <button 
                                onClick={() => setReplyingTo(null)}
                                className="px-10 py-4 bg-zinc-900 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all rounded-sm"
                              >
                                Cancel
                              </button>
                           </div>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex flex-row md:flex-col gap-3 justify-center min-w-[200px]">
                      <button 
                        onClick={() => {
                          setReplyingTo(inquiry.id);
                          setReplyMessage(`Hi ${inquiry.name},\n\nThanks for reaching out regarding ${inquiry.subject || 'your inquiry'}. `);
                        }}
                        className={`px-8 py-5 font-black uppercase text-[10px] tracking-widest transition-all rounded-sm flex items-center justify-center gap-3 ${replyingTo === inquiry.id ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-brand-accent text-white hover:bg-brand-accent/90'}`}
                      >
                        <Mail size={14} /> Reply
                      </button>
                      <button 
                        onClick={async () => {
                          const { error } = await supabase.from("inquiries").delete().eq("id", inquiry.id);
                          if (!error) {
                            setInquiries(prev => prev.filter(i => i.id !== inquiry.id));
                            router.refresh();
                          }
                        }}
                        className="px-8 py-5 bg-white/5 text-red-500/50 font-black uppercase text-[10px] tracking-widest border border-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all rounded-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeView === "marketing_vault" && (
          <MarketingVault initialVault={vault} supabase={supabase} />
        )}

        {activeView === "archive" && (
          <motion.div key="archive" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12 max-w-5xl">
            <div className="grid grid-cols-1 gap-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6">Strategic Archive</h3>
               {archivedBookings.length === 0 && (
                 <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-white/5 rounded-sm">
                   <Archive className="mx-auto text-zinc-800 mb-4" size={40} />
                   <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Archive is empty.</p>
                 </div>
               )}
               
               <div className="space-y-4">
                  {archivedBookings.map((booking) => (
                    <div key={booking.id} className="p-8 bg-zinc-950 border border-white/5 rounded-sm flex justify-between items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tight text-white mb-1">{booking.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{booking.shoot_type || booking.package_selected} • {booking.event_date}</p>
                      </div>
                      <button onClick={() => handleSetStatus(booking.id, 'confirmed')} className="px-8 py-3 border border-white/5 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Restore Project</button>
                    </div>
                  ))}

               </div>
            </div>
          </motion.div>
        )}

        {activeView === "settings" && (
          <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-16 max-w-5xl">
             {/* Guardrails */}
             <div className="premium-card p-12 border border-white/5 bg-zinc-900/20 rounded-sm">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center"><Clock size={28} /></div>
                   <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none mb-1">Booking Guardrails</h2>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Operational Scheduling Window</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12">
                   <div className="space-y-6">
                      <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Monthly Revenue Goal ($)</label>
                      <div className="flex items-center gap-8">
                         <input 
                           type="number" 
                           value={siteSettings.monthly_revenue_goal} 
                           onChange={(e) => setSiteSettings({ ...siteSettings, monthly_revenue_goal: parseFloat(e.target.value) })}
                           className="bg-zinc-950 border border-white/5 rounded-sm px-6 py-4 text-white text-2xl font-black focus:border-brand-accent outline-none w-full"
                         />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Min. Advance Notice (Days)</label>
                      <div className="flex items-center gap-8">
                         <input 
                           type="range" min="1" max="60" 
                           value={siteSettings.booking_min_advance_days} 
                           onChange={(e) => setSiteSettings({ ...siteSettings, booking_min_advance_days: parseInt(e.target.value) })}
                           className="flex-1 accent-brand-accent h-1 bg-zinc-800 rounded-full"
                         />
                         <span className="text-3xl font-black text-white w-16">{siteSettings.booking_min_advance_days}d</span>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Max. Booking Horizon (Days)</label>
                      <div className="flex items-center gap-8">
                         <input 
                           type="range" min="30" max="365" 
                           value={siteSettings.booking_max_advance_days} 
                           onChange={(e) => setSiteSettings({ ...siteSettings, booking_max_advance_days: parseInt(e.target.value) })}
                           className="flex-1 accent-brand-accent h-1 bg-zinc-800 rounded-full"
                         />
                         <span className="text-3xl font-black text-white w-16">{siteSettings.booking_max_advance_days}d</span>
                      </div>
                   </div>
                </div>

                <div className="flex justify-between items-center pt-10 border-t border-white/5">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${siteSettings.booking_is_active ? 'bg-brand-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-zinc-800'}`} onClick={() => setSiteSettings({ ...siteSettings, booking_is_active: !siteSettings.booking_is_active })}>
                         <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${siteSettings.booking_is_active ? 'left-6' : 'left-1'}`} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Accepting New Leads</span>
                   </div>
                   <button onClick={handleSaveSettings} className="px-12 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all rounded-sm flex items-center gap-3">
                     <Save size={14} /> Update Guardrails
                   </button>
                </div>
             </div>

             {/* Pricing Architecture */}
             <div className="space-y-8">
                <div className="flex items-end justify-between">
                   <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">Pricing Architecture</h2>
                   <div className="h-px flex-1 mx-8 bg-white/5 mb-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {packages.map((pkg) => (
                     <div key={pkg.id} className="premium-card p-10 border border-white/5 bg-zinc-900/20 rounded-sm group hover:border-brand-accent/20 transition-all">
                        <input className="bg-transparent text-xl font-black uppercase text-white mb-8 border-b border-white/5 outline-none w-full focus:border-brand-accent transition-colors" value={pkg.name} onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? { ...p, name: e.target.value } : p))} />
                        <div className="flex items-center gap-3 mb-8">
                           <DollarSignIcon size={20} className="text-brand-accent" />
                           <input className="bg-transparent text-3xl font-black text-white outline-none w-full" value={pkg.price} onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? { ...p, price: e.target.value } : p))} />
                        </div>
                        <button onClick={() => handleSavePackage(pkg)} className="w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all flex items-center justify-center gap-2">
                          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" /> Save tier
                        </button>
                     </div>
                   ))}
                </div>
             </div>

             {/* Calendar Blackout */}
             <div className="premium-card p-12 border border-white/5 bg-zinc-900/20 rounded-sm">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-10">Calendar Blackout</h2>
                <form onSubmit={handleBlockDate} className="flex gap-6 mb-12">
                   <input required type="date" value={newBlockDate} onChange={(e) => setNewBlockDate(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-sm px-8 py-4 text-white text-sm focus:border-brand-accent outline-none" />
                   <button disabled={isBlocking} className="px-12 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-sm hover:bg-zinc-200 transition-all disabled:opacity-50">Block Date</button>
                </form>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   {blockedDates.map((date) => (
                     <div key={date.id} className="flex justify-between items-center p-5 bg-black/40 rounded-sm border border-white/5 group hover:border-red-500/30 transition-all">
                        <span className="text-zinc-300 font-bold uppercase tracking-widest text-[10px]">{new Date(date.date).toLocaleDateString()}</span>
                        <button onClick={async () => { await supabase.from("blocked_dates").delete().eq("id", date.id); setBlockedDates(prev => prev.filter(d => d.id !== date.id)); }} className="text-zinc-800 group-hover:text-red-500 transition-colors"><X size={16} /></button>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function ProjectCard({ item, stage, onMove, onDelete, onContract, isProcessing, albums }: any) {
  const [showDetails, setShowDetails] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const linkedAlbum = albums.find((a: any) => a.id === item.linked_album_id);

  const handleGalleryDelivery = async () => {
    setIsDelivering(true);
    const result = await deliverGallery(item.id);
    if (result.success) alert("Gallery Dispatched.");
    setIsDelivering(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="premium-card bg-zinc-950 border border-white/5 p-6 rounded-sm group relative overflow-hidden hover:border-white/20 transition-all"
      >
         {isProcessing && (<div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-sm"><Loader2 className="animate-spin text-brand-accent" /></div>)}
         
         {/* Next Action Badge */}
         <div className="absolute top-0 right-0">
           {(() => {
             const next = getNextAction(item);
             const colors: any = { action: 'bg-brand-accent', waiting: 'bg-zinc-800', ready: 'bg-emerald-600' };
             return (
               <div className={`${colors[next.category]} text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-sm text-white shadow-lg`}>
                 {next.label}
               </div>
             );
           })()}
         </div>
         
         <div className={`absolute top-0 left-0 w-1 h-full ${stage.color.replace('text-', 'bg-')}`} />
         
         <div className="flex justify-between items-start mb-6">
            <div className="cursor-pointer" onClick={() => setShowDetails(true)}>
               <h4 className="text-white font-black uppercase tracking-tight text-sm mb-1 group-hover:text-brand-accent transition-colors leading-none">{item.name}</h4>
               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{item.shoot_type || item.package_selected}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
               <button onClick={() => onDelete(item.id, 'cancelled')} className="p-2 text-zinc-700 hover:text-red-500 transition-all"><X size={14} /></button>
               <button onClick={() => setShowDetails(true)} className="p-2 text-zinc-700 hover:text-white transition-all"><AlertCircle size={14} /></button>
            </div>
         </div>

         <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-zinc-400">
               <Calendar size={12} className="text-zinc-700" />
               <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(item.event_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-brand-accent">
               <DollarSign size={12} className="text-brand-accent/50" />
               <span className="text-[11px] font-black uppercase tracking-widest">${Number(item.total_amount).toLocaleString()}</span>
            </div>
         </div>

         <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex gap-2">
               {stage.id === 'lead' || stage.id === 'confirmed' ? (
                 <button onClick={() => onContract(item.id)} className="p-2 bg-brand-accent/10 border border-brand-accent/20 rounded-sm text-brand-accent hover:bg-brand-accent hover:text-white transition-all flex items-center gap-2 px-3">
                    <Plus size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Contract</span>
                 </button>
               ) : null}
               
               {stage.id === 'delivered' && (
                 <button 
                   disabled={isDelivering || !linkedAlbum}
                   onClick={handleGalleryDelivery} 
                   className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 px-3 disabled:opacity-30"
                 >
                    {isDelivering ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">Deliver</span>
                 </button>
               )}
            </div>
            
            {stage.id !== 'delivered' && (
              <button
                onClick={() => onMove(item.id, stage.id)}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white hover:text-brand-accent transition-all group/btn"
              >
                 Next <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}
         </div>
      </motion.div>

      {/* Detail Modal (Borrowed from Bookings) */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-zinc-900 border border-white/10 p-12 rounded-sm shadow-2xl relative">
              <button onClick={() => setShowDetails(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
              
              <div className="mb-12">
                <span className="text-brand-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Project Dossier</span>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-white leading-none mb-4">{item.name}</h2>
                <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest">{item.email} • {item.phone || 'No Phone'} {item.instagram_handle ? `• ${item.instagram_handle}` : ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-16 mb-12">
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Shoot Configuration</p>
                    <p className="text-lg font-bold text-white uppercase leading-none">{item.shoot_type || item.package_selected}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Target Location</p>
                    <p className="text-lg font-bold text-white uppercase leading-none">{item.location || 'Tactical TBD'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Lead Origin</p>
                    <p className="text-sm font-black text-brand-accent uppercase tracking-widest">{item.lead_source || 'Unknown'}</p>
                  </div>
                </div>

                <div className="space-y-8 bg-black/40 p-8 border border-white/5 rounded-sm">
                   <div>
                      <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-3">Financial Intelligence</p>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Quoted</span>
                           <input 
                             type="number" 
                             className="bg-transparent text-right font-black text-white text-xl outline-none border-b border-white/5 focus:border-brand-accent w-24"
                             value={Number(item.total_amount)}
                             onChange={async (e) => await onMove(item.id, stage.id, { total_amount: parseFloat(e.target.value) })}
                           />
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Deposit</span>
                           <div className="flex items-center gap-3">
                             <input 
                               type="number" 
                               className="bg-transparent text-right font-bold text-white text-sm outline-none border-b border-white/5 focus:border-brand-accent w-16"
                               value={Number(item.deposit_amount || 0)}
                               onChange={async (e) => await onMove(item.id, stage.id, { deposit_amount: parseFloat(e.target.value) })}
                             />
                             <button 
                               onClick={async () => await onMove(item.id, stage.id, { deposit_paid: !item.deposit_paid })}
                               className={`px-2 py-0.5 text-[7px] font-black uppercase rounded-full border ${item.deposit_paid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-800 border-white/5 text-zinc-600'}`}
                             >
                               {item.deposit_paid ? 'Paid' : 'Due'}
                             </button>
                           </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                           <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Final Due</span>
                           <div className="flex items-center gap-3">
                             <span className="text-xl font-black text-white tracking-tighter">${(Number(item.total_amount) - (item.deposit_paid ? Number(item.deposit_amount || 0) : 0)).toLocaleString()}</span>
                             <button 
                               onClick={async () => await onMove(item.id, stage.id, { final_paid: !item.final_paid })}
                               className={`px-2 py-0.5 text-[7px] font-black uppercase rounded-full border ${item.final_paid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-800 border-white/5 text-zinc-600'}`}
                             >
                               {item.final_paid ? 'Paid' : 'Due'}
                             </button>
                           </div>
                        </div>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Payment Method</p>
                        <input 
                          type="text"
                          placeholder="Venmo, Zelle, Cash..."
                          className="w-full bg-zinc-950 border border-white/5 px-4 py-2 text-[10px] font-bold text-white uppercase tracking-widest outline-none focus:border-brand-accent rounded-sm"
                          value={item.payment_method || ''}
                          onChange={async (e) => await onMove(item.id, stage.id, { payment_method: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Contract</p>
                          <button 
                            onClick={async () => await onMove(item.id, stage.id, { contract_status: item.contract_status === 'signed' ? 'unsigned' : 'signed' })}
                            className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${item.contract_status === 'signed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-zinc-800 border-white/5 text-zinc-600'}`}
                          >
                            {item.contract_status === 'signed' ? 'Signed' : 'Unsigned'}
                          </button>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Review</p>
                          <button 
                            onClick={async () => await onMove(item.id, stage.id, { review_requested: !item.review_requested })}
                            className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${item.review_requested ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-zinc-800 border-white/5 text-zinc-600'}`}
                          >
                            {item.review_requested ? 'Requested' : 'Send Req'}
                          </button>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {item.message && (
                <div className="mb-12 p-8 bg-zinc-950 border-l-4 border-brand-accent">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6 italic">Client Intent</p>
                  <p className="text-zinc-400 text-sm leading-relaxed italic font-medium">"{item.message}"</p>
                </div>
              )}

              {item.linked_album_id && (
                <div className="mb-12 p-8 bg-brand-accent/5 border border-brand-accent/20 rounded-sm">
                  <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-8">Client Engagement</p>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Portal Views</p>
                      <p className="text-2xl font-black text-white">{albums.find(a => a.id === item.linked_album_id)?.vault_views || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Downloads</p>
                      <p className="text-2xl font-black text-white">{albums.find(a => a.id === item.linked_album_id)?.download_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Last Viewed</p>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">
                        {albums.find(a => a.id === item.linked_album_id)?.last_viewed_at 
                          ? new Date(albums.find(a => a.id === item.linked_album_id).last_viewed_at).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-12">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Tactical Payment Notes</p>
                <textarea 
                  className="w-full bg-black/40 border border-white/5 p-6 rounded-sm text-zinc-400 text-sm outline-none focus:border-brand-accent min-h-[100px] font-medium"
                  placeholder="Internal notes on payment, discounts, or special arrangements..."
                  value={item.payment_notes || ''}
                  onChange={async (e) => await onMove(item.id, stage.id, { payment_notes: e.target.value })}
                />
              </div>

              <button onClick={() => setShowDetails(false)} className="w-full py-5 bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-zinc-200 transition-all rounded-sm">Close Intel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

interface CommandCenterProps {
  pipeline: any[];
  inquiries: any[];
  siteSettings: any;
  onMove: (id: string, stage: string, updates?: any) => Promise<void>;
  onAccept: (id: string) => Promise<void>;
}

function CommandCenter({ pipeline, inquiries, siteSettings, onMove, onAccept }: CommandCenterProps) {
  const allBookings = pipeline.flatMap((s: any) => s.items);
  const activeBookings = allBookings.filter((b: any) => b.status !== 'cancelled');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthlyBookings = activeBookings.filter((b: any) => {
    const d = new Date(b.event_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyRevenue = monthlyBookings.reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);
  const revenueGoal = siteSettings.monthly_revenue_goal || 2000;
  const avgBookingValue = activeBookings.length > 0 
    ? activeBookings.reduce((sum: number, b: any) => sum + Number(b.total_amount), 0) / activeBookings.length 
    : 0;

  const packageRevenue = activeBookings.reduce((acc: any, b: any) => {
    const pkg = b.shoot_type || b.package_selected || 'Custom';
    acc[pkg] = (acc[pkg] || 0) + Number(b.total_amount);
    return acc;
  }, {});

  const bestPackage = Object.entries(packageRevenue).sort((a: any, b: any) => b[1] - a[1])[0] || ['None', 0];

  const bookingsNeeded = Math.ceil(Math.max(0, revenueGoal - monthlyRevenue) / (avgBookingValue || 1));

  const pulse = {
    todayShoots: activeBookings.filter((b: any) => {
      const d = new Date(b.event_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }),
    weekShoots: activeBookings.filter((b: any) => {
      const d = new Date(b.event_date);
      d.setHours(0, 0, 0, 0);
      return d > today && d <= endOfWeek;
    }),
    pendingInquiries: inquiries.filter((i: any) => i.status === 'new'),
    editing: activeBookings.filter((b: any) => b.pipeline_stage === 'editing'),
    unpaid: activeBookings.filter((b: any) => !b.final_paid && b.pipeline_stage !== 'lead'),
    
    attention: [
      ...inquiries.filter((i: any) => i.status === 'new').map((i: any) => ({ ...i, type: 'inquiry', action: getInquiryAction(i) })),
      ...activeBookings.filter((b: any) => {
        const next = getNextAction(b);
        return next.category === 'action' && next.label !== 'Wait for Shoot Day';
      }).map((b: any) => ({ ...b, type: 'booking', action: getNextAction(b) }))
    ].sort((a, b) => (a.action.priority || 99) - (b.action.priority || 99))
  };

  const statCards = [
    { label: "Today's Shoots", count: pulse.todayShoots.length, icon: Camera, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { label: "This Week", count: pulse.weekShoots.length, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: "New Inquiries", count: pulse.pendingInquiries.length, icon: Mail, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: "In Editing", count: pulse.editing.length, icon: Scissors, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: "Payments Due", count: pulse.unpaid.length, icon: DollarSign, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-16">
      {/* Top Level Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="premium-card p-6 border border-white/5 bg-zinc-900/20 rounded-sm">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon size={18} className={card.color} />
            </div>
            <span className="block text-3xl font-black text-white mb-1 tracking-tighter">{card.count}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 leading-tight block">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Revenue Intelligence */}
      <div className="premium-card p-10 border border-white/5 bg-brand-accent/5 rounded-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5"><DollarSign size={120} /></div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div>
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent mb-4">Revenue Intelligence</h3>
               <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-white tracking-tighter">${monthlyRevenue.toLocaleString()}</span>
                  <span className="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">of ${revenueGoal.toLocaleString()} goal</span>
               </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 border-l border-white/10 pl-12">
               <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Bookings Needed</p>
                  <p className="text-xl font-black text-white">{bookingsNeeded} shots</p>
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Avg. Project</p>
                  <p className="text-xl font-black text-white">${Math.round(avgBookingValue).toLocaleString()}</p>
               </div>
               <div className="hidden md:block">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Best Tier</p>
                  <p className="text-xl font-black text-brand-accent truncate max-w-[120px]">{bestPackage[0]}</p>
               </div>
            </div>
         </div>
         {/* Progress Bar */}
         <div className="mt-10 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
               className="h-full bg-brand-accent shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" 
               style={{ width: `${Math.min(100, (monthlyRevenue / revenueGoal) * 100)}%` }} 
            />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ACTION CENTER */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Action Center</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Immediate Tasks</span>
           </div>
           
           <div className="space-y-4">
              {pulse.attention.length === 0 ? (
                <div className="py-20 text-center bg-zinc-900/10 border border-dashed border-white/5 rounded-sm">
                   <ShieldCheck className="mx-auto text-zinc-800 mb-2" size={32} />
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Tactical Advantage Secured</p>
                </div>
              ) : (
                pulse.attention.map((item: any) => (
                  <div key={item.id} className="p-8 bg-zinc-950 border border-white/5 rounded-sm flex items-center justify-between group hover:border-brand-accent/20 transition-all relative overflow-hidden">
                     {item.action.category === 'action' && <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent" />}
                     <div className="flex items-center gap-8">
                        <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-brand-accent group-hover:bg-brand-accent/10 transition-all">
                           {item.type === 'inquiry' ? <Mail size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                           <p className="text-white font-black uppercase tracking-tight text-lg leading-none mb-1">{item.name}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent">{item.action.label}</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => item.type === 'inquiry' ? onAccept(item.id) : onMove(item.id, item.pipeline_stage)}
                       className="px-6 py-4 bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2"
                     >
                        Execute <ArrowRight size={14} />
                     </button>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* SIDEBAR INTEL */}
        <div className="space-y-12">
           {/* TODAY'S SCHEDULE */}
           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5 pb-2">Today's Sessions</h3>
              <div className="space-y-3">
                 {pulse.todayShoots.length === 0 ? (
                   <p className="text-[10px] font-bold text-zinc-800 italic uppercase">Clear Skies</p>
                 ) : (
                   pulse.todayShoots.map((b: any) => (
                     <div key={b.id} className="p-4 bg-brand-accent/5 border border-brand-accent/10 rounded-sm">
                        <p className="text-white font-black uppercase tracking-tight text-sm leading-none mb-1">{b.name}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-accent">{b.event_time || 'Time TBD'} • {b.location || 'Location TBD'}</p>
                     </div>
                   ))
                 )}
              </div>
           </div>

           {/* THIS WEEK */}
           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5 pb-2">Upcoming This Week</h3>
              <div className="space-y-3">
                 {pulse.weekShoots.length === 0 ? (
                   <p className="text-[10px] font-bold text-zinc-800 italic uppercase">No upcoming sessions</p>
                 ) : (
                   pulse.weekShoots.map((b: any) => (
                     <div key={b.id} className="p-4 bg-zinc-900/40 border border-white/5 rounded-sm">
                        <p className="text-white font-black uppercase tracking-tight text-sm leading-none mb-1">{b.name}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{new Date(b.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                     </div>
                   ))
                 )}
              </div>
           </div>

           {/* ACCOUNTS RECEIVABLE */}
           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5 pb-2">Pending Balances</h3>
              <div className="space-y-3">
                 {pulse.unpaid.length === 0 ? (
                   <p className="text-[10px] font-bold text-zinc-800 italic uppercase">All accounts balanced</p>
                 ) : (
                   pulse.unpaid.slice(0, 3).map((b: any) => (
                     <div key={b.id} className="flex justify-between items-center px-2">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">{b.name}</span>
                        <span className="text-[11px] font-black text-red-500 tracking-tighter">${(Number(b.total_amount) - (b.deposit_paid ? Number(b.deposit_amount || 0) : 0)).toLocaleString()}</span>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MarketingVault({ initialVault, supabase }: { initialVault: any[], supabase: any }) {
  const [vault, setVault] = useState(initialVault);
  const [filter, setFilter] = useState('all');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ category: 'captions', title: '', content: '' });

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'captions', label: 'Caption Ideas' },
    { id: 'hashtags', label: 'Hashtag Sets' },
    { id: 'templates', label: 'Instagram Templates' },
    { id: 'promo', label: 'Promo Copy' },
    { id: 'pricing', label: 'Pricing Guide Copy' },
  ];

  const filtered = filter === 'all' ? vault : vault.filter(v => v.category === filter);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleAdd = async () => {
    const { data, error } = await supabase.from('marketing_vault').insert([newItem]).select();
    if (!error && data) {
      setVault([data[0], ...vault]);
      setIsAdding(false);
      setNewItem({ category: 'captions', title: '', content: '' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">Content Vault</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Marketing Assets & Strategic Copy</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all rounded-sm"
        >
          {isAdding ? 'Close Intelligence' : 'Add New Asset'}
        </button>
      </div>

      {isAdding && (
        <div className="p-10 bg-zinc-950 border border-brand-accent/20 rounded-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest">Category</label>
              <select 
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full bg-black/40 border border-white/5 p-4 rounded-sm text-white text-sm outline-none focus:border-brand-accent"
              >
                {categories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest">Asset Title</label>
              <input 
                type="text"
                placeholder="e.g. Senior Session Caption"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full bg-black/40 border border-white/5 p-4 rounded-sm text-white text-sm outline-none focus:border-brand-accent font-medium"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest">Asset Content</label>
            <textarea 
              placeholder="Paste copy, hashtags, or template details here..."
              value={newItem.content}
              onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
              className="w-full bg-black/40 border border-white/5 p-6 rounded-sm text-zinc-300 text-sm outline-none focus:border-brand-accent min-h-[200px] font-medium leading-relaxed"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="w-full py-4 bg-brand-accent text-white font-black uppercase text-[11px] tracking-widest hover:brightness-110 transition-all rounded-sm"
          >
            Store Asset
          </button>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === cat.id ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item) => (
          <div key={item.id} className="premium-card bg-zinc-900/20 border border-white/5 rounded-sm p-8 flex flex-col group hover:border-brand-accent/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-accent mb-1">{item.category}</p>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">{item.title}</h3>
              </div>
              <button 
                onClick={() => handleCopy(item.content, item.id)}
                className={`p-3 rounded-sm transition-all ${copyStatus === item.id ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10'}`}
              >
                {copyStatus === item.id ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex-1">
              <p className="text-zinc-400 text-sm font-medium leading-relaxed whitespace-pre-wrap line-clamp-6 group-hover:line-clamp-none transition-all cursor-text" onClick={() => handleCopy(item.content, item.id)}>
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
