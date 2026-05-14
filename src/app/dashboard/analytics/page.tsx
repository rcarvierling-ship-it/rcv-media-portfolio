import { createClient } from "@/utils/supabase/server";
import { 
  DollarSign, TrendingUp, Users, 
  ArrowUpRight, ArrowDownRight, Briefcase,
  Target, Zap, PieChart
} from "lucide-react";
import { OptimizeWorkflowButton } from "./optimize-button";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // 1. Fetch Revenue (Paid Contracts)
  const { data: paidContracts } = await supabase
    .from("contracts")
    .select("amount")
    .eq("status", "paid");

  const totalRevenue = paidContracts?.reduce((acc, c) => acc + (Number(c.amount) || 0), 0) || 0;

  // 2. Fetch Pipeline Value (Sent or Signed)
  const { data: pipelineContracts } = await supabase
    .from("contracts")
    .select("amount")
    .in("status", ["sent", "signed"]);

  const pipelineValue = pipelineContracts?.reduce((acc, c) => acc + (Number(c.amount) || 0), 0) || 0;

  // 3. Fetch Conversion Stats
  const { count: totalLeads } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });

  const { count: signedContracts } = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .in("status", ["signed", "paid"]);

  const conversionRate = totalLeads ? ((signedContracts || 0) / totalLeads * 100).toFixed(1) : "0";

  return (
    <div className="space-y-16 pb-32">
       <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div>
            <span className="text-brand-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Performance.Intelligence</span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white leading-none">Business <br/> <span className="text-zinc-800">Analytics.</span></h1>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-sm">
                <span className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Fiscal Year</span>
                <span className="text-sm font-black text-white">2024</span>
             </div>
             <div className="px-6 py-3 bg-brand-accent text-white rounded-sm">
                <span className="block text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Status</span>
                <span className="text-sm font-black uppercase">Growth Phase</span>
             </div>
          </div>
       </header>

       {/* MAIN KPI GRID */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="premium-card bg-zinc-900/20 p-10 border border-white/5 rounded-sm group hover:border-brand-accent/20 transition-all">
             <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><DollarSign size={24} /></div>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full"><ArrowUpRight size={12} /> +24%</span>
             </div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Total Revenue</span>
             <h2 className="text-4xl font-black text-white tracking-tighter">${totalRevenue.toLocaleString()}</h2>
             <p className="mt-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Gross Profit (Realized)</p>
          </div>

          <div className="premium-card bg-zinc-900/20 p-10 border border-white/5 rounded-sm group hover:border-brand-accent/20 transition-all">
             <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center"><Briefcase size={24} /></div>
                <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">Stable</span>
             </div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Pipeline Value</span>
             <h2 className="text-4xl font-black text-white tracking-tighter">${pipelineValue.toLocaleString()}</h2>
             <p className="mt-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Projected (Sent/Signed)</p>
          </div>

          <div className="premium-card bg-zinc-900/20 p-10 border border-white/5 rounded-sm group hover:border-brand-accent/20 transition-all">
             <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center"><Target size={24} /></div>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full"><ArrowUpRight size={12} /> +8%</span>
             </div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Conversion Rate</span>
             <h2 className="text-4xl font-black text-white tracking-tighter">{conversionRate}%</h2>
             <p className="mt-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Lead-to-Contract Sync</p>
          </div>

          <div className="premium-card bg-zinc-900/20 p-10 border border-white/5 rounded-sm group hover:border-brand-accent/20 transition-all">
             <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center"><Users size={24} /></div>
                <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">Active</span>
             </div>
             <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Total Leads</span>
             <h2 className="text-4xl font-black text-white tracking-tighter">{totalLeads || 0}</h2>
             <p className="mt-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">All-Time Intake</p>
          </div>
       </div>

       {/* SECONDARY INSIGHTS */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">Revenue Momentum</h3>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-sm text-[9px] font-black text-zinc-400 uppercase tracking-widest border border-white/5">Weekly</div>
                   <div className="flex items-center gap-2 px-3 py-1 bg-white text-black rounded-sm text-[9px] font-black uppercase tracking-widest">Monthly</div>
                </div>
             </div>
             
             {/* Mock Chart Area */}
             <div className="h-[400px] w-full bg-zinc-950 border border-white/5 rounded-sm p-12 flex items-end gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />
                {[40, 70, 45, 90, 65, 80, 50, 95, 75, 85, 60, 100].map((height, i) => (
                  <div key={i} className="flex-1 group relative">
                    <div 
                      className="w-full bg-zinc-800 group-hover:bg-brand-accent transition-all duration-500 rounded-t-sm" 
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-zinc-700 uppercase">M{i+1}</div>
                  </div>
                ))}
             </div>
          </div>

          <div className="space-y-8">
             <h3 className="text-xl font-black uppercase tracking-tighter text-white">Fulfillment Health</h3>
             <div className="space-y-6">
                <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-sm space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Active Shoots</span>
                      <span className="text-xl font-black text-white">12</span>
                   </div>
                   <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="w-[70%] h-full bg-blue-500" />
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Editing Queue</span>
                      <span className="text-xl font-black text-white">4</span>
                   </div>
                   <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="w-[30%] h-full bg-purple-500" />
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Delivered</span>
                      <span className="text-xl font-black text-white">84</span>
                   </div>
                   <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="w-[95%] h-full bg-brand-accent" />
                   </div>
                </div>

                <div className="premium-card bg-brand-accent p-10 rounded-sm text-white">
                   <Zap size={32} className="mb-6" />
                   <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">Elite Status</h4>
                   <p className="text-[11px] font-medium leading-relaxed opacity-80 mb-8 italic">"Your performance metrics are in the top 5% of regional media agencies. Keep pushing the narrative."</p>
                   <OptimizeWorkflowButton />
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
