"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { submitBooking } from "@/app/actions/booking";
import { createClient } from "@/utils/supabase/client";
import { InteractiveCalendar } from "@/components/booking/InteractiveCalendar";
import { trackEvent } from "@/utils/analytics";
import { Zap, Users } from "lucide-react";
import Link from "next/link";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefill = {
    name: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    phone: searchParams.get("phone") || "",
    pastClient: searchParams.get("past_client") === "true",
    campaign: searchParams.get("campaign") || "",
    promoPrice: searchParams.get("price") || "",
    promoPackage: searchParams.get("package") || ""
  };

  useEffect(() => {
    if (prefill.promoPackage) {
      setSelectedPackage(prefill.promoPackage);
    }
    trackEvent('booking_started', { campaign: prefill.campaign });
  }, [prefill.promoPackage, prefill.campaign]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  
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

      const { data: sData } = await supabase
        .from("site_settings")
        .select(`
          booking_min_advance_days, 
          booking_max_advance_days, 
          booking_is_active,
          active_campaign:campaigns(*)
        `)
        .limit(1)
        .single();
      if (sData) {
        if (sData.booking_min_advance_days !== null) setMinDays(sData.booking_min_advance_days);
        if (sData.booking_max_advance_days !== null) setMaxDays(sData.booking_max_advance_days);
        if (sData.booking_is_active !== null) setIsActive(sData.booking_is_active);
        if (sData.active_campaign) setActiveCampaign(sData.active_campaign);
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
      trackEvent('booking_completed', { package: selectedPackage });
    } else {
      setError(result.error || "Failed to submit booking.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-zinc-950 relative">
      <div className="fixed inset-0 z-[100] bg-ambient pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatePresence>
          {activeCampaign && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12 p-8 bg-brand-accent/10 border border-brand-accent/20 rounded-sm flex flex-col md:flex-row justify-between items-center gap-6"
            >
               <div className="flex items-center gap-6 text-center md:text-left">
                  <div className="w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]"><Zap size={24} /></div>
                  <div>
                     <h3 className="text-xl font-black uppercase tracking-tighter text-white">{activeCampaign.title} Mode Active</h3>
                     <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Promotion applies to all campaign bookings</p>
                  </div>
               </div>
               <Link href={`/campaign/${activeCampaign.slug}`} className="px-8 py-3 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:brightness-110 transition-all">View Details</Link>
            </motion.div>
          )}
        </AnimatePresence>
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
        {!prefill.promoPackage && (
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
                  onClick={() => {
                    const isTeamPackage = pkg.name.toLowerCase().includes('team') || pkg.name.toLowerCase().includes('media day');
                    if (isTeamPackage) {
                      router.push('/book/teams');
                      return;
                    }
                    setSelectedPackage(pkg.name);
                    trackEvent('package_select', { package_name: pkg.name, location: 'booking_page' });
                  }}
                  className={`premium-card p-6 md:p-10 rounded-2xl border transition-all cursor-pointer group ${
                    selectedPackage === pkg.name 
                      ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent' 
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
                      ? 'bg-brand-accent border-brand-accent text-white' 
                      : 'border-white/10 text-zinc-500 group-hover:border-white/30 group-hover:text-white'
                  }`}>
                    {selectedPackage === pkg.name ? 'Selected' : 'Select Package'}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {!prefill.promoPackage && (
          <div className="text-center mb-24">
             <Link href="/book/teams" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-brand-accent transition-all group">
                <Users size={14} className="group-hover:scale-110 transition-transform" />
                Looking for team or group bookings? <span className="underline underline-offset-4">Click here</span>
             </Link>
          </div>
        )}

        {prefill.promoPackage && (
          <div className="max-w-xl mx-auto mb-16">
             <div className="premium-card p-10 bg-brand-accent/5 border border-brand-accent/20 rounded-sm text-center">
                <span className="text-brand-accent text-[8px] font-black uppercase tracking-widest mb-4 block">Securing Promotional Offer</span>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2 leading-none italic">{prefill.promoPackage}</h2>
                <p className="text-2xl font-black text-white mb-6">{prefill.promoPrice}</p>
                <button onClick={() => window.location.href = '/book'} className="text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-all underline underline-offset-4">Change to standard package</button>
             </div>
          </div>
        )}

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
                  value={prefill.promoPrice ? prefill.promoPrice.replace(/[^0-9.]/g, '') : (packages.find(p => p.name === selectedPackage)?.price.replace(/[^0-9.]/g, '') || "0")} 
                />

                {/* Step 1: Client Info */}
                <div className="space-y-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">01. Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Name</label>
                      <input name="name" type="text" required defaultValue={prefill.name} className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Address</label>
                      <input name="email" type="email" required defaultValue={prefill.email} className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone Number</label>
                      <input name="phone" type="tel" required defaultValue={prefill.phone} className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50" />
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
                      <input name="event_time" type="time" required className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50" style={{ colorScheme: 'dark' }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Location</label>
                      <input name="location" type="text" required className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50" placeholder="Stadium, Park, Studio, etc." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">How did you hear about RCV.Media?</label>
                    <select name="lead_source" required defaultValue={prefill.pastClient ? "Past client" : ""} className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50 bg-zinc-950 appearance-none">
                      <option value="" disabled>Select an option</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Google">Google</option>
                      <option value="Friend/referral">Friend/referral</option>
                      <option value="Past client">Past client</option>
                      <option value="School/team">School/team</option>
                      <option value="Website">Website</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Additional Details</label>
                    <textarea name="message" rows={4} className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-brand-accent/50 resize-none" placeholder="Tell me more about the shoot..." />
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

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">Initializing...</div>}>
      <BookingContent />
    </Suspense>
  );
}
