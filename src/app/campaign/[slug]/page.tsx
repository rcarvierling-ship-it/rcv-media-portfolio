import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, DollarSign, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default async function CampaignPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!campaign) notFound();

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-24 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-brand-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Limited Time Campaign</span>
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-white mb-6 leading-none italic">
            {campaign.title}
          </h1>
          <p className="text-zinc-500 text-xl font-light max-w-2xl mx-auto leading-relaxed">
            {campaign.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="premium-card p-12 bg-white/5 border border-white/10 rounded-sm text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Exclusive Promo Price</p>
            <div className="text-7xl font-black text-white tracking-tighter mb-4">{campaign.promo_price}</div>
            <p className="text-xs font-bold text-brand-accent uppercase tracking-widest">All Inclusive Package</p>
          </div>
          
          <div className="premium-card p-12 bg-white/5 border border-white/10 rounded-sm text-center flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Booking Deadline</p>
            <div className="text-4xl font-black text-white uppercase tracking-tighter mb-4 flex items-center justify-center gap-4">
              <Clock className="text-red-500" /> {campaign.booking_deadline || 'Open'}
            </div>
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest italic">Secure your spot before it's gone</p>
          </div>
        </div>

        <div className="space-y-12 mb-20">
           <div className="flex items-center gap-6">
              <div className="h-px flex-1 bg-white/10" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">The Strategy</h3>
              <div className="h-px flex-1 bg-white/10" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                 <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent"><Calendar size={20} /></div>
                 <h4 className="text-white font-black uppercase tracking-widest text-xs">Flexible Dates</h4>
                 <p className="text-zinc-500 text-sm leading-relaxed">Choose from a variety of available windows tailored for this campaign.</p>
              </div>
              <div className="space-y-4">
                 <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent"><DollarSign size={20} /></div>
                 <h4 className="text-white font-black uppercase tracking-widest text-xs">Value Optimization</h4>
                 <p className="text-zinc-500 text-sm leading-relaxed">High-fidelity production at an optimized seasonal rate.</p>
              </div>
              <div className="space-y-4">
                 <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent"><ArrowRight size={20} /></div>
                 <h4 className="text-white font-black uppercase tracking-widest text-xs">Priority Delivery</h4>
                 <p className="text-zinc-500 text-sm leading-relaxed">Campaign bookings receive expedited editing and asset delivery.</p>
              </div>
           </div>
        </div>

        <div className="text-center">
          <Link 
            href={`/book?campaign=${campaign.slug}&price=${encodeURIComponent(campaign.promo_price)}&package=${encodeURIComponent(campaign.title)}`}
            className="inline-block px-16 py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-sm hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            Claim This Offer
          </Link>
          <p className="mt-8 text-[9px] font-black uppercase tracking-widest text-zinc-700">Limited capacity • First come first served</p>
        </div>
      </div>
    </div>
  );
}
