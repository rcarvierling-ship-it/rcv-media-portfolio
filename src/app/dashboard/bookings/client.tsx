"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function BookingsAdminClient({ 
  initialBookings, 
  initialBlockedDates,
  initialSettings
}: { 
  initialBookings: any[], 
  initialBlockedDates: any[],
  initialSettings: any
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [blockedDates, setBlockedDates] = useState(initialBlockedDates);
  
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

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (!error) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      router.refresh();
    }
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
        <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500">Booking Requests</h2>
        
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
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                      <a href={`mailto:${booking.email}`} className="hover:text-white transition-colors">{booking.email}</a>
                      {booking.phone && <span>{booking.phone}</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {booking.status !== 'confirmed' && (
                      <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200">
                        Confirm
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="px-4 py-2 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Package</span>
                    <span className="text-white font-medium">{booking.package_selected || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Shoot Type</span>
                    <span className="text-white font-medium">{booking.shoot_type}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Date & Time</span>
                    <span className="text-white font-medium">{booking.event_date} @ {booking.event_time || "TBD"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Location</span>
                    <span className="text-white font-medium">{booking.location || "N/A"}</span>
                  </div>
                </div>
                
                {booking.message && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Message</span>
                    <p className="text-zinc-400 font-light leading-relaxed border-l-2 border-zinc-800 pl-4">{booking.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Col: Settings & Calendar */}
      <div className="xl:col-span-1 space-y-8">
        
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
    </div>
  );
}
