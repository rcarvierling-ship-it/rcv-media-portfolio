"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { updateBookingStatus, sendMessageToClient, updateBookingPipeline, deliverGallery } from "@/app/actions/booking";
import { MessageSquare, Send, X, DollarSign, ExternalLink, Package, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BookingsAdminClient({ 
  initialBookings, 
  initialBlockedDates,
  initialSettings,
  albums = []
}: { 
  initialBookings: any[], 
  initialBlockedDates: any[],
  initialSettings: any,
  albums?: any[]
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [blockedDates, setBlockedDates] = useState(initialBlockedDates);
  const [messagingBooking, setMessagingBooking] = useState<any | null>(null);
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
      alert("Failed to update status and send email.");
    }
  };

  const handleUpdatePipeline = async (id: string, updates: any) => {
    const result = await updateBookingPipeline(id, updates);
    if (result.success) {
      setBookings(bookings.map(b => b.id === id ? { ...b, ...updates } : b));
      router.refresh();
    }
  };

  const handleDeliver = async (bookingId: string) => {
    if (!confirm("Are you sure you want to deliver this gallery? This will send the vault link and passcode to the client via email.")) return;
    const result = await deliverGallery(bookingId);
    if (result.success) {
      alert("Gallery delivered and client notified!");
      router.refresh();
    } else {
      alert("Failed to deliver gallery. Make sure an album is linked.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingBooking || !messageText) return;
    
    setIsSendingMessage(true);
    const result = await sendMessageToClient(messagingBooking.id, messageText);
    if (result.success) {
      setMessagingBooking(null);
      setMessageText("");
      alert("Message sent successfully!");
    } else {
      alert("Failed to send message.");
    }
    setIsSendingMessage(false);
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

  const unblockDate = async (id: string) => {
    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
    if (!error) {
      setBlockedDates(blockedDates.filter(d => d.id !== id));
      router.refresh();
    }
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    const { data: existing } = await supabase.from("site_settings").select("id").limit(1).single();
    if (existing) {
      await supabase.from("site_settings").update({
        booking_min_advance_days: minDays,
        booking_max_advance_days: maxDays,
        booking_is_active: isActive
      }).eq("id", existing.id);
    }
    setIsSavingSettings(false);
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
      
      {/* Left Col: Incoming Bookings */}
      <div className="xl:col-span-2 space-y-8">
        <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-4">
          Booking Requests
        </h2>
        
        {bookings.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-sm text-zinc-600">
            No booking requests yet.
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black uppercase tracking-tight text-white">{booking.name}</h3>
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                        booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.pipeline_stage && booking.pipeline_stage !== 'lead' && (
                        <span className="px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-400 rounded-sm">
                           Stage: {booking.pipeline_stage}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                      <a href={`mailto:${booking.email}`} className="hover:text-white transition-colors">{booking.email}</a>
                      {booking.phone && <span>{booking.phone}</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setMessagingBooking(booking)}
                      className="p-2 bg-zinc-800 text-zinc-400 hover:text-white transition-colors rounded-sm flex items-center gap-2 px-3"
                    >
                      <MessageSquare size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Message</span>
                    </button>
                    {booking.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(booking.id, 'confirmed')} className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200">
                          Confirm
                        </button>
                        <button onClick={() => handleUpdateStatus(booking.id, 'cancelled')} className="px-4 py-2 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white">
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Package</span>
                    <span className="text-white font-medium">{booking.package_selected || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Date & Time</span>
                    <span className="text-white font-medium">{booking.event_date}</span>
                  </div>
                  <div>
                     <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Pipeline Stage</span>
                     <select 
                       value={booking.pipeline_stage || 'lead'}
                       onChange={(e) => handleUpdatePipeline(booking.id, { pipeline_stage: e.target.value })}
                       className="bg-transparent text-white font-medium outline-none focus:text-blue-400"
                     >
                       <option value="lead" className="bg-black">Lead</option>
                       <option value="confirmed" className="bg-black">Confirmed</option>
                       <option value="shooting" className="bg-black">Shooting</option>
                       <option value="editing" className="bg-black">Editing</option>
                       <option value="delivered" className="bg-black">Delivered</option>
                     </select>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Payment</span>
                    <div className="flex items-center gap-2">
                       <input 
                         type="number"
                         value={booking.total_amount || 0}
                         onChange={(e) => handleUpdatePipeline(booking.id, { total_amount: parseFloat(e.target.value) })}
                         className="bg-transparent text-white font-medium outline-none w-16 border-b border-zinc-800 focus:border-blue-500"
                       />
                       <button 
                         onClick={() => handleUpdatePipeline(booking.id, { payment_status: booking.payment_status === 'paid' ? 'pending' : 'paid' })}
                         className={`text-[9px] font-black px-2 py-0.5 rounded-sm ${booking.payment_status === 'paid' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}
                       >
                         {booking.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                       </button>
                    </div>
                  </div>
                </div>

                {/* Pipeline Actions: Linking & Delivery */}
                <div className="p-6 bg-black/40 border border-white/5 rounded-lg flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="w-full md:w-auto">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-2">
                        <LinkIcon size={12} /> Associate Private Vault
                      </span>
                      <select 
                        value={booking.linked_album_id || ""}
                        onChange={(e) => handleUpdatePipeline(booking.id, { linked_album_id: e.target.value || null })}
                        className="w-full md:w-64 bg-zinc-900 border border-white/10 px-4 py-2 text-sm text-white outline-none rounded-sm"
                      >
                        <option value="">No Album Linked</option>
                        {albums.map(album => (
                          <option key={album.id} value={album.id}>{album.title} {album.is_private ? '(Private)' : ''}</option>
                        ))}
                      </select>
                   </div>

                   <button 
                     disabled={!booking.linked_album_id || booking.pipeline_stage === 'delivered'}
                     onClick={() => handleDeliver(booking.id)}
                     className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-500 disabled:opacity-20 transition-all rounded-sm flex items-center justify-center gap-3"
                   >
                     {booking.pipeline_stage === 'delivered' ? 'Photos Delivered' : 'Deliver Gallery'}
                     <Send size={14} />
                   </button>
                </div>
                
                {booking.message && (
                  <div className="mt-8">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Message from Client</span>
                    <p className="text-zinc-400 font-light leading-relaxed border-l-2 border-zinc-800 pl-4 italic">"{booking.message}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Col: Settings & Calendar */}
      <div className="xl:col-span-1 space-y-8">
        
        {/* Statistics Card */}
        <div className="bg-blue-600 p-8 rounded-sm text-white shadow-2xl shadow-blue-500/20">
           <Layout className="mb-4 opacity-50" />
           <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-1">Pipeline Snapshot</h3>
           <p className="text-4xl font-black mb-4">
             ${bookings.reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0).toLocaleString()}
           </p>
           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div>
                 <span className="block text-[9px] font-bold uppercase tracking-widest opacity-60">Active Shoots</span>
                 <span className="text-xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</span>
              </div>
              <div>
                 <span className="block text-[9px] font-bold uppercase tracking-widest opacity-60">Total Revenue</span>
                 <span className="text-xl font-bold">${bookings.filter(b => b.payment_status === 'paid').reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0).toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* Settings Panel */}
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500 mb-4">Configuration</h2>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-1">Accepting Bookings</h3>
                <p className="text-xs text-zinc-500">Toggle public form</p>
              </div>
              <button onClick={() => setIsActive(!isActive)} className={`w-12 h-6 rounded-full relative transition-colors ${isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isActive ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Min Advance Notice (Days)</label>
              <input type="number" value={minDays} onChange={e => setMinDays(parseInt(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Max Advance Notice (Days)</label>
              <input type="number" value={maxDays} onChange={e => setMaxDays(parseInt(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-zinc-500 text-sm" />
            </div>
            <button onClick={saveSettings} disabled={isSavingSettings} className="w-full px-4 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-50">
              {isSavingSettings ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>

        {/* Blocked Dates */}
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500 mb-4">Blocked Dates</h2>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm">
            <form onSubmit={handleBlockDate} className="space-y-4 mb-8">
              <input type="date" required value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white outline-none text-sm color-scheme-dark" style={{ colorScheme: 'dark' }} />
              <input type="text" value={newBlockReason} onChange={e => setNewBlockReason(e.target.value)} placeholder="Reason" className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white outline-none text-sm" />
              <button type="submit" disabled={isBlocking} className="w-full px-4 py-3 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-50">Block Date</button>
            </form>
            <div className="space-y-2">
              {blockedDates.map(bd => (
                <div key={bd.id} className="flex justify-between items-center bg-zinc-950 p-4 border border-zinc-800">
                  <span className="text-white text-xs">{bd.date}</span>
                  <button onClick={() => unblockDate(bd.id)} className="text-zinc-600 hover:text-red-400">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Messaging Modal */}
      <AnimatePresence>
        {messagingBooking && (
          <div className="fixed inset-0 z-[500] bg-black/90 flex items-center justify-center p-4 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-zinc-950 border border-white/10 p-10 w-full max-w-lg rounded-2xl"
             >
                <div className="flex justify-between items-center mb-8">
                   <div>
                     <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Message Client</h2>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">To: {messagingBooking.name} ({messagingBooking.email})</p>
                   </div>
                   <button onClick={() => setMessagingBooking(null)} className="text-zinc-600 hover:text-white transition-colors">
                      <X size={24} />
                   </button>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-6">
                   <textarea 
                     required
                     value={messageText}
                     onChange={(e) => setMessageText(e.target.value)}
                     placeholder="Type your message here..."
                     className="w-full bg-zinc-900 border border-white/5 p-6 text-white text-sm outline-none focus:border-blue-500/50 rounded-sm min-h-[200px] resize-none"
                   />
                   <button 
                     type="submit" 
                     disabled={isSendingMessage}
                     className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isSendingMessage ? "Sending..." : "Dispatch Message"} <Send size={14} />
                   </button>
                </form>
                <p className="mt-6 text-[9px] text-zinc-600 font-bold uppercase tracking-widest text-center">
                  Replies will be sent to your phone: 8129141183
                </p>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
