"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { verifyVaultPasscode } from "@/app/actions/vault";

export default function VaultEntryPage() {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length < 4) return;

    setLoading(true);
    setError(null);

    try {
      const result = await verifyVaultPasscode(passcode);
      if (result.success && result.slug) {
        // We'll use a local session/cookie via the server action
        router.push(`/vault/${result.slug}`);
      } else {
        setError("Invalid Access Credentials");
        setPasscode("");
      }
    } catch (err) {
      setError("Security Handshake Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 relative group"
          >
             <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all" />
             <Lock className="text-white relative z-10" size={24} />
          </motion.div>
          
          <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-white mb-4 italic">The Vault</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Secure Client Access Gateway</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="password"
              placeholder="ENTER PASSCODE"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.toUpperCase())}
              disabled={loading}
              className={`w-full bg-zinc-900/40 border ${error ? 'border-red-500/50' : 'border-white/5'} px-8 py-6 text-center text-xl font-black tracking-[1em] text-white outline-none focus:border-white/20 transition-all backdrop-blur-sm rounded-sm placeholder:text-zinc-800 placeholder:tracking-[0.2em] placeholder:text-xs`}
              autoFocus
            />
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest"
                >
                  <AlertTriangle size={12} /> {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading || passcode.length < 4}
            className="w-full group relative overflow-hidden bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-sm disabled:opacity-50 transition-all hover:bg-zinc-200"
          >
            <div className="flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Decrypting...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Initiate Handshake</span>
                </>
              )}
            </div>
          </motion.button>
        </form>

        <div className="mt-16 flex flex-col items-center gap-4">
           <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-700">Protected by RCV.Media Security Protocol</p>
        </div>
      </motion.div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}
