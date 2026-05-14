import { createClient } from "@/utils/supabase/server";
import { 
  FileText, CheckCircle2, Clock, 
  Send, DollarSign, Download, Plus 
} from "lucide-react";
import Link from "next/link";
import { ContractListClient } from "./client";

export default async function ContractsPage() {
  const supabase = await createClient();

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*, booking:bookings(name, email, shoot_type)")
    .order("created_at", { ascending: false });

  const stats = {
    totalValue: (contracts || []).reduce((acc, c) => acc + (Number(c.amount) || 0), 0),
    paidValue: (contracts || []).filter(c => c.status === 'paid').reduce((acc, c) => acc + (Number(c.amount) || 0), 0),
    activeCount: (contracts || []).filter(c => c.status !== 'paid').length
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Contract Engine</h1>
          <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Financial Intelligence & Agreement Hub</p>
        </div>
        
        <div className="flex gap-8">
           <div className="text-right">
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Contracted Value</span>
              <span className="text-2xl font-black text-white">${stats.totalValue.toLocaleString()}</span>
           </div>
           <div className="text-right border-l border-white/5 pl-8">
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Total Revenue</span>
              <span className="text-2xl font-black text-brand-accent">${stats.paidValue.toLocaleString()}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
         <div className="premium-card bg-zinc-900/40 p-6 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 text-zinc-500 mb-2">
               <FileText size={14} />
               <span className="text-[9px] font-black uppercase tracking-widest">Active Agreements</span>
            </div>
            <div className="text-2xl font-black text-white">{stats.activeCount}</div>
         </div>
         {/* More summary cards could go here */}
      </div>

      <ContractListClient initialContracts={contracts || []} />
    </div>
  );
}
