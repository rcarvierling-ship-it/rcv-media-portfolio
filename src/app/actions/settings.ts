"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(updates: any) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Unauthorized");

  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).single();

  if (existing) {
    const { error } = await supabase.from("site_settings").update({
      ...updates,
      updated_at: new Date().toISOString()
    }).eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("site_settings").insert([updates]);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/dashboard/site");
}
