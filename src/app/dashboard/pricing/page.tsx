import { createClient } from "@/utils/supabase/server";
import { PricingAdminClient } from "./client";

export default async function PricingDashboard() {
  const supabase = await createClient();
  
  const { data: packages } = await supabase
    .from("pricing_packages")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12 border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Pricing Packages</h1>
        <p className="text-zinc-400 font-light text-lg">Manage your service tiers, prices, and features shown on the booking page.</p>
      </div>

      <PricingAdminClient initialPackages={packages || []} />
    </div>
  );
}
