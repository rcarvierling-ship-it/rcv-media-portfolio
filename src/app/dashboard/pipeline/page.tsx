import { createClient } from "@/utils/supabase/server";
import { PipelineClient } from "./client";

const STAGES = [
  { id: 'lead', label: 'Inquiry', color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
  { id: 'confirmed', label: 'Booking', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'shooting', label: 'Shoot Day', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'editing', label: 'In Edit', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'delivered', label: 'Delivered', color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
];

export default async function PipelinePage() {
  const supabase = await createClient();

  // 1. Fetch All Bookings (Pipeline)
  const { data: allBookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  // Filter out cancelled bookings from the pipeline
  const activeBookings = (allBookings || []).filter(b => b.status !== 'cancelled');
  const archivedBookings = (allBookings || []).filter(b => b.status === 'cancelled');

  // Group by stage
  const pipeline = STAGES.map(stage => ({
    ...stage,
    items: activeBookings.filter(b => b.pipeline_stage === stage.id)
  }));

  // 2. Fetch Inquiries (Inbox)
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  // 3. Fetch Operational Data (Settings)
  const { data: packages } = await supabase
    .from("pricing_packages")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  const { data: blockedDates } = await supabase
    .from("blocked_dates")
    .select("*")
    .order("date", { ascending: true });

  // 4. Fetch Albums (for linking)
  const { data: albums } = await supabase
    .from("albums")
    .select("*")
    .order("created_at", { ascending: false });

  const totalRevenue = activeBookings
    .filter(b => b.pipeline_stage !== 'lead')
    .reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0);

  const { data: marketingVault } = await supabase
    .from("marketing_vault")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: inspirationBoard } = await supabase
    .from("inspiration_board")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="h-full flex flex-col space-y-8 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2 italic">Strategic Pipeline</h1>
          <p className="text-zinc-500 font-light tracking-[0.4em] uppercase text-[10px]">Agency Lead Flow & Contract Intelligence</p>
        </div>
        <div className="flex gap-8">
           <div className="text-right">
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Projected Revenue</span>
              <span className="text-2xl font-black text-brand-accent">${totalRevenue.toLocaleString()}</span>
           </div>
           <div className="text-right">
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Active Projects</span>
              <span className="text-2xl font-black text-white">{activeBookings.filter(b => b.pipeline_stage !== 'delivered').length}</span>
           </div>
        </div>
      </header>

      <PipelineClient 
        initialPipeline={pipeline} 
        inquiries={inquiries || []}
        archivedBookings={archivedBookings || []}
        packages={packages || []}
        siteSettings={siteSettings}
        blockedDates={blockedDates || []}
        albums={albums || []}
        marketingVault={marketingVault || []}
        inspirationBoard={inspirationBoard || []}
        campaigns={campaigns || []}
      />
    </div>
  );
}
