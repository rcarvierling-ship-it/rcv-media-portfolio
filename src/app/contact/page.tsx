"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, MessageSquare, Mail, User, ArrowRight, Loader2 } from "lucide-react";
import { submitInquiry } from "@/app/actions/booking";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await submitInquiry(formData);
    if (result.success) {
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-accent/10 blur-[200px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-accent/5 blur-[200px] rounded-full" />
      </div>

      <div className="max-w-[3200px] mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-32">
          
          {/* Left Side: Contact Info */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent mb-8 block border-l-4 border-brand-accent pl-6">Get in Touch</span>
              <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-white mb-12 leading-[0.8]">
                Let's <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 italic">Connect.</span>
              </h1>
              <p className="text-lg md:text-2xl text-zinc-500 font-medium leading-relaxed mb-16">
                Have a question, want to book a session, or just want to chat? We would love to hear from you.
              </p>

              <div className="space-y-12 max-w-sm">
                <div className="flex items-center gap-8 group">
                   <div className="w-14 h-14 rounded-full border border-white/10 bg-zinc-900/60 flex items-center justify-center group-hover:border-brand-accent transition-all shadow-premium">
                      <Mail className="text-zinc-400 group-hover:text-brand-accent transition-colors" size={24} />
                   </div>
                   <div>
                      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Email Address</span>
                      <span className="text-white font-black text-xl tracking-tighter">info@rcv-media.com</span>
                   </div>
                </div>
                <div className="flex items-center gap-8 group">
                   <div className="w-14 h-14 rounded-full border border-white/10 bg-zinc-900/60 flex items-center justify-center group-hover:border-brand-accent transition-all shadow-premium">
                      <MessageSquare className="text-zinc-400 group-hover:text-brand-accent transition-colors" size={24} />
                   </div>
                   <div>
                      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Instagram</span>
                      <span className="text-white font-black text-xl tracking-tighter">@rcv.media</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-zinc-900/40 backdrop-blur-md p-12 md:p-20 rounded-[3.5rem] border border-white/5 shadow-premium relative overflow-hidden"
            >
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-3xl rounded-full -mr-32 -mt-32" />
               
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit} 
                    className="space-y-10 relative z-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-6">Your Name</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-black/40 border border-white/5 rounded-full px-10 py-6 text-white placeholder-zinc-500 font-bold text-sm outline-none focus:border-brand-accent transition-all shadow-sm"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-6">Your Email</label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-black/40 border border-white/5 rounded-full px-10 py-6 text-white placeholder-zinc-500 font-bold text-sm outline-none focus:border-brand-accent transition-all shadow-sm"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-6">Subject</label>
                      <input
                        required
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-black/40 border border-white/5 rounded-full px-10 py-6 text-white placeholder-zinc-500 font-bold text-sm outline-none focus:border-brand-accent transition-all shadow-sm"
                        placeholder="What is this about?"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-6">Message</label>
                      <textarea
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-black/40 border border-white/5 rounded-[2rem] px-10 py-8 text-white placeholder-zinc-500 font-bold text-sm outline-none focus:border-brand-accent transition-all resize-none shadow-sm"
                        placeholder="Detail your requirements here..."
                      />
                    </div>

                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full py-8 bg-brand-accent text-black font-black uppercase tracking-[0.4em] text-[11px] hover:bg-brand-accent/90 transition-all rounded-full flex items-center justify-center gap-4 group disabled:opacity-50 shadow-xl shadow-brand-glow active:scale-95"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>Send Message <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" /></>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-24 text-center relative z-10"
                  >
                    <div className="w-24 h-24 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-10 shadow-brand-glow">
                       <CheckCircle2 className="text-black" size={40} />
                    </div>
                    <h2 className="text-5xl font-black uppercase tracking-tighter text-white mb-6 italic">Message Sent!</h2>
                    <p className="text-zinc-400 font-medium mb-12 max-w-sm mx-auto text-lg">
                      Thank you for reaching out! We have received your message and will get back to you shortly.
                    </p>
                    <button 
                      onClick={() => setIsSuccess(false)}
                      className="px-10 py-4 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white transition-all bg-zinc-900"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <footer className="mt-40 border-t border-white/5 py-16 bg-black/40 backdrop-blur-md">
         <div className="max-w-[3200px] mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all flex items-center gap-3">
               <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">&larr;</div>
               Back to Home
            </Link>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
               RCV.Media Photography
            </p>
         </div>
      </footer>
    </div>
  );
}
