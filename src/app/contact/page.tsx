"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { submitContact } from "@/app/actions/contact";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    const formData = new FormData(e.currentTarget);
    const result = await submitContact(formData);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(true);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-zinc-950 relative">
      <div className="fixed inset-0 z-[100] bg-ambient pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <header className="mb-20">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-white">Contact</h1>
          <p className="text-zinc-500 font-light text-xl uppercase tracking-widest">General inquiries & brand partnerships.</p>
        </header>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-card p-12 text-center rounded-2xl border border-white/10"
            >
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Message Sent</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest">I'll get back to you soon.</p>
            </motion.div>
          ) : (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit} 
              className="space-y-8"
            >
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-sm text-xs font-black uppercase tracking-widest">
                  Failed to send message. Please try again.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Name</label>
                  <input name="name" required className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</label>
                  <input name="email" required type="email" className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm focus:border-blue-500/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Message</label>
                <textarea name="message" required rows={6} className="w-full premium-glass border border-white/10 px-6 py-4 text-white outline-none rounded-sm resize-none focus:border-blue-500/50" />
              </div>
              <button 
                disabled={isSubmitting}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-sm disabled:opacity-50 hover:bg-zinc-200 transition-all"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
