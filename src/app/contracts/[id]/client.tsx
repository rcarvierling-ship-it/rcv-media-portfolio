"use client";

import { useState } from "react";
import { 
  FileText, CheckCircle2, Download, 
  CreditCard, ShieldCheck, PenTool,
  ArrowRight, Loader2, DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createCheckoutSession } from "@/app/actions/stripe";

export function ContractClientView({ contract }: { contract: any }) {
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(contract.status);

  const handlePayment = async (type: 'deposit' | 'final') => {
    setProcessing(true);
    const res = await createCheckoutSession(contract.id, type);
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      alert("Payment engine encountered a tactical delay: " + (res.error || "Unknown Error"));
      setProcessing(false);
    }
  };

  const isDepositPaid = contract.is_deposit_paid || status === 'signed' || status === 'paid';
  const isFinalPaid = contract.is_final_paid || status === 'paid';

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

                {isDepositPaid ? (
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
                <div className="space-y-6">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Financial Breakdown</h3>
                   
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total Amount</span>
                         <span className="text-xl font-black text-white italic">${Number(contract.amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Initial Deposit</span>
                         <span className="text-sm font-black text-brand-accent">${Number(contract.deposit_amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Final Balance</span>
                         <span className="text-sm font-black text-zinc-400">${Number(contract.final_balance_amount).toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                <div className="h-px w-full bg-white/5" />

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Required Actions</h4>
                   
                   {/* Step 1: Sign & Deposit */}
                   <div className={`p-6 rounded-lg border transition-all ${isDepositPaid ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-black/40'}`}>
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                            <PenTool size={12} className={isDepositPaid ? 'text-emerald-500' : 'text-zinc-500'} />
                            01. Sign & Deposit
                         </span>
                         {isDepositPaid && <CheckCircle2 size={16} className="text-emerald-500" />}
                      </div>
                      
                      {!isDepositPaid ? (
                        <button 
                          onClick={() => handlePayment('deposit')}
                          disabled={processing}
                          className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                           {processing ? <Loader2 size={14} className="animate-spin" /> : <>Sign & Pay Deposit <ArrowRight size={14} /></>}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-500">
                           <CheckCircle2 size={12} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Deposit Received</span>
                        </div>
                      )}
                   </div>

                   {/* Step 2: Final Balance */}
                   <div className={`p-6 rounded-lg border transition-all ${isFinalPaid ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-black/40'} ${!isDepositPaid ? 'opacity-30 pointer-events-none' : ''}`}>
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                            <CreditCard size={12} className={isFinalPaid ? 'text-emerald-500' : 'text-zinc-500'} />
                            02. Final Payment
                         </span>
                         {isFinalPaid && <CheckCircle2 size={16} className="text-emerald-500" />}
                      </div>
                      
                      {isDepositPaid && !isFinalPaid ? (
                        <button 
                          onClick={() => handlePayment('final')}
                          disabled={processing}
                          className="w-full py-4 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                        >
                           {processing ? <Loader2 size={14} className="animate-spin" /> : <>Pay Final Balance <ArrowRight size={14} /></>}
                        </button>
                      ) : isFinalPaid ? (
                        <div className="flex items-center gap-2 text-emerald-500">
                           <CheckCircle2 size={12} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Payment Complete</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">Awaiting Signature</p>
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
