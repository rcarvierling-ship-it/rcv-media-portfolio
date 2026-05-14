"use client";

import { useState } from "react";
import { 
  FileText, CheckCircle2, Download, 
  ShieldCheck, PenTool,
  ArrowRight, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateContractStatus } from "@/app/actions/contracts";

export function ContractClientView({ contract }: { contract: any }) {
  const [signing, setSigning] = useState(false);
  const [status, setStatus] = useState(contract.status);

  const handleSign = async () => {
    setSigning(true);
    const res = await updateContractStatus(contract.id, 'signed');
    if (res.success) {
      setStatus('signed');
    }
    setSigning(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 mt-16">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Content Area */}
          <div className="lg:col-span-2 space-y-12">
             <div className="premium-card bg-zinc-900/20 border border-white/5 p-12 rounded-2xl min-h-[600px] shadow-2xl relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <ShieldCheck size={120} />
                </div>
                
                <div className="prose prose-invert max-w-none">
                   <div className="whitespace-pre-line text-zinc-400 font-light text-lg leading-loose">
                      {contract.content}
                   </div>
                </div>

                {status === 'signed' || status === 'paid' ? (
                  <div className="mt-20 pt-12 border-t border-white/5">
                     <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Digital Signature Verified</span>
                           <div className="font-serif text-3xl text-white italic">{contract.booking?.name}</div>
                        </div>
                        <div className="h-12 w-px bg-zinc-800" />
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Signature Timestamp</span>
                           <span className="text-xs font-mono text-emerald-500">{new Date(contract.signed_at || new Date()).toLocaleDateString()}</span>
                        </div>
                     </div>
                  </div>
                ) : null}
             </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-8 sticky top-32 h-fit">
             <div className="premium-card bg-zinc-900 border border-white/5 p-8 rounded-xl space-y-8 shadow-2xl">
                <div className="space-y-2">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Contract Total</h3>
                   <div className="text-4xl font-black text-white italic">${Number(contract.amount).toLocaleString()}</div>
                </div>

                <div className="h-px w-full bg-white/5" />

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Required Actions</h4>
                   
                   {/* Step 1: Sign */}
                   <div className={`p-6 rounded-lg border transition-all ${status === 'signed' || status === 'paid' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-black/40'}`}>
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                            <PenTool size={12} className={status === 'signed' || status === 'paid' ? 'text-emerald-500' : 'text-zinc-500'} />
                            01. Digital Signature
                         </span>
                         {(status === 'signed' || status === 'paid') && <CheckCircle2 size={16} className="text-emerald-500" />}
                      </div>
                      
                      {status === 'draft' || status === 'sent' ? (
                        <button 
                          onClick={handleSign}
                          disabled={signing}
                          className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                           {signing ? <Loader2 size={14} className="animate-spin" /> : <>Sign Agreement <ArrowRight size={14} /></>}
                        </button>
                      ) : (
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Document Signed</p>
                      )}
                   </div>
                </div>

                <div className="pt-4">
                   <button className="w-full py-4 border border-white/5 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                      <Download size={12} /> Download PDF Version
                   </button>
                </div>
             </div>

             <div className="px-8 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-700">
                   <ShieldCheck size={12} /> Encrypted Transmission
                </div>
                <p className="text-[8px] text-zinc-800 uppercase tracking-widest leading-loose">
                   This document is legally binding under the Electronic Signatures in Global and National Commerce Act (ESIGN).
                </p>
             </div>
          </div>
       </div>
    </div>
  );
}
