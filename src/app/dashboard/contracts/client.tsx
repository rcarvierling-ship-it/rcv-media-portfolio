"use client";

import { useState } from "react";
import { 
  FileText, Send, CheckCircle2, 
  ExternalLink, Trash2, DollarSign,
  Clock, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { updateContractStatus } from "@/app/actions/contracts";

export function ContractListClient({ initialContracts }: { initialContracts: any[] }) {
  const [contracts, setContracts] = useState(initialContracts);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-brand-accent bg-brand-accent/10 border-brand-accent/20';
      case 'signed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'sent': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Agreement Inventory</span>
          <div className="flex gap-4">
             {/* Add filters here if needed */}
          </div>
       </div>

       <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
             {contracts.map((contract) => (
               <motion.div
                 key={contract.id}
                 layout
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="premium-card bg-zinc-950 border border-white/5 p-6 rounded-xl group hover:border-white/10 transition-all"
               >
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-lg font-black uppercase tracking-tight text-white">{contract.booking?.name}</h3>
                           <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${getStatusColor(contract.status)}`}>
                              {contract.status}
                           </span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">{contract.booking?.shoot_type}</p>
                        
                        <div className="flex flex-wrap gap-8">
                           <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Contract Value</span>
                              <span className="text-xs font-black text-white">${Number(contract.amount).toLocaleString()}</span>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Agreement ID</span>
                              <span className="text-xs font-mono text-zinc-500">{contract.id.slice(0, 8).toUpperCase()}</span>
                           </div>
                           {contract.signed_at && (
                             <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-900">Signed On</span>
                                <span className="text-xs font-black text-emerald-500">{new Date(contract.signed_at).toLocaleDateString()}</span>
                             </div>
                           )}
                        </div>
                     </div>

                     <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-end">
                        <Link 
                          href={`/contracts/${contract.id}`}
                          target="_blank"
                          className="w-full md:w-auto px-6 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
                        >
                           <ExternalLink size={14} /> View Client Link
                        </Link>
                        
                        {contract.status === 'draft' && (
                          <button 
                            onClick={async () => {
                               const res = await updateContractStatus(contract.id, 'sent');
                               if (res.success) setContracts(prev => prev.map(c => c.id === contract.id ? {...c, status: 'sent'} : c));
                            }}
                            className="w-full md:w-auto px-6 py-3 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                          >
                             <Send size={14} /> Send to Client
                          </button>
                        )}

                        {contract.status === 'sent' && (
                           <div className="px-6 py-3 border border-white/5 text-zinc-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                              <Clock size={14} /> Awaiting Signature
                           </div>
                        )}

                        {contract.status === 'signed' && (
                          <button 
                            onClick={async () => {
                               const res = await updateContractStatus(contract.id, 'paid');
                               if (res.success) setContracts(prev => prev.map(c => c.id === contract.id ? {...c, status: 'paid'} : c));
                            }}
                            className="w-full md:w-auto px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                          >
                             <DollarSign size={14} /> Mark as Paid
                          </button>
                        )}
                        
                        {contract.status === 'paid' && (
                           <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                              <ShieldCheck size={14} /> Transaction Complete
                           </div>
                        )}
                     </div>
                  </div>
               </motion.div>
             ))}
          </AnimatePresence>

          {contracts.length === 0 && (
            <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center">
               <FileText size={48} className="text-zinc-800 mb-6" />
               <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">No active agreements found.</p>
            </div>
          )}
       </div>
    </div>
  );
}
