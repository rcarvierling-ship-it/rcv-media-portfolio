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
    <div className="min-h-screen bg-zinc-950 pt-32 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-900/20 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Left Side: Contact Info */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-brand-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4 block text-center lg:text-left">Inquiries</span>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.9] text-center lg:text-left">
                Let's <br className="hidden lg:block"/> <span className="text-zinc-800 italic">Connect</span>
              </h1>
              <p className="text-zinc-500 font-light text-lg leading-relaxed mb-12 text-center lg:text-left">
                Have a specific question, collaboration idea, or just want to say hi? Send a message and I'll get back to you personally.
              </p>

              <div className="space-y-8 max-w-sm mx-auto lg:mx-0">
                <div className="flex items-center gap-6 group">
                   <div className="w-12 h-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center group-hover:border-brand-accent/50 transition-colors">
                      <Mail className="text-zinc-500 group-hover:text-brand-accent transition-colors" size={20} />
                   </div>
                   <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-1">Email</span>
                      <span className="text-white font-bold">info@rcv-media.com</span>
                   </div>
                </div>
                <div className="flex items-center gap-6 group">
                   <div className="w-12 h-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center group-hover:border-brand-accent/50 transition-colors">
                      <User className="text-zinc-500 group-hover:text-brand-accent transition-colors" size={20} />
                   </div>
                   <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-1">Social</span>
                      <span className="text-white font-bold">@rcv.media</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="premium-card p-8 md:p-12 rounded-sm border border-white/5 bg-zinc-900/20 backdrop-blur-xl relative"
            >
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Name</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-sm px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-sm px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Subject</label>
                      <input
                        required
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-sm px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all"
                        placeholder="What's this about?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Message</label>
                      <textarea
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-sm px-6 py-4 text-white outline-none focus:border-brand-accent/50 transition-all resize-none"
                        placeholder="Type your message here..."
                      />
                    </div>

                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>Send Message <Send size={16} className="group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-20 text-center"
                  >
                    <div className="w-20 h-20 bg-brand-accent/10 border border-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-8">
                       <CheckCircle2 className="text-brand-accent" size={40} />
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Message Sent</h2>
                    <p className="text-zinc-500 font-light mb-10 max-w-sm mx-auto">
                      Thank you for reaching out. I've received your inquiry and will get back to you shortly.
                    </p>
                    <button 
                      onClick={() => setIsSuccess(false)}
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                      Send another message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <footer className="mt-32 border-t border-white/5 py-12">
         <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
               &larr; Back to Home
            </Link>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800">
               RCV.Media Inquiries
            </p>
         </div>
      </footer>
    </div>
  );
}
