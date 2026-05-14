import { createClient } from "@/utils/supabase/server";
import PipelineBoard from "@/components/dashboard/PipelineBoard";

export default async function PipelinePage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 lg:p-12 space-y-12 min-h-screen bg-zinc-950">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">Pipeline</h1>
          <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] mt-4">Agency Client Lifecycle</p>
        </div>
        
        <div className="flex gap-4">
           <div className="px-6 py-4 bg-zinc-900 border border-white/5 rounded-sm">
              <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Pipeline Value</span>
              <span className="text-2xl font-black text-white">
                ${bookings?.reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0).toLocaleString()}
              </span>
           </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-12">
        <PipelineBoard initialBookings={bookings || []} />
      </div>
    </div>
  );
}
