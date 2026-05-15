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
    <div className="min-h-screen bg-black pt-32 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-accent/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-zinc-900/20 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-brand-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">The Investment</span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.9]">
              Transparent <br/> <span className="text-zinc-800 italic">Excellence</span>
            </h1>
            <p className="text-zinc-500 font-light text-lg max-w-2xl mx-auto leading-relaxed">
              Premium photography isn't just an expense—it's an investment in your legacy. 
              Choose a tier that matches your ambition.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="premium-card p-10 rounded-sm border border-white/5 bg-zinc-900/20 backdrop-blur-xl flex flex-col group hover:border-white/10 transition-all relative overflow-hidden"
            >
              {/* Accent Glow */}
              <div 
                className="absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: pkg.accent_color }}
              />
              
              <div className="mb-12">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-brand-accent transition-colors">{pkg.name}</h3>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pkg.accent_color }} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white tracking-tighter">{pkg.price}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-12 flex-1">
                {pkg.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-zinc-400 text-xs font-medium leading-relaxed">
                    <Check size={14} className="text-zinc-700 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={`/book?package=${encodeURIComponent(pkg.name)}`}
                onClick={() => trackEvent('package_select', { package_name: pkg.name })}
                className="w-full py-5 border border-white/5 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-sm hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 group/btn"
              >
                Initiate Session <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto border-t border-white/5 pt-24">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Common Inquiries</h2>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Everything you need to know before we shoot</p>
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
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{faq.q}</h4>
                   </div>
                   <p className="text-sm text-zinc-500 leading-relaxed font-light">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-32 text-center">
           <div className="premium-card p-16 border border-white/5 bg-zinc-900/10 rounded-sm inline-block max-w-2xl">
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-6">Need a custom solution?</h3>
              <p className="text-zinc-500 mb-10 text-sm">For large-scale events, recurring media days, or unique project requirements, let's build a custom package.</p>
              <Link href="/contact" className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all rounded-sm inline-flex items-center gap-3">
                 Contact for Custom Quote <ArrowRight size={14} />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
