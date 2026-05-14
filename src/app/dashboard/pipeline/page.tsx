import { createClient } from "@/utils/supabase/server";
import { PipelineClient } from "./client";
import { 
  Inbox, 
  CheckCircle2, 
  Camera, 
  Scissors, 
  ShieldCheck, 
  TrendingUp 
} from "lucide-react";

const STAGES = [
  { id: 'lead', label: 'Inquiry', icon: Inbox, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
  { id: 'confirmed', label: 'Booking', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'shooting', label: 'Shoot Day', icon: Camera, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'editing', label: 'In Edit', icon: Scissors, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'delivered', label: 'Delivered', icon: ShieldCheck, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
];

export default async function PipelinePage() {
  const supabase = await createClient();

  // Fetch all bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  // Group by stage
  const pipeline = STAGES.map(stage => ({
    ...stage,
    items: (bookings || []).filter(b => b.pipeline_stage === stage.id)
  }));

  // Calculate stats
  const totalRevenue = (bookings || [])
    .filter(b => b.pipeline_stage !== 'lead')
    .reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0);

  return (
    <div className="h-full flex flex-col space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Strategic Pipeline</h1>
          <p className="text-zinc-500 font-light tracking-wide uppercase text-[10px]">Agency Lead Flow & Contract Intelligence</p>
        </div>
        <div className="flex gap-8">
           <div className="text-right">
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Projected Revenue</span>
              <span className="text-2xl font-black text-brand-accent">${totalRevenue.toLocaleString()}</span>
           </div>
           <div className="text-right">
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Active Contracts</span>
              <span className="text-2xl font-black text-white">{bookings?.filter(b => b.pipeline_stage !== 'delivered').length || 0}</span>
           </div>
        </div>
      </header>

      <PipelineClient initialPipeline={pipeline} />
    </div>
  );
}
