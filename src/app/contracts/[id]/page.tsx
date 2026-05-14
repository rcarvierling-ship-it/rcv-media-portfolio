import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { 
  ShieldCheck, FileText, Download, 
  CheckCircle2, CreditCard 
} from "lucide-react";
import { ContractClientView } from "./client";

export default async function PublicContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contract } = await supabase
    .from("contracts")
    .select("*, booking:bookings(*)")
    .eq("id", id)
    .single();

  if (!contract) notFound();

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-brand-accent selection:text-white pb-32">
       {/* High-Fidelity Header */}
       <header className="pt-32 pb-20 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-accent/20 rounded-full border border-brand-accent/50">
                   <ShieldCheck size={20} className="text-brand-accent" />
                </div>
                <div className="h-px w-12 bg-zinc-800" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Secure Digital Agreement</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-6 italic">
                {contract.title}
             </h1>
             <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                <div className="flex items-center gap-2">CLIENT: <span className="text-white">{contract.booking?.name}</span></div>
                <div className="flex items-center gap-2">VALUE: <span className="text-brand-accent">${Number(contract.amount).toLocaleString()}</span></div>
                <div className="flex items-center gap-2">STATUS: <span className="text-zinc-400">{contract.status.toUpperCase()}</span></div>
             </div>
          </div>
       </header>

       <ContractClientView contract={contract} />
    </div>
  );
}
