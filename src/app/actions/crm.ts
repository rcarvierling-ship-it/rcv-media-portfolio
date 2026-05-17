"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBookingStage(bookingId: string, stage: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ pipeline_stage: stage })
    .eq("id", bookingId);

  if (error) {
    console.error("Pipeline stage update failed:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/bookings");
  return { success: true };
}

export async function deleteBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/bookings");
  return { success: true };
}
