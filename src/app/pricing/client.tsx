"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, HelpCircle } from "lucide-react";

import { useState, useEffect } from "react";
import { trackEvent } from "@/utils/analytics";

export function PricingClient({ packages }: { packages: any[] }) {
  useEffect(() => {
    trackEvent('pricing_view');
  }, []);
  return (
    <div className="min-h-screen bg-background pt-40 pb-24 relative overflow-hidden selection:bg-primary selection:text-primary-foreground text-foreground">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-brand-accent/20 blur-[200px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[800px] h-[800px] bg-zinc-900 blur-[200px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent mb-8 block border border-white/5 px-6 py-2 rounded-full w-fit mx-auto">Investment Intel</span>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-foreground mb-12 leading-[0.8]">
              Transparent <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white italic">Excellence.</span>
            </h1>
            <p className="text-lg md:text-2xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed">
              High-performance photography tiers for every mission. 
              Secure your session with precision-engineered packages.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-40">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-card p-12 rounded-[2.5rem] border border-white/5 flex flex-col group hover:border-brand-accent transition-all relative overflow-hidden shadow-premium hover:shadow-2xl hover:shadow-brand-glow/10"
            >
              {/* Accent Glow */}
              <div 
                className="absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-10 transition-opacity"
                style={{ backgroundColor: pkg.accent_color }}
              />
              
              <div className="mb-16">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Tactical Tier</span>
                  <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: pkg.accent_color }} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground group-hover:text-brand-accent transition-colors mb-4">{pkg.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-foreground tracking-tighter italic text-white">
                    {pkg.price.includes('$') ? pkg.price : `$${pkg.price}`}
                  </span>
                </div>
              </div>

              <ul className="space-y-5 mb-16 flex-1">
                {pkg.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4 text-zinc-500 text-sm font-medium leading-relaxed">
                    <Check size={16} className="text-brand-accent mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={`/book?package=${encodeURIComponent(pkg.name)}`}
                className="w-full py-6 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-full hover:brightness-110 transition-all flex items-center justify-center gap-3 group/btn shadow-xl shadow-black/10 active:scale-95"
              >
                Initiate Session <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto border-t border-white/5 pt-24">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-4">Common Inquiries</h2>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Everything you need to know before we shoot</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { q: "What is the turnaround time?", a: "Standard turnaround is 1-2 weeks. Priority delivery (48-72 hours) is available for specific packages or as an add-on." },
                { q: "Do you travel for shoots?", a: "Absolutely. I'm based in Louisville/Muncie but available for travel worldwide. Travel fees apply for locations outside a 30-mile radius." },
                { q: "How are photos delivered?", a: "You'll receive a link to a private, high-resolution digital gallery where you can view and download all your edited assets." },
                { q: "Can I get the RAW files?", a: "I do not provide unedited RAW files. My work is defined by the final edit, ensuring you receive only the highest quality results." }
              ].map((faq, i) => (
                <div key={i} className="space-y-4">
                   <div className="flex items-center gap-3 text-brand-accent">
                      <HelpCircle size={16} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">{faq.q}</h4>
                   </div>
                   <p className="text-sm text-secondary-foreground leading-relaxed font-light">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-32 text-center">
           <div className="bg-card p-16 border border-white/5 rounded-[2.5rem] inline-block max-w-2xl shadow-sm">
              <h3 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-6">Need a custom solution?</h3>
              <p className="text-zinc-500 mb-10 text-sm">For large-scale events, recurring media days, or unique project requirements, let's build a custom package.</p>
              <Link href="/contact" className="px-12 py-5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all rounded-full inline-flex items-center gap-3 shadow-xl shadow-black/10">
                 Contact for Custom Quote <ArrowRight size={14} />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
