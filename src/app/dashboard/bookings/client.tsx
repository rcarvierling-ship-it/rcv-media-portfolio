"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  updateBookingStatus, 
  sendMessageToClient, 
  updateBookingPipeline, 
  deliverGallery,
  replyToInquiry 
} from "@/app/actions/booking";
import { 
  MessageSquare, Send, X, DollarSign, 
  ExternalLink, Package, Layout, Link as LinkIcon,
  Mail, Calendar, Clock, CheckCircle2, AlertCircle, Loader2,
  ChevronRight, Camera, Edit3, ArrowRightLeft, LayoutGrid, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PipelineBoard from "@/components/dashboard/PipelineBoard";

export function BookingsAdminClient({ 
  initialBookings, 
  initialBlockedDates,
  initialSettings,
  albums = [],
  initialInquiries = []
}: { 
  initialBookings: any[], 
  initialBlockedDates: any[],
  initialSettings: any,
  albums?: any[],
  initialInquiries?: any[]
}) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "details" | "inquiries" | "settings">("pipeline");
  const [bookings, setBookings] = useState(initialBookings);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [blockedDates, setBlockedDates] = useState(initialBlockedDates);
  
  // Messaging Logic
  const [messagingTarget, setMessagingTarget] = useState<{ id: string, type: 'booking' | 'inquiry', name: string } | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Settings State
  const [minDays, setMinDays] = useState(initialSettings?.booking_min_advance_days ?? 21);
  const [maxDays, setMaxDays] = useState(initialSettings?.booking_max_advance_days ?? 180);
  const [isActive, setIsActive] = useState(initialSettings?.booking_is_active ?? true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [isBlocking, setIsBlocking] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  
  const supabase = createClient();
  const router = useRouter();

  const handleUpdateStatus = async (id: string, status: string) => {
    const result = await updateBookingStatus(id, status);
    if (result.success) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      router.refresh();
    } else {
      alert("Failed to update status.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingTarget || !messageText) return;
    
    setIsSendingMessage(true);
    let result;
    if (messagingTarget.type === 'booking') {
      result = await sendMessageToClient(messagingTarget.id, messageText);
    } else {
      result = await replyToInquiry(messagingTarget.id, messageText);
    }

    if (result.success) {
      if (messagingTarget.type === 'inquiry') {
        setInquiries(inquiries.map(i => i.id === messagingTarget.id ? { ...i, status: 'replied' } : i));
      }
      setMessagingTarget(null);
      setMessageText("");
      alert("Message sent successfully!");
    } else {
      alert("Failed to send message.");
    }
    setIsSendingMessage(false);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        booking_min_advance_days: minDays,
        booking_max_advance_days: maxDays,
        booking_is_active: isActive
      })
      .eq("id", initialSettings?.id);
    
    if (!error) alert("Settings updated!");
    setIsSavingSettings(false);
    router.refresh();
  };

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;
    
    setIsBlocking(true);
    const { data, error } = await supabase.from("blocked_dates").insert([
      { date: newBlockDate, reason: newBlockReason }
    ]).select().single();
    
    if (!error && data) {
      setBlockedDates([...blockedDates, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setNewBlockDate("");
      setNewBlockReason("");
      router.refresh();
    }
    setIsBlocking(false);
  };

  return (
    <div className="space-y-12">
      {/* Integrated Command Center Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-white/5">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">Command Center</h1>
          <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] mt-4">Unified Agency Management Suite</p>
        </div>

        <div className="flex flex-wrap gap-2">
           <button 
             onClick={() => setActiveTab("pipeline")}
             className={`flex items-center gap-2 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'pipeline' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}
           >
             <LayoutGrid size={14} /> Pipeline
           </button>
           <button 
             onClick={() => setActiveTab("details")}
             className={`flex items-center gap-2 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'details' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}
           >
             <List size={14} /> Booking Details
           </button>
           <button 
             onClick={() => setActiveTab("inquiries")}
             className={`flex items-center gap-2 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'inquiries' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}
           >
             <Mail size={14} /> Inquiries ({inquiries.filter(i => i.status === 'new').length})
           </button>
           <button 
             onClick={() => setActiveTab("settings")}
             className={`flex items-center gap-2 px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'settings' ? 'bg-white text-black border-white' : 'text-zinc-500 border-white/5 hover:border-white/20'}`}
           >
             <Layout size={14} /> Settings
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "pipeline" && (
          <motion.div 
            key="pipeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
             <PipelineBoard initialBookings={bookings} />
          </motion.div>
        )}

        {activeTab === "details" && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-6"
          >
            {bookings.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-zinc-800 rounded-sm">
                <p className="text-zinc-600 uppercase tracking-widest text-xs font-black">No bookings found</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="premium-card p-8 rounded-sm border border-white/5 bg-zinc-900/20">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          booking.status === 'canceled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {booking.status}
                        </span>
                        
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                           {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">{booking.name}</h3>
                      <p className="text-zinc-400 font-medium mb-6 flex items-center gap-2">
                        <Mail size={14} className="text-zinc-600" /> {booking.email}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                         <div>
                            <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Session Date</span>
                            <span className="text-white font-bold flex items-center gap-2"><Calendar size={14} /> {booking.session_date}</span>
                         </div>
                         <div>
                            <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Session Type</span>
                            <span className="text-white font-bold uppercase">{booking.session_type}</span>
                         </div>
                         <div>
                            <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Total Amount</span>
                            <span className="text-white font-bold text-lg flex items-center gap-1">
                               <DollarSign size={16} className="text-emerald-500" /> 
                               <input 
                                 type="number" 
                                 className="bg-transparent w-24 outline-none border-b border-transparent focus:border-emerald-500/50"
                                 defaultValue={booking.total_amount || 0}
                                 onBlur={(e) => updateBookingPipeline(booking.id, { total_amount: parseFloat(e.target.value) })}
                               />
                            </span>
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 justify-center min-w-[200px]">
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                          className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] rounded-sm hover:bg-emerald-400 transition-colors"
                        >
                          Confirm Booking
                        </button>
                      )}
                      
                      <button 
                        onClick={() => setMessagingTarget({ id: booking.id, type: 'booking', name: booking.name })}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={14} /> Send Message
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "inquiries" && (
          <motion.div 
            key="inquiries"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-6"
          >
            {inquiries.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-zinc-800 rounded-sm">
                <p className="text-zinc-600 uppercase tracking-widest text-xs font-black">No inquiries found</p>
              </div>
            ) : (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="premium-card p-8 rounded-sm border border-white/5 bg-zinc-900/20">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          inquiry.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {inquiry.status}
                        </span>
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                           {new Date(inquiry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">{inquiry.name}</h3>
                      <p className="text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">{inquiry.subject}</p>
                      
                      <div className="bg-black/40 p-6 rounded-sm border border-white/5 mb-6">
                        <p className="text-zinc-300 italic line-clamp-3">"{inquiry.message}"</p>
                      </div>

                      <p className="text-zinc-500 font-medium flex items-center gap-2 text-xs">
                        <Mail size={12} className="text-zinc-700" /> {inquiry.email}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 justify-center min-w-[200px]">
                      <button 
                        onClick={() => setMessagingTarget({ id: inquiry.id, type: 'inquiry', name: inquiry.name })}
                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Send size={14} /> Reply to Inquiry
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            <div className="space-y-12">
               <div className="premium-card p-10 rounded-sm border border-white/5">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
                    <Layout size={20} className="text-blue-500" /> Booking Rules
                  </h2>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-white font-bold uppercase tracking-widest text-xs">Booking Status</p>
                          <p className="text-zinc-500 text-[10px] uppercase font-medium">Turn on/off all new inquiries</p>
                       </div>
                       <button 
                         onClick={() => setIsActive(!isActive)}
                         className={`w-14 h-8 rounded-full relative transition-colors ${isActive ? 'bg-blue-600' : 'bg-zinc-800'}`}
                       >
                         <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isActive ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Min Advance (Days)</label>
                          <input 
                            type="number" 
                            value={minDays} 
                            onChange={(e) => setMinDays(parseInt(e.target.value))}
                            className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white outline-none focus:border-blue-500/50"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Max Horizon (Days)</label>
                          <input 
                            type="number" 
                            value={maxDays} 
                            onChange={(e) => setMaxDays(parseInt(e.target.value))}
                            className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white outline-none focus:border-blue-500/50"
                          />
                       </div>
                    </div>

                    <button 
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors"
                    >
                      {isSavingSettings ? "Saving..." : "Save Configuration"}
                    </button>
                  </div>
               </div>

               <div className="premium-card p-10 rounded-sm border border-white/5">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-8">Calendar Blackout</h2>
                  <form onSubmit={handleBlockDate} className="flex gap-4 mb-8">
                     <input 
                       required
                       type="date" 
                       value={newBlockDate} 
                       onChange={(e) => setNewBlockDate(e.target.value)}
                       className="flex-1 bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white text-xs"
                     />
                     <button 
                       disabled={isBlocking}
                       className="px-6 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-sm hover:bg-zinc-200"
                     >
                       Block
                     </button>
                  </form>

                  <div className="space-y-3">
                     {blockedDates.map((date) => (
                       <div key={date.id} className="flex justify-between items-center p-4 bg-black/40 rounded-sm border border-white/5">
                          <span className="text-zinc-300 font-bold uppercase tracking-widest text-[10px]">{new Date(date.date).toLocaleDateString()}</span>
                          <button 
                            onClick={async () => {
                               await supabase.from("blocked_dates").delete().eq("id", date.id);
                               setBlockedDates(blockedDates.filter(d => d.id !== date.id));
                            }}
                            className="text-zinc-600 hover:text-red-500 transition-colors"
                          >
                             <X size={14} />
                          </button>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messaging Modal */}
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
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">
                  Communication Portal
                </span>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
                  Message {messagingTarget.name}
                </h3>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-6">
                <textarea 
                  required
                  autoFocus
                  rows={8}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-sm p-6 text-white text-lg outline-none focus:border-blue-500/50 transition-all resize-none"
                  placeholder="Type your message here..."
                />
                
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 text-center">
                  This will be sent via Email. Replies will arrive on your phone via SMS.
                </p>

                <button 
                  disabled={isSendingMessage}
                  className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSendingMessage ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Personal Message</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
