"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, Calendar, DollarSign, 
  ArrowRight, Mail, Phone, Trash2,
  RefreshCw, Check, Clock, Loader2, Plus,
  Inbox as InboxIcon, CheckCircle2, Camera, Scissors, ShieldCheck,
  Archive, Settings, LayoutGrid, X, AlertCircle, Quote, MapPin, 
  Image as ImageIcon, Link as LinkIcon, Lock, CheckCircle, Send,
  ChevronRight, Save, DollarSign as DollarSignIcon, Zap, Copy, Lightbulb, Megaphone,
  User, Activity, GitPullRequest
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
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}
import { getNextAction, getInquiryAction, type NextAction } from "@/utils/workflow";

const STAGE_ICONS: Record<string, any> = {
  lead: InboxIcon,
  confirmed: CheckCircle2,
  shooting: Camera,
  editing: Scissors,
  delivered: ShieldCheck,
};

const getTurnaroundStatus = (shootDate: string, promisedDate: string | null, stage: string) => {
  if (stage === 'delivered') return { label: 'Delivered', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  if (!promisedDate) return { label: 'On Track', color: 'text-zinc-500', bg: 'bg-zinc-500/10' };

  const promised = new Date(promisedDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = promised.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', color: 'text-red-500', bg: 'bg-red-500/10', days: Math.abs(diffDays) };
  if (diffDays <= 3) return { label: 'Due Soon', color: 'text-amber-500', bg: 'bg-amber-500/10', days: diffDays };
  return { label: 'On Track', color: 'text-brand-accent', bg: 'bg-brand-accent/10', days: diffDays };
};

export function PipelineClient({ 
  initialPipeline, 
  inquiries: initialInquiries, 
  archivedBookings,
  packages: initialPackages,
  siteSettings: initialSiteSettings,
  blockedDates: initialBlockedDates,
  albums,
  marketingVault,
  inspirationBoard,
  campaigns: initialCampaigns
}: { 
  initialPipeline: any[], 
  inquiries: any[],
  archivedBookings: any[],
  packages: any[],
  siteSettings: any,
  blockedDates: any[],
  albums: any[],
  marketingVault: any[],
  inspirationBoard: any[],
  campaigns: any[]
}) {
  const [activeView, setActiveView] = useState<"command_center" | "pipeline" | "inquiries" | "archive" | "marketing_vault" | "inspiration_board" | "campaigns" | "settings">("command_center");
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [packages, setPackages] = useState(initialPackages);
  const [siteSettings, setSiteSettings] = useState(initialSiteSettings);
  const [blockedDates, setBlockedDates] = useState(initialBlockedDates);
  const [vault, setVault] = useState(marketingVault);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  
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
    alert("Pricing Packages Updated.");
  };

  const handleSaveSettings = async () => {
    await updateSiteIdentity(siteSettings.id, siteSettings);
    alert("Booking Settings Updated.");
  };

  const handleReply = async (inquiryId: string) => {
    if (!replyMessage.trim()) return;
    setIsProcessing(inquiryId);
    const res = await replyToInquiry(inquiryId, replyMessage);
    if (res.success) {
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: 'replied' } : i));
      setReplyingTo(null);
      setReplyMessage("");
      alert("Reply sent successfully.");
    }
    setIsProcessing(null);
  };

  // --- RENDERING ---
  return (
    <div className="flex flex-col h-full space-y-12">
      {/* TACTICAL NAVIGATION */}
      <div className="flex flex-wrap gap-2 items-center bg-card p-1.5 rounded-full border border-white/5 shadow-premium w-fit mb-16">
         {[
           { id: 'command_center', label: "Pulse", icon: ShieldCheck },
           { id: 'pipeline', label: "Pipeline", icon: LayoutGrid },
           { id: 'inquiries', label: "Inquiries", icon: InboxIcon, count: inquiries.filter(i => i.status === 'new').length },
           { id: 'marketing_vault', label: "Vault", icon: Zap },
           { id: 'inspiration_board', label: "Inspiration", icon: Lightbulb },
           { id: 'campaigns', label: "Campaigns", icon: Megaphone },
           { id: 'archive', label: "Archive", icon: Archive },
           { id: 'settings', label: "Ops", icon: Settings },
         ].map((item) => {
           const isActive = activeView === item.id;
           return (
             <button 
               key={item.id}
               onClick={() => setActiveView(item.id as any)}
               className={cn(
                 "relative px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2.5",
                 isActive ? "bg-dark-panel text-white shadow-xl shadow-black/10" : "bg-transparent text-zinc-400 hover:text-foreground"
               )}
             >
               <item.icon size={13} className={isActive ? "text-brand-accent" : "text-zinc-400"} />
               {item.label}
               {item.count ? (
                 <span className="w-5 h-5 bg-brand-accent text-[9px] flex items-center justify-center rounded-full text-black font-black border-2 border-dark-panel">
                    {item.count}
                 </span>
               ) : null}
             </button>
           );
         })}
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
            className="flex-1 overflow-x-auto pb-12 -mx-8 px-8 flex gap-8 scrollbar-hide"
          >
            {pipeline.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col h-full">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-8 px-6 bg-card border border-white/5 py-4 rounded-full shadow-premium">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-full ${stage.bg.replace('/10', '/20')}`}>
                      {(() => {
                        const Icon = STAGE_ICONS[stage.id] || Clock;
                        return <Icon size={14} className={stage.color} />;
                      })()}
                    </div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">{stage.label}</h3>
                    <div className="h-4 w-px bg-border mx-1" />
                    <span className="text-[9px] font-black text-zinc-400">
                      {stage.items.length}
                    </span>
                  </div>
                </div>

                {/* Items Container */}
                <div className="flex-1 bg-secondary border border-white/5 rounded-[2rem] p-5 space-y-5 overflow-y-auto min-h-[600px] shadow-sm">
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
                     <div className="h-full flex flex-col items-center justify-center py-24 opacity-50 border-2 border-dashed border-border rounded-[1.5rem]">
                        <Clock size={32} className="text-zinc-200 mb-4" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">No leads in queue</p>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeView === "inquiries" && (
          <motion.div key="inquiries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 max-w-5xl">
            <div className="grid grid-cols-1 gap-6">
              {inquiries.filter(i => i.status === 'new').length === 0 ? (
                <div className="text-center py-40 bg-secondary border border-dashed border-white/5 rounded-[2.5rem]">
                   <Mail className="mx-auto text-zinc-800 mb-6" size={48} />
                   <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Inbox is clear. Zero backlog.</p>
                </div>
              ) : (
                inquiries.filter(i => i.status === 'new').map((inquiry) => (
                  <div key={inquiry.id} className="bg-card border border-white/5 p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between gap-10 group hover:border-brand-accent transition-all shadow-sm">
                    <div className="space-y-8 flex-1">
                      <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-brand-accent/10 text-brand-accent text-[9px] font-black uppercase tracking-widest rounded-full border border-brand-accent/20 shadow-sm">New Inquiry</span>
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{new Date(inquiry.created_at).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-2 leading-none">{inquiry.name}</h3>
                        <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest mb-8">{inquiry.email} • {inquiry.subject}</p>
                        <div className="bg-secondary p-8 rounded-[1.5rem] border border-white/5 relative shadow-sm">
                          <Quote size={24} className="absolute -top-4 -left-2 text-zinc-800" />
                          <p className="text-zinc-400 text-sm italic leading-relaxed font-medium">"{inquiry.message}"</p>
                        </div>
                      </div>

                      {replyingTo === inquiry.id && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-8 border-t border-white/5">
                           <textarea 
                             autoFocus
                             placeholder="Write your response..."
                             className="w-full bg-secondary border border-white/5 rounded-[1.5rem] p-8 text-white text-sm outline-none focus:border-brand-accent min-h-[200px] font-medium leading-relaxed shadow-inner"
                             value={replyMessage}
                             onChange={(e) => setReplyMessage(e.target.value)}
                           />
                           <div className="flex gap-4">
                              <button 
                                onClick={() => handleReply(inquiry.id)}
                                disabled={isProcessing === inquiry.id}
                                className="w-full py-5 bg-brand-accent text-black font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50 rounded-full shadow-brand-glow"
                              >
                                {isProcessing === inquiry.id ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} Send Reply
                              </button>
                              <button 
                                onClick={() => setReplyingTo(null)}
                                className="px-12 py-5 bg-secondary text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all rounded-full border border-white/5 shadow-sm"
                              >
                                Cancel
                              </button>
                           </div>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex flex-row md:flex-col gap-4 justify-center min-w-[220px]">
                      <button 
                        onClick={() => {
                          setReplyingTo(inquiry.id);
                          setReplyMessage(`Hi ${inquiry.name},\n\nThanks for reaching out regarding ${inquiry.subject || 'your inquiry'}. `);
                        }}
                        className={`px-8 py-5 font-black uppercase text-[10px] tracking-widest transition-all rounded-full flex items-center justify-center gap-3 shadow-sm ${replyingTo === inquiry.id ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' : 'bg-brand-accent text-black hover:bg-brand-accent/90'}`}
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
                        className="px-8 py-5 bg-secondary text-zinc-500 hover:text-red-500 font-black uppercase text-[10px] tracking-widest border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 transition-all rounded-full shadow-sm"
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

        {activeView === "inspiration_board" && (
          <InspirationBoard initialBoard={inspirationBoard} supabase={supabase} />
        )}

        {activeView === "campaigns" && (
          <CampaignManager 
            initialCampaigns={campaigns} 
            supabase={supabase} 
            siteSettings={siteSettings}
            onUpdateSettings={(updates: any) => setSiteSettings({ ...siteSettings, ...updates })}
          />
        )}

        {activeView === "archive" && (
          <motion.div key="archive" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12 max-w-5xl">
            <div className="grid grid-cols-1 gap-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6">Strategic Archive</h3>
               {archivedBookings.length === 0 && (
                 <div className="text-center py-20 bg-secondary border border-dashed border-white/5 rounded-sm">
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
             <div className="bg-card border border-white/5 p-12 rounded-[2.5rem] shadow-premium">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center border border-brand-accent/20"><Clock size={28} /></div>
                   <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-none mb-1">Booking Guardrails</h2>
                      <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">Operational Scheduling Window</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12">
                   <div className="space-y-6">
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Monthly Revenue Goal ($)</label>
                      <div className="flex items-center gap-8">
                         <input 
                           type="number" 
                           value={siteSettings.monthly_revenue_goal} 
                           onChange={(e) => setSiteSettings({ ...siteSettings, monthly_revenue_goal: parseFloat(e.target.value) })}
                           className="bg-secondary border border-white/5 rounded-full px-8 py-5 text-white text-2xl font-black focus:border-brand-accent outline-none w-full shadow-inner"
                         />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Min. Advance Notice (Days)</label>
                      <div className="flex items-center gap-8">
                         <input 
                           type="range" min="1" max="60" 
                           value={siteSettings.booking_min_advance_days} 
                           onChange={(e) => setSiteSettings({ ...siteSettings, booking_min_advance_days: parseInt(e.target.value) })}
                           className="flex-1 accent-brand-accent h-1.5 bg-zinc-100 rounded-full cursor-pointer"
                         />
                         <span className="text-3xl font-black text-foreground w-16 text-right">{siteSettings.booking_min_advance_days}d</span>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Max. Booking Horizon (Days)</label>
                      <div className="flex items-center gap-8">
                         <input 
                           type="range" min="30" max="365" 
                           value={siteSettings.booking_max_advance_days} 
                           onChange={(e) => setSiteSettings({ ...siteSettings, booking_max_advance_days: parseInt(e.target.value) })}
                           className="flex-1 accent-brand-accent h-1.5 bg-zinc-100 rounded-full cursor-pointer"
                         />
                         <span className="text-3xl font-black text-foreground w-16 text-right">{siteSettings.booking_max_advance_days}d</span>
                      </div>
                   </div>
                </div>

                <div className="flex justify-between items-center pt-10 border-t border-white/5">
                   <div className="flex items-center gap-4">
                      <div 
                        className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer shadow-sm ${siteSettings.booking_is_active ? 'bg-brand-accent' : 'bg-background'}`} 
                        onClick={() => setSiteSettings({ ...siteSettings, booking_is_active: !siteSettings.booking_is_active })}
                      >
                         <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${siteSettings.booking_is_active ? 'left-6' : 'left-1'}`} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Accepting New Leads</span>
                   </div>
                   <button onClick={handleSaveSettings} className="px-12 py-5 bg-brand-accent text-black font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all rounded-full flex items-center gap-3 shadow-brand-glow">
                     <Save size={14} /> Update Guardrails
                   </button>
                </div>
             </div>

             {/* Pricing Architecture */}
             <div className="space-y-10">
                <div className="flex items-end justify-between">
                   <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground leading-none">Pricing Architecture</h2>
                   <div className="h-px flex-1 mx-8 bg-border mb-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {packages.map((pkg) => (
                     <div key={pkg.id} className="bg-card border border-white/5 p-10 rounded-[2.5rem] group hover:border-brand-accent transition-all shadow-sm flex flex-col">
                        <input 
                          className="bg-transparent text-xl font-black uppercase text-foreground mb-8 border-b border-white/5 outline-none w-full focus:border-brand-accent transition-colors" 
                          value={pkg.name} 
                          onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? { ...p, name: e.target.value } : p))} 
                        />
                        <div className="flex items-center gap-3 mb-10 bg-secondary p-6 rounded-[1.5rem] border border-white/5">
                           <DollarSign size={20} className="text-brand-accent" />
                           <input 
                             className="bg-transparent text-3xl font-black text-white outline-none w-full" 
                             value={pkg.price} 
                             onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? { ...p, price: e.target.value } : p))} 
                           />
                        </div>
                        <div className="space-y-4 mb-10">
                           <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">Preparation Guide</label>
                           <input 
                             className="w-full bg-secondary border border-white/5 px-6 py-4 rounded-full text-white text-[10px] font-bold uppercase tracking-widest outline-none focus:border-brand-accent shadow-sm" 
                             placeholder="Link to PDF or Web Guide..."
                             value={pkg.prep_guide || ''} 
                             onChange={(e) => setPackages(packages.map(p => p.id === pkg.id ? { ...p, prep_guide: e.target.value } : p))} 
                           />
                        </div>
                        <div className="flex items-center gap-3 mb-10 px-2">
                           <div 
                             onClick={() => setPackages(packages.map(p => p.id === pkg.id ? { ...p, requires_inspiration: !p.requires_inspiration } : p))}
                             className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer shadow-sm ${pkg.requires_inspiration ? 'bg-brand-accent' : 'bg-zinc-200'}`}
                           >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${pkg.requires_inspiration ? 'left-5' : 'left-1'}`} />
                           </div>
                           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Requires Inspiration Board</span>
                        </div>
                        <button onClick={() => handleSavePackage(pkg)} className="w-full py-5 bg-secondary border border-white/5 text-white font-black uppercase text-[10px] tracking-widest hover:bg-brand-accent hover:text-black transition-all rounded-full flex items-center justify-center gap-3 shadow-sm mt-auto">
                          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" /> Save tier
                        </button>
                     </div>
                   ))}
                </div>
             </div>

             {/* Calendar Blackout */}
             <div className="bg-card border border-white/5 p-12 rounded-[2.5rem] shadow-premium">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-10">Calendar Blackout</h2>
                <form onSubmit={handleBlockDate} className="flex gap-6 mb-12">
                   <input 
                     required type="date" 
                     value={newBlockDate} 
                     onChange={(e) => setNewBlockDate(e.target.value)} 
                     className="flex-1 bg-secondary border border-white/5 rounded-full px-10 py-5 text-white text-sm focus:border-brand-accent outline-none shadow-inner font-bold" 
                   />
                   <button 
                     disabled={isBlocking} 
                     className="px-12 bg-brand-accent text-black font-black uppercase tracking-widest text-[10px] rounded-full hover:brightness-110 transition-all disabled:opacity-50 shadow-brand-glow"
                   >
                     {isBlocking ? <Loader2 className="animate-spin" size={14} /> : 'Block Date'}
                   </button>
                </form>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                   {blockedDates.map((date) => (
                     <div key={date.id} className="flex justify-between items-center p-5 bg-secondary rounded-full border border-white/5 group hover:border-red-500/30 transition-all shadow-sm">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest text-[9px] pl-2">{new Date(date.date).toLocaleDateString()}</span>
                        <button onClick={async () => { await supabase.from("blocked_dates").delete().eq("id", date.id); setBlockedDates(prev => prev.filter(d => d.id !== date.id)); }} className="text-zinc-500 group-hover:text-red-500 transition-colors p-2 bg-card rounded-full border border-white/5"><X size={14} /></button>
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
        className="bg-card border border-white/5 p-6 rounded-[1.5rem] group relative overflow-hidden hover:border-brand-accent transition-all shadow-premium hover:shadow-2xl hover:shadow-brand-glow/10"
      >
         {isProcessing && (<div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-[1.5rem]"><Loader2 className="animate-spin text-brand-accent" /></div>)}
         
         {/* Next Action Badge */}
         <div className="absolute top-0 right-0">
           {(() => {
             const next = getNextAction(item);
             const colors: any = { action: 'bg-brand-accent text-black', waiting: 'bg-secondary text-zinc-500', ready: 'bg-emerald-500 text-white' };
             return (
               <div className={`${colors[next.category]} text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-[1.5rem] shadow-sm`}>
                 {next.label}
               </div>
             );
           })()}
         </div>
         
         <div className={`absolute top-0 left-0 w-1 h-full ${stage.color.replace('text-', 'bg-')}`} />
         
         <div className="flex justify-between items-start mb-6">
            <div className="cursor-pointer" onClick={() => setShowDetails(true)}>
               <h4 className="text-foreground font-black uppercase tracking-tight text-sm mb-1 group-hover:text-brand-accent transition-colors leading-none">{item.name}</h4>
               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{item.shoot_type || item.package_selected}</p>
               {item.tags && item.tags.length > 0 && (
                 <div className="flex flex-wrap gap-1">
                   {item.tags.map((tag: string) => (
                     <span key={tag} className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 bg-secondary border border-white/5 text-zinc-500 rounded-full">
                       {tag}
                     </span>
                   ))}
                 </div>
               )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
               <button onClick={() => onDelete(item.id, 'cancelled')} className="p-2 text-zinc-300 hover:text-red-500 transition-all"><X size={14} /></button>
               <button onClick={() => setShowDetails(true)} className="p-2 text-zinc-300 hover:text-foreground transition-all"><AlertCircle size={14} /></button>
            </div>
         </div>

         <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3 text-zinc-400">
                  <Calendar size={12} className="text-zinc-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(item.event_date).toLocaleDateString()}</span>
               </div>
               {(() => {
                 const turnaround = getTurnaroundStatus(item.event_date, item.promised_delivery_date, stage.id);
                 return (
                   <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${turnaround.bg.replace('/10', '/20')} ${turnaround.color}`}>
                     {turnaround.label} {turnaround.days !== undefined && `(${turnaround.days}d)`}
                   </span>
                 );
               })()}
            </div>
            <div className="flex items-center gap-3 text-foreground">
               <DollarSign size={12} className="text-zinc-300" />
               <span className="text-[11px] font-black uppercase tracking-widest">${Number(item.total_amount).toLocaleString()}</span>
            </div>
         </div>

         <div className="flex items-center justify-between pt-6 border-t border-border">
            <div className="flex gap-2">
               {stage.id === 'lead' || stage.id === 'confirmed' ? (
                 <button onClick={() => onContract(item.id)} className="p-2 bg-secondary border border-white/5 rounded-full text-white hover:bg-brand-accent hover:text-black transition-all flex items-center gap-2 px-4 shadow-sm">
                    <Plus size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Contract</span>
                 </button>
               ) : null}
               
               {stage.id === 'delivered' && (
                 <button 
                   disabled={isDelivering || !linkedAlbum}
                   onClick={handleGalleryDelivery} 
                   className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 px-4 shadow-sm disabled:opacity-30"
                 >
                    {isDelivering ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">Deliver</span>
                 </button>
               )}
            </div>
            
            {stage.id !== 'delivered' && (
              <button
                onClick={() => onMove(item.id, stage.id)}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-foreground transition-all group/btn"
              >
                 Next <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}
         </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-2xl bg-card border border-white/5 p-12 rounded-[2.5rem] shadow-2xl"
            >
              <button onClick={() => setShowDetails(false)} className="absolute top-10 right-10 text-zinc-500 hover:text-white transition-colors p-2 bg-secondary rounded-full border border-white/5"><X size={20} /></button>
              
              <div className="mb-12">
                <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Project Dossier</span>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-foreground leading-none mb-4">{item.name}</h2>
                <p className="text-zinc-400 text-[11px] font-black uppercase tracking-widest">{item.email} • {item.phone || 'No Phone'} {item.instagram_handle ? `• ${item.instagram_handle}` : ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-16 mb-12">
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Shoot Configuration</p>
                    <p className="text-lg font-bold text-foreground uppercase leading-none">{item.shoot_type || item.package_selected}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Target Location</p>
                    <p className="text-lg font-bold text-foreground uppercase leading-none">{item.location || 'Tactical TBD'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Client Intelligence Tags</p>
                    <div className="flex flex-wrap gap-2">
                       {[
                         'Senior', 'Athlete', 'Parent', 'Team', 'Coach', 
                         'Greek Life', 'Event', 'High School', 'College', 
                         'Referral Source', 'High Value'
                       ].map(tag => {
                         const isActive = item.tags?.includes(tag);
                         return (
                           <button 
                             key={tag}
                             onClick={async () => {
                               const newTags = isActive 
                                 ? item.tags.filter((t: string) => t !== tag)
                                 : [...(item.tags || []), tag];
                               await onMove(item.id, stage.id, { tags: newTags });
                             }}
                             className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-full border transition-all ${isActive ? 'bg-brand-accent border-brand-accent text-black shadow-sm' : 'bg-secondary border-white/5 text-zinc-500 hover:text-white'}`}
                           >
                             {tag}
                           </button>
                         );
                       })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Lead Origin</p>
                    <p className="text-sm font-black text-brand-accent uppercase tracking-widest">{item.lead_source || 'Unknown'}</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 italic">Turnaround Logistics</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Promised Delivery</label>
                        <input 
                          type="date"
                          className="w-full bg-zinc-50 border border-border px-4 py-3 text-foreground text-[10px] font-bold outline-none focus:border-brand-accent rounded-full shadow-sm"
                          value={item.promised_delivery_date || ''}
                          onChange={async (e) => await onMove(item.id, stage.id, { promised_delivery_date: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 bg-zinc-50 p-8 border border-border rounded-[2rem] shadow-sm">
                   <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Financial Intelligence</p>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quoted</span>
                           <input 
                             type="number" 
                             className="bg-transparent text-right font-black text-foreground text-xl outline-none border-b border-border focus:border-brand-accent w-24"
                             value={Number(item.total_amount)}
                             onChange={async (e) => await onMove(item.id, stage.id, { total_amount: parseFloat(e.target.value) })}
                           />
                        </div>
                        <div className="hidden">
                           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deposit</span>
                           <div className="flex items-center gap-3">
                             <input 
                               type="number" 
                               className="bg-transparent text-right font-bold text-foreground text-sm outline-none border-b border-border focus:border-brand-accent w-16"
                               value={Number(item.deposit_amount || 0)}
                               onChange={async (e) => await onMove(item.id, stage.id, { deposit_amount: parseFloat(e.target.value) })}
                             />
                             <button 
                               onClick={async () => await onMove(item.id, stage.id, { deposit_paid: !item.deposit_paid })}
                               className={`px-3 py-1 text-[7px] font-black uppercase rounded-full border shadow-sm ${item.deposit_paid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-secondary border-white/5 text-zinc-500'}`}
                             >
                               {item.deposit_paid ? 'Paid' : 'Due'}
                             </button>
                           </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-border">
                           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Status</span>
                           <div className="flex items-center gap-3">
                             <span className="text-xl font-black text-white tracking-tighter">${Number(item.total_amount).toLocaleString()}</span>
                             <button 
                               onClick={async () => await onMove(item.id, stage.id, { final_paid: !item.final_paid })}
                               className={`px-3 py-1 text-[7px] font-black uppercase rounded-full border shadow-sm ${item.final_paid ? 'bg-brand-accent border-brand-accent text-black' : 'bg-secondary border-white/5 text-zinc-500'}`}
                             >
                               {item.final_paid ? 'Paid' : 'Unpaid'}
                             </button>
                           </div>
                        </div>
                      </div>
                   </div>
                   
                   <div className="space-y-6 pt-4 border-t border-border">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Payment Method</p>
                        <input 
                          type="text"
                          placeholder="Venmo, Zelle, Cash..."
                          className="w-full bg-secondary border border-white/5 px-4 py-2.5 text-[10px] font-bold text-white uppercase tracking-widest outline-none focus:border-brand-accent rounded-full shadow-sm"
                          value={item.payment_method || ''}
                          onChange={async (e) => await onMove(item.id, stage.id, { payment_method: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Contract</p>
                          <button 
                            onClick={async () => await onMove(item.id, stage.id, { contract_status: item.contract_status === 'signed' ? 'unsigned' : 'signed' })}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm transition-all ${item.contract_status === 'signed' ? 'bg-brand-accent border-brand-accent text-black' : 'bg-secondary border-white/5 text-zinc-500'}`}
                          >
                            {item.contract_status === 'signed' ? 'Signed' : 'Unsigned'}
                          </button>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Review</p>
                          <button 
                            onClick={async () => await onMove(item.id, stage.id, { review_requested: !item.review_requested })}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm transition-all ${item.review_requested ? 'bg-brand-accent border-brand-accent text-black' : 'bg-secondary border-white/5 text-zinc-500'}`}
                          >
                            {item.review_requested ? 'Requested' : 'Send Req'}
                          </button>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Client Album Link & Delivery Portal */}
              <div className="mb-12 p-8 bg-zinc-50 border border-border rounded-[2rem] shadow-sm space-y-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
                    <div>
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Gallery Delivery Portal</p>
                       <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">Client Gallery Album</h3>
                    </div>
                    <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent text-[9px] font-black uppercase rounded-full tracking-widest">
                       Tactical Assets
                    </span>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block">Linked Gallery Album</label>
                       <select 
                          value={item.linked_album_id || ""}
                          onChange={async (e) => {
                             const val = e.target.value === "" ? null : e.target.value;
                             await onMove(item.id, stage.id, { linked_album_id: val });
                          }}
                          className="w-full bg-zinc-100 border border-border px-5 py-3 text-foreground text-xs font-bold uppercase tracking-widest rounded-full outline-none focus:border-brand-accent transition-all"
                       >
                          <option value="">-- Link Gallery Album --</option>
                          {albums?.map((a: any) => (
                             <option key={a.id} value={a.id}>{a.title} ({a.is_public ? 'Public' : 'Private'})</option>
                          ))}
                       </select>
                    </div>

                    <div className="flex flex-col justify-end">
                       {item.linked_album_id ? (() => {
                          const album = albums?.find((a: any) => a.id === item.linked_album_id);
                          if (!album) return null;
                          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rcv.media';
                          const galleryUrl = album.is_public ? `${origin}/albums/${album.slug}` : `${origin}/gallery/${album.slug}`;
                          
                          const emailSubject = `Your RCV.Media Photos are Ready!`;
                          const emailBody = `Hey ${item.name},\n\nYour photos are ready and have been uploaded to your client gallery!\n\nYou can access your gallery here:\n${galleryUrl}\n\n${!album.is_public && album.passcode ? `Your private passcode is: ${album.passcode}\n\n` : ''}Let me know what you think!\n\nBest,\nReese Vierling\nRCV.Media`;
                          const mailtoUrl = `mailto:${item.email || ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

                          return (
                             <div className="flex items-center gap-4 w-full">
                                <a 
                                   href={mailtoUrl}
                                   className="flex-1 py-3 bg-brand-accent hover:brightness-110 text-black font-black uppercase tracking-widest text-[9px] rounded-full shadow-sm hover:scale-105 transition-all text-center flex items-center justify-center gap-2"
                                >
                                   <Mail size={12} />
                                   Send Email
                                </a>
                                <button 
                                   onClick={() => {
                                      navigator.clipboard.writeText(galleryUrl);
                                      alert("Gallery link copied to clipboard!");
                                   }}
                                   className="px-5 py-3 bg-zinc-200 hover:bg-zinc-300 text-foreground font-black uppercase tracking-widest text-[9px] rounded-full transition-all flex items-center justify-center gap-2"
                                   title="Copy Link"
                                >
                                   <Copy size={12} className="text-brand-accent" />
                                   Copy Link
                                </button>
                             </div>
                          );
                       })() : (
                          <div className="h-full flex items-center text-zinc-400 text-[9px] font-black uppercase tracking-widest italic pt-2">
                             Choose an album to unlock delivery capabilities.
                          </div>
                       )}
                    </div>
                 </div>
              </div>

              {item.message && (
                <div className="mb-12 p-8 bg-secondary border-l-4 border-brand-accent rounded-r-[1.5rem] shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 italic">Client Intent</p>
                  <p className="text-zinc-600 text-sm leading-relaxed italic font-medium">"{item.message}"</p>
                </div>
              )}

              <button onClick={() => setShowDetails(false)} className="w-full py-5 bg-brand-accent text-black font-black uppercase text-[11px] tracking-widest hover:brightness-110 transition-all rounded-full shadow-brand-glow">Close Intel</button>
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
  const router = useRouter();
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
    { label: "In Editing", count: pulse.editing.length, icon: Scissors, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { label: "Payments Due", count: pulse.unpaid.length, icon: DollarSign, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];
  return (
    <div className="space-y-16">
      {/* Concept Stat Badges */}
      <div className="flex flex-wrap gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-white/5 px-6 py-4 rounded-full shadow-premium flex items-center gap-4 hover:border-brand-accent transition-all group cursor-pointer">
            <div className={`w-10 h-10 rounded-full ${card.bg.replace('/10', '/20')} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
              <card.icon size={16} className={card.color} />
            </div>
            <div>
               <span className="block text-xl font-black text-white tracking-tighter leading-none">{card.count}</span>
               <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 leading-tight block">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Revenue Card (Main Focus) */}
         <div className="lg:col-span-2 bg-dark-panel text-white p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 text-white pointer-events-none"><DollarSign size={200} /></div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-6">Revenue Intel</p>
                     <h3 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4 italic">
                        ${monthlyRevenue.toLocaleString()}
                     </h3>
                     <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest rounded-full">Target Achieved</span>
                        <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Goal: ${revenueGoal.toLocaleString()}</span>
                     </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end text-right">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Efficiency Rating</p>
                     <p className="text-4xl font-black text-brand-accent tracking-tighter">98%</p>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/10">
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Project Average</p>
                     <p className="text-2xl font-black text-white tracking-tight">${Math.round(avgBookingValue).toLocaleString()}</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Pipeline Velocity</p>
                     <p className="text-2xl font-black text-white tracking-tight">Fast</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Top Performer</p>
                     <p className="text-2xl font-black text-brand-accent truncate tracking-tight">{bestPackage[0]}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Payout/Quick Actions Card */}
         <div className="bg-card border border-white/5 p-12 rounded-[2.5rem] shadow-premium flex flex-col justify-between">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-8">Quick Actions</p>
               <h4 className="text-3xl font-black text-white tracking-tighter leading-none mb-4">Shortcuts</h4>
               <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Manage your bookings workspace</p>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent"><ShieldCheck size={14} /></div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Client Contracts</span>
                  </div>
                  <Link href="/dashboard/contracts" className="text-[10px] font-black text-brand-accent uppercase hover:underline">View</Link>
               </div>
               <button 
                  onClick={() => router.push("/dashboard/media")}
                  className="w-full py-5 bg-brand-accent text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:brightness-110 transition-all shadow-brand-glow"
                >
                   Upload Photos
                </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ACTION CENTER */}
        <div className="lg:col-span-8 space-y-10">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tighter text-foreground italic">Action Center</h3>
              <div className="h-px flex-1 mx-8 bg-white/5" />
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-card border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">All</button>
                 <button className="px-4 py-2 bg-secondary border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">High Priority</button>
              </div>
           </div>
           
           <div className="space-y-4">
              {pulse.attention.length === 0 ? (
                <div className="py-32 text-center bg-secondary border border-dashed border-white/5 rounded-[2.5rem]">
                   <ShieldCheck className="mx-auto text-zinc-800 mb-4" size={48} />
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Operational Integrity Maintained</p>
                </div>
              ) : (
                pulse.attention.map((item: any) => (
                  <div key={item.id} className="p-10 bg-card border border-white/5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between group hover:border-brand-accent transition-all relative overflow-hidden shadow-premium">
                     <div className="flex items-center gap-10 w-full md:w-auto">
                        <div className="relative">
                           <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-zinc-500 group-hover:text-brand-accent group-hover:bg-brand-accent/10 transition-all border border-white/5 group-hover:border-brand-accent/20">
                              {item.type === 'inquiry' ? <Mail size={24} /> : <Clock size={24} />}
                           </div>
                           {item.action.category === 'action' && (
                             <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent rounded-full border-4 border-card shadow-brand-glow" />
                           )}
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{item.type === 'inquiry' ? 'New Inquiry' : 'Client Booking'}</p>
                           <p className="text-white font-black uppercase tracking-tight text-2xl leading-none mb-2 group-hover:text-brand-accent transition-colors">{item.name}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.action.label}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8 w-full md:w-auto mt-8 md:mt-0 pt-8 md:pt-0 border-t md:border-t-0 border-white/5">
                        <div className="hidden xl:block text-right">
                           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Impact Rating</p>
                           <p className="text-lg font-black text-white uppercase tracking-tighter">High</p>
                        </div>
                        <button 
                          onClick={() => item.type === 'inquiry' ? onAccept(item.id) : onMove(item.id, item.pipeline_stage)}
                          className="flex-1 md:flex-none px-10 py-5 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-3 shadow-brand-glow hover:brightness-110"
                        >
                           Execute <ArrowRight size={14} />
                        </button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* SIDEBAR INTEL */}
        <div className="lg:col-span-4 space-y-12">
           {/* TODAY'S SCHEDULE */}
           <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-border pb-4">Today's Schedule</h3>
              <div className="space-y-4">
                 {pulse.todayShoots.length === 0 ? (
                   <div className="p-8 border border-dashed border-white/5 rounded-[2rem] text-center">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic leading-relaxed">No tactical sessions <br/> scheduled for today.</p>
                   </div>
                 ) : (
                   pulse.todayShoots.map((b: any) => (
                     <div key={b.id} className="p-8 bg-secondary border border-white/5 rounded-[2rem] shadow-premium relative overflow-hidden group hover:border-brand-accent transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-white group-hover:text-brand-accent transition-colors"><Camera size={40} /></div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Active Shoot Session</p>
                        <p className="text-white font-black uppercase tracking-tight text-xl leading-none mb-3">{b.name}</p>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-accent">
                           <MapPin size={12} /> {b.location || 'Location Pending'}
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>

           {/* ACCOUNTS RECEIVABLE */}
           <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-border pb-4">Pending Payments</h3>
              <div className="space-y-3">
                 {pulse.unpaid.length === 0 ? (
                   <p className="text-[10px] font-bold text-zinc-500 italic uppercase">All balances paid in full</p>
                 ) : (
                   pulse.unpaid.slice(0, 5).map((b: any) => (
                     <div key={b.id} className="flex justify-between items-center px-6 py-4 bg-secondary border border-white/5 rounded-full shadow-premium hover:border-brand-accent transition-all group">
                        <div>
                           <p className="text-[11px] font-black text-white uppercase tracking-tight leading-none mb-1">{b.name}</p>
                           <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{b.shoot_type || 'Custom Asset'}</p>
                        </div>
                        <span className="text-sm font-black text-red-500 tracking-tighter group-hover:scale-110 transition-transform">${Number(b.total_amount).toLocaleString()}</span>
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
          <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground italic">Content Vault</h2>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">Marketing Assets & Strategic Copy</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-8 py-3 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all rounded-full shadow-brand-glow"
        >
          {isAdding ? 'Close Editor' : 'Add New Item'}
        </button>
      </div>

      {isAdding && (
        <div className="p-10 bg-card border border-white/5 rounded-[2.5rem] space-y-8 shadow-premium">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</label>
              <select 
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full bg-secondary border border-white/5 p-4 rounded-full text-white text-sm outline-none focus:border-brand-accent shadow-inner"
              >
                {categories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Asset Title</label>
              <input 
                type="text"
                placeholder="e.g. Senior Session Caption"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full bg-secondary border border-white/5 p-4 rounded-full text-white text-sm outline-none focus:border-brand-accent font-medium shadow-inner"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Asset Content</label>
            <textarea 
              placeholder="Paste copy, hashtags, or template details here..."
              value={newItem.content}
              onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
              className="w-full bg-secondary border border-white/5 p-8 rounded-[1.5rem] text-white text-sm outline-none focus:border-brand-accent min-h-[200px] font-medium leading-relaxed shadow-inner"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="w-full py-5 bg-brand-accent text-black font-black uppercase text-[11px] tracking-widest hover:brightness-110 transition-all rounded-full shadow-brand-glow"
          >
            Save Item
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shadow-sm ${filter === cat.id ? 'bg-brand-accent border-brand-accent text-black shadow-brand-glow' : 'bg-card border-white/5 text-zinc-500 hover:text-white'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.div 
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-white/5 p-8 rounded-[2rem] space-y-6 group hover:border-brand-accent transition-all shadow-premium"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent mb-2 block">{item.category}</span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white leading-none">{item.title}</h3>
                </div>
                <button 
                  onClick={() => handleCopy(item.content, item.id)}
                  className={`p-3 rounded-full border transition-all ${copyStatus === item.id ? 'bg-brand-accent border-brand-accent text-black' : 'bg-secondary border-white/5 text-zinc-500 hover:text-white hover:bg-card'}`}
                >
                  {copyStatus === item.id ? <ShieldCheck size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium line-clamp-6 italic">"{item.content}"</p>
              <div className="pt-6 border-t border-white/5">
                <button 
                  onClick={async () => {
                    const { error } = await supabase.from('marketing_vault').delete().eq('id', item.id);
                    if (!error) setVault(vault.filter(v => v.id !== item.id));
                  }}
                  className="text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-red-500 transition-colors"
                >
                  Delete Item
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
function InspirationBoard({ initialBoard, supabase }: { initialBoard: any[], supabase: any }) {
  const [board, setBoard] = useState(initialBoard);
  const [filter, setFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ category: 'Senior poses', title: '', image_url: '' });

  const categories = [
    { id: 'all', label: 'All References' },
    { id: 'Senior poses', label: 'Senior Poses' },
    { id: 'Cap & gown poses', label: 'Cap & Gown' },
    { id: 'Athlete portraits', label: 'Athlete Portraits' },
    { id: 'Basketball shots', label: 'Basketball' },
    { id: 'Volleyball shots', label: 'Volleyball' },
    { id: 'Couples/friends', label: 'Couples/Friends' },
    { id: 'Events', label: 'Events' },
  ];

  const filtered = filter === 'all' ? board : board.filter(b => b.category === filter);

  const handleAdd = async () => {
    const { data, error } = await supabase.from('inspiration_board').insert([newItem]).select();
    if (!error && data) {
      setBoard([data[0], ...board]);
      setIsAdding(false);
      setNewItem({ category: 'Senior poses', title: '', image_url: '' });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('inspiration_board').delete().eq('id', id);
    if (!error) {
      setBoard(board.filter(b => b.id !== id));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">Inspiration Board</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Visual Benchmarks & Posing Strategy</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-8 py-3 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:brightness-110 transition-all shadow-brand-glow"
        >
          {isAdding ? 'Close' : 'Add Inspiration'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
             <div className="p-8 bg-card border border-white/5 rounded-[2rem] grid grid-cols-1 md:grid-cols-3 gap-6 items-end shadow-premium">
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Category</label>
                 <select 
                   className="w-full bg-secondary border border-white/5 px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-accent rounded-full"
                   value={newItem.category}
                   onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                 >
                   {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Image URL</label>
                 <input 
                   type="text"
                   placeholder="Direct image link..."
                   className="w-full bg-secondary border border-white/5 px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-accent rounded-full shadow-inner"
                   value={newItem.image_url}
                   onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                 />
               </div>
               <button 
                 onClick={handleAdd}
                 className="w-full py-3 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:brightness-110 transition-all shadow-brand-glow"
               >
                 Save to Board
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${filter === cat.id ? 'bg-brand-accent text-black border-brand-accent shadow-brand-glow' : 'bg-card border-white/5 text-zinc-500 hover:text-white'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {filtered.map((item) => (
          <div key={item.id} className="relative group break-inside-avoid bg-zinc-900 rounded-sm overflow-hidden">
            <img src={item.image_url} alt={item.title} className="w-full grayscale group-hover:grayscale-0 transition-all duration-700" />
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all p-6 flex flex-col justify-between">
              <div className="flex justify-end">
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="w-8 h-8 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div>
                <span className="inline-block px-2 py-1 bg-brand-accent text-white text-[8px] font-black uppercase tracking-widest mb-2">{item.category}</span>
                <p className="text-white text-[10px] font-black uppercase tracking-widest">{item.title || 'Inspiration Reference'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-40 text-center bg-secondary border border-dashed border-white/5 rounded-[2.5rem] shadow-sm">
          <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No references found in this category.</p>
        </div>
      )}
    </motion.div>
  );
}

function CampaignManager({ initialCampaigns, supabase, siteSettings, onUpdateSettings }: { initialCampaigns: any[], supabase: any, siteSettings: any, onUpdateSettings: (updates: any) => void }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdatingGlobal, setIsUpdatingGlobal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    promo_price: '',
    booking_deadline: '',
    is_active: true,
    available_dates: [] as string[],
    instagram_captions: [] as string[],
    email_templates: [] as string[],
    message_templates: [] as string[]
  });

  const handleSetGlobal = async (campaignId: string) => {
    setIsUpdatingGlobal(true);
    const { error } = await supabase
      .from('site_settings')
      .update({ active_campaign_id: campaignId || null })
      .eq('id', siteSettings.id);
    
    if (!error) {
      onUpdateSettings({ active_campaign_id: campaignId || null });
    }
    setIsUpdatingGlobal(false);
  };

  const handleSave = async () => {
    if (editingId) {
      const { data, error } = await supabase.from('campaigns').update(formData).eq('id', editingId).select();
      if (!error && data) {
        setCampaigns(campaigns.map(c => c.id === editingId ? data[0] : c));
        setEditingId(null);
      }
    } else {
      const { data, error } = await supabase.from('campaigns').insert([formData]).select();
      if (!error && data) {
        setCampaigns([data[0], ...campaigns]);
        setIsAdding(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', slug: '', description: '', promo_price: '',
      booking_deadline: '', is_active: true, available_dates: [],
      instagram_captions: [], email_templates: [], message_templates: []
    });
  };

  const activeCampaign = campaigns.find(c => c.id === siteSettings.active_campaign_id);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      {/* GLOBAL MODE SWITCH */}
      <div className="premium-card p-10 bg-brand-accent/5 border border-brand-accent/20 rounded-sm flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${activeCampaign ? 'bg-brand-accent text-black shadow-brand-glow' : 'bg-zinc-900 text-zinc-700'}`}>
               <Zap size={28} />
            </div>
            <div>
               <h3 className="text-xl font-black uppercase tracking-tighter text-white leading-none mb-1">Global Seasonal Mode</h3>
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Currently Active: <span className="text-brand-accent">{activeCampaign?.title || 'Standard Operations'}</span></p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <select 
              className="bg-black border border-white/10 p-4 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-accent rounded-sm min-w-[250px]"
              value={siteSettings.active_campaign_id || ''}
              onChange={(e) => handleSetGlobal(e.target.value)}
              disabled={isUpdatingGlobal}
            >
               <option value="">Off (Standard Mode)</option>
               {campaigns.filter(c => c.is_active).map(c => (
                 <option key={c.id} value={c.id}>{c.title}</option>
               ))}
            </select>
            {isUpdatingGlobal && <Loader2 className="animate-spin text-brand-accent" size={16} />}
         </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white italic">Seasonal Campaigns</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Propaganda & Conversion Strategy</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); resetForm(); }}
          className="px-8 py-3 bg-brand-accent text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:brightness-110 transition-all shadow-brand-glow"
        >
          Launch New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((c) => (
          <div key={c.id} className="premium-card p-10 bg-zinc-900/20 border border-white/5 rounded-sm relative group">
            <div className={`absolute top-0 right-0 px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-sm ${c.is_active ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
              {c.is_active ? 'Active' : 'Draft'}
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">{c.title}</h3>
            <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-8">{c.promo_price} Promo</p>
            
            <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Deadline</span>
                  <span className="text-[10px] font-black text-white">{c.booking_deadline || 'Open'}</span>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Route</span>
                  <span className="text-[10px] font-black text-zinc-400">/campaign/{c.slug}</span>
               </div>
            </div>

            <div className="flex gap-2">
               <button 
                 onClick={() => { setEditingId(c.id); setFormData(c); }}
                 className="flex-1 py-3 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all rounded-sm"
               >
                 Modify Intel
               </button>
               <button className="px-4 py-3 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 transition-all rounded-sm">
                 <Copy size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl bg-zinc-900 border border-white/10 p-12 rounded-sm shadow-2xl relative overflow-y-auto max-h-[90vh]">
                <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={24} /></button>
                
                <div className="mb-12">
                   <span className="text-brand-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Campaign Deployment</span>
                   <h2 className="text-5xl font-black uppercase tracking-tighter text-white leading-none mb-4">{editingId ? 'Edit Campaign' : 'New Campaign'}</h2>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                   <div className="space-y-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Campaign Title</label>
                         <input type="text" className="w-full bg-black border border-white/5 p-4 text-white text-lg font-bold outline-none focus:border-brand-accent rounded-sm" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">URL Slug</label>
                         <div className="flex items-center gap-4 bg-black border border-white/5 p-4 rounded-sm">
                            <span className="text-zinc-600 font-bold">/campaign/</span>
                            <input type="text" className="bg-transparent text-white font-bold outline-none w-full" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Promo Price</label>
                            <input type="text" className="w-full bg-black border border-white/5 p-4 text-white font-bold outline-none focus:border-brand-accent rounded-sm" value={formData.promo_price} onChange={(e) => setFormData({ ...formData, promo_price: e.target.value })} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Booking Deadline</label>
                            <input type="date" className="w-full bg-black border border-white/5 p-4 text-white font-bold outline-none focus:border-brand-accent rounded-sm" value={formData.booking_deadline} onChange={(e) => setFormData({ ...formData, booking_deadline: e.target.value })} />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Strategic Description</label>
                         <textarea className="w-full bg-black border border-white/5 p-4 text-white text-sm outline-none focus:border-brand-accent rounded-sm min-h-[100px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-brand-accent">Intelligence Assets</label>
                         <div className="space-y-4">
                            <div className="p-4 bg-black/40 border border-white/5 rounded-sm">
                               <p className="text-[9px] font-black uppercase text-zinc-500 mb-4 tracking-widest">Instagram Captions</p>
                               <textarea 
                                 className="w-full bg-transparent text-zinc-400 text-xs outline-none min-h-[80px]" 
                                 placeholder="Add options separated by line breaks..."
                                 value={formData.instagram_captions.join('\n')}
                                 onChange={(e) => setFormData({ ...formData, instagram_captions: e.target.value.split('\n') })}
                               />
                            </div>
                            <div className="p-4 bg-black/40 border border-white/5 rounded-sm">
                               <p className="text-[9px] font-black uppercase text-zinc-500 mb-4 tracking-widest">Email Templates</p>
                               <textarea 
                                 className="w-full bg-transparent text-zinc-400 text-xs outline-none min-h-[80px]" 
                                 placeholder="Email body templates..."
                                 value={formData.email_templates.join('\n\n---\n\n')}
                                 onChange={(e) => setFormData({ ...formData, email_templates: e.target.value.split('\n\n---\n\n') })}
                               />
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div 
                           onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                           className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${formData.is_active ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                         >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${formData.is_active ? 'left-6' : 'left-1'}`} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Status</span>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button onClick={handleSave} className="flex-1 py-5 bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-zinc-200 transition-all rounded-sm">
                      Deploy Campaign
                   </button>
                   <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-12 py-5 bg-zinc-800 text-white font-black uppercase text-[11px] tracking-widest hover:bg-zinc-700 transition-all rounded-sm">
                      Abort
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

