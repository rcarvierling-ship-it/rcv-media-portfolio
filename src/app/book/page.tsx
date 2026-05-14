"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { submitBooking } from "@/app/actions/booking";
import { createClient } from "@/utils/supabase/client";
import { InteractiveCalendar } from "@/components/booking/InteractiveCalendar";

export default function BookPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [minDays, setMinDays] = useState(21);
  const [maxDays, setMaxDays] = useState(180);
  const [isActive, setIsActive] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch dynamic packages
      const { data: pkgData } = await supabase
        .from("pricing_packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (pkgData) setPackages(pkgData);

      // Fetch booking constraints
      const { data: bData } = await supabase.from("blocked_dates").select("date");
      if (bData) setBlockedDates(bData.map(d => d.date));

      const { data: sData } = await supabase.from("site_settings").select("booking_min_advance_days, booking_max_advance_days, booking_is_active").limit(1).single();
      if (sData) {
        if (sData.booking_min_advance_days !== null) setMinDays(sData.booking_min_advance_days);
        if (sData.booking_max_advance_days !== null) setMaxDays(sData.booking_max_advance_days);
        if (sData.booking_is_active !== null) setIsActive(sData.booking_is_active);
      }
      setLoadingConfig(false);
    }
    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate) {
      setError("Please select an available date on the calendar.");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitBooking(formData);

    if (result.success) {
      setSuccess(true);
      setSelectedPackage(null);
      setSelectedDate("");
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error || "Failed to submit booking.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-zinc-950 relative">
      <div className="fixed inset-0 z-[100] bg-ambient pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-white"
          >
            The Booking
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 font-light text-xl uppercase tracking-widest"
          >
            Select your package & secure the moment
          </motion.p>
        </header>

        {/* 1. DYNAMIC PRICING PACKAGES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {packages.length === 0 && !loadingConfig ? (
            <div className="md:col-span-3 text-center p-20 border border-dashed border-zinc-800 text-zinc-600 font-bold uppercase tracking-widest">
              No packages currently active.
            </div>
          ) : (
            packages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedPackage(pkg.name)}
                className={`premium-card p-6 md:p-10 rounded-2xl border transition-all cursor-pointer group ${
                  selectedPackage === pkg.name 
                    ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500' 
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{pkg.name}</h3>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pkg.accent_color }} />
                </div>
                <div className="text-5xl font-black text-white mb-8 tracking-tighter">{pkg.price}</div>
                <ul className="space-y-4 mb-10">
                  {pkg.features?.map((f: string) => (
                    <li key={f} className="text-zinc-400 text-sm flex items-center gap-3">
                      <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className={`text-[10px] font-black uppercase tracking-widest text-center py-4 border rounded-sm transition-all ${
                  selectedPackage === pkg.name 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-white/10 text-zinc-500 group-hover:border-white/30 group-hover:text-white'
                }`}>
                  {selectedPackage === pkg.name ? 'Selected' : 'Select Package'}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* 2. BOOKING FORM */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {loadingConfig ? (
               <div className="text-center p-12 text-zinc-500 uppercase font-black tracking-widest text-xs">Initializing...</div>
            ) : !isActive ? (
              <motion.div className="premium-card p-12 text-center rounded-2xl border border-white/10">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Bookings Closed</h2>
                <p className="text-zinc-400 text-lg">Check back later for availability.</p>
              </motion.div>
            ) : success ? (
              <motion.div className="premium-card p-12 text-center rounded-2xl border border-white/10">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Confirmed</h2>
                <p className="text-zinc-400 text-lg mb-8">Your request is in. Check your email for details.</p>
                <button onClick={() => setSuccess(false)} className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-sm">
                  Book Another
                </button>
              </motion.div>
            ) : (
              <motion.form onSubmit={handleSubmit} className="space-y-12">
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-sm text-sm font-bold">{error}</div>}
                
                <input type="hidden" name="shoot_type" value={selectedPackage || ""} />
                <input type="hidden" name="package_selected" value={selectedPackage || ""} />
                <input type="hidden" name="event_date" value={selectedDate} />
                <input 
                  type="hidden" 
                  name="total_amount" 
                  value={packages.find(p => p.name === selectedPackage)?.price.replace(/[^0-9.]/g, '') || "0"} 
                />

                {/* Step 1: Client Info */}
                <div className="space-y-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">01. Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Name</label>
                      <input name="name" type="text" required className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Address</label>
                      <input name="email" type="email" required className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone Number</label>
                      <input name="phone" type="tel" required className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50" />
                    </div>
                  </div>
                </div>

                {/* Step 2: Date Selection */}
                <div className="space-y-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">02. Select Date</h2>
                  <InteractiveCalendar 
                    onDateSelect={setSelectedDate}
                    blockedDates={blockedDates}
                    minDays={minDays}
                    maxDays={maxDays}
                    selectedDate={selectedDate}
                  />
                </div>

                {/* Step 3: Logistics */}
                <div className="space-y-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">03. Logistics & Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Event Time</label>
                      <input name="event_time" type="time" required className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50" style={{ colorScheme: 'dark' }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Location</label>
                      <input name="location" type="text" required className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50" placeholder="Stadium, Park, Studio, etc." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Additional Details</label>
                    <textarea name="message" rows={4} className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50 resize-none" placeholder="Tell me more about the shoot..." />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !selectedPackage || !selectedDate}
                  className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-sm hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : !selectedPackage ? 'Select a Package Above' : !selectedDate ? 'Select a Date' : 'Complete Booking Request'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
