"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { submitBooking } from "@/app/actions/booking";
import { createClient } from "@/utils/supabase/client";
import { InteractiveCalendar } from "@/components/booking/InteractiveCalendar";
import { trackEvent } from "@/utils/analytics";
import { Trophy, Users, Shield, Target, Clock, ArrowRight } from "lucide-react";

export default function TeamBookingPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    trackEvent('team_booking_started');
    async function fetchConfig() {
      const { data: bData } = await supabase.from("blocked_dates").select("date");
      if (bData) setBlockedDates(bData.map(d => d.date));
    }
    fetchConfig();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate) {
      setError("Please select a target date.");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("event_date", selectedDate);
    formData.append("booking_type", "team");
    
    const result = await submitBooking(formData);

    if (result.success) {
      setSuccess(true);
      trackEvent('team_booking_completed');
    } else {
      setError(result.error || "Failed to submit request.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-zinc-950 relative">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_50%)]" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-accent/20"
          >
            <Trophy size={32} />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-white italic">Team Operations</h1>
          <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.4em]">Media Days • Championships • Organizational Logistics</p>
        </header>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-20 text-center border border-brand-accent/20">
               <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Shield size={40} />
               </div>
               <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4 italic">Intel Received</h2>
               <p className="text-zinc-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">Your organization's request has been prioritized. Our team will review the logistics and reach out via encrypted channel shortly.</p>
               <button onClick={() => setSuccess(false)} className="px-12 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-sm">Submit Another Brief</button>
            </motion.div>
          ) : (
            <motion.form onSubmit={handleSubmit} className="space-y-16">
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-sm text-xs font-black uppercase tracking-widest">{error}</div>}

              {/* SECTION 1: ORGANIZATION BRIEF */}
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 text-[10px] font-black rounded-sm italic">01</span>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Organizational Intelligence</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Team / Organization Name</label>
                    <input name="team_name" type="text" required className="w-full bg-black border border-white/5 px-6 py-4 text-white text-sm font-bold outline-none focus:border-brand-accent/50 rounded-sm" placeholder="e.g. Apex High Varsity Basketball" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Sport / Activity Type</label>
                    <input name="shoot_type" type="text" required className="w-full bg-black border border-white/5 px-6 py-4 text-white text-sm font-bold outline-none focus:border-brand-accent/50 rounded-sm" placeholder="e.g. Volleyball, Football, Corporate" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Coach / Main Contact Person</label>
                    <input name="coach_name" type="text" required className="w-full bg-black border border-white/5 px-6 py-4 text-white text-sm font-bold outline-none focus:border-brand-accent/50 rounded-sm" placeholder="Full Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Estimated Headcount</label>
                    <input name="estimated_count" type="number" required className="w-full bg-black border border-white/5 px-6 py-4 text-white text-sm font-bold outline-none focus:border-brand-accent/50 rounded-sm" placeholder="Approximate number of people" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ENGAGEMENT TYPE */}
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 text-[10px] font-black rounded-sm italic">02</span>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Mission Profile</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Booking Objective</label>
                     <select name="package_selected" required className="w-full bg-black border border-white/5 px-6 py-4 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-accent/50 rounded-sm appearance-none">
                        <option value="Media Day">Media Day (Portraits + Hype)</option>
                        <option value="Event Coverage">Event Coverage (Action + Candid)</option>
                        <option value="Full Season">Full Season Campaign</option>
                        <option value="Other">Other Strategic Need</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Target Budget</label>
                    <input name="budget" type="text" className="w-full bg-black border border-white/5 px-6 py-4 text-white text-sm font-bold outline-none focus:border-brand-accent/50 rounded-sm" placeholder="e.g. $1,500 - $2,500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Desired Assets / Deliverables</label>
                  <textarea name="message" rows={3} className="w-full bg-black border border-white/5 px-6 py-4 text-white text-sm outline-none focus:border-brand-accent/50 rounded-sm resize-none" placeholder="e.g. 50 digital portraits, 1 hype reel clip, printed banners..." />
                </div>
              </div>

              {/* SECTION 3: LOGISTICS */}
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 text-[10px] font-black rounded-sm italic">03</span>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Field Logistics</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Primary Email</label>
                        <input name="email" type="email" required className="w-full bg-black border border-white/5 px-6 py-4 text-white text-sm font-bold outline-none focus:border-brand-accent/50 rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Mobile Unit (Phone)</label>
                        <input name="phone" type="tel" required className="w-full bg-black border border-white/5 px-6 py-4 text-white text-sm font-bold outline-none focus:border-brand-accent/50 rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Mission Location</label>
                        <input name="location" type="text" required className="w-full bg-black border border-white/5 px-6 py-4 text-white text-sm font-bold outline-none focus:border-brand-accent/50 rounded-sm" placeholder="Stadium / School Gym / Office" />
                      </div>
                      <input type="hidden" name="name" value="Team/Org Contact" />
                   </div>
                   
                   <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Preferred Mission Date</label>
                      <InteractiveCalendar 
                        onDateSelect={setSelectedDate}
                        blockedDates={blockedDates}
                        minDays={14}
                        maxDays={365}
                        selectedDate={selectedDate}
                      />
                   </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !selectedDate}
                className="w-full py-8 bg-brand-accent text-white font-black uppercase tracking-[0.5em] text-xs rounded-sm hover:brightness-110 transition-all disabled:opacity-50 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
              >
                {isSubmitting ? 'Deploying...' : 'Submit Strategic Brief'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
