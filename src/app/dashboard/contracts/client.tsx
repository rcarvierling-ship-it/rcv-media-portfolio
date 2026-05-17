"use client";

import { useState } from "react";
import { 
  FileText, Send, CheckCircle2, 
  ExternalLink, Trash2, DollarSign,
  Clock, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { updateContractStatus, deleteContract } from "@/app/actions/contracts";

export function ContractListClient({ initialContracts }: { initialContracts: any[] }) {
  const [contracts, setContracts] = useState(initialContracts);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-brand-accent bg-brand-accent/10 border-brand-accent/20';
      case 'signed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'sent': return 'text-brand-accent bg-brand-accent/10 border-brand-accent/20';
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
           {contracts.length === 0 ? (
             <div className="text-center py-28 bg-card border border-dashed border-white/5 rounded-[2.5rem] p-12 space-y-6 max-w-4xl mx-auto shadow-premium">
                <FileText className="mx-auto text-brand-accent animate-pulse" size={56} />
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 italic">No Agreements Drafted</h3>
                   <p className="text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto">
                      Your legal database is empty. Professional contract sheets and formal billing quotes will populate this directory once generated from active client bookings.
                   </p>
                </div>
                <div className="pt-4 space-y-4">
                   <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                      Tactical action: Initialize a contract from your active pipeline card
                   </p>
                   <Link 
                     href="/dashboard/bookings"
                     className="px-10 py-5 bg-brand-accent text-black font-black uppercase text-[10px] tracking-widest rounded-full hover:brightness-110 transition-all shadow-brand-glow inline-flex items-center gap-2"
                   >
                     <ShieldCheck size={14} /> Go to Bookings Pipeline
                   </Link>
                </div>
             </div>
           ) : (
             <AnimatePresence mode="popLayout">
                {contracts.map((contract) => (
                  <motion.div
                    key={contract.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card bg-card border border-white/5 p-6 rounded-xl group hover:border-brand-accent/30 transition-all shadow-premium"
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
                           
                           <div className="flex items-center gap-8">
                              <div className="flex items-center gap-2">
                                 <DollarSign size={14} className="text-zinc-600" />
                                 <span className="text-[10px] font-black text-white">${contract.booking?.total_amount}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Clock size={14} className="text-zinc-600" />
                                 <span className="text-[10px] font-black text-zinc-400">Created {new Date(contract.created_at).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <a 
                             href={contract.contract_pdf_url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="px-6 py-3 bg-secondary border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white rounded-full flex items-center gap-2 transition-all"
                           >
                              <ExternalLink size={14} /> View File
                           </a>
                           <button 
                             onClick={async () => {
                               if (confirm('Irreversibly purge this contract from the archive?')) {
                                 const res = await deleteContract(contract.id);
                                 if (res.success) setContracts(contracts.filter(c => c.id !== contract.id));
                               }
                             }}
                             className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-zinc-600 hover:bg-red-500/10 hover:text-red-500 transition-all"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </div>
                  </motion.div>
                ))}
             </AnimatePresence>
           )}
        </div>
    </div>
  );
}
