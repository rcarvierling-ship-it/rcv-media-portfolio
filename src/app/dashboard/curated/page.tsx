import { createClient } from "@/utils/supabase/server";
import { CuratedDashboardClient } from "./client";

export default async function CuratedDashboardPage() {
  const supabase = await createClient();
  
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  return <CuratedDashboardClient initialPhotos={photos || []} />;
}
