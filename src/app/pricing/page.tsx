import { createClient } from "@/utils/supabase/server";
import { PricingClient } from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment | RCV.Media",
  description: "Transparent pricing for premium photography sessions. Choose the package that fits your narrative.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: packages } = await supabase
    .from("pricing_packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return <PricingClient packages={packages || []} />;
}
