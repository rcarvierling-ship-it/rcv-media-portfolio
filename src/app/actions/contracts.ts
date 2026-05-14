"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createContractFromBooking(bookingId: string) {
  const supabase = await createClient();

  // Fetch booking details
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: "Booking not found" };
  }

  // Create contract
  const { data: contract, error: createError } = await supabase
    .from("contracts")
    .insert({
      booking_id: bookingId,
      title: `Contract: ${booking.name} - ${booking.shoot_type}`,
      amount: booking.total_amount,
      status: 'draft',
      content: `
PHOTOGRAPHY SERVICE AGREEMENT

Client: ${booking.name}
Shoot Type: ${booking.shoot_type}
Date: ${new Date(booking.event_date).toLocaleDateString()}
Amount: $${Number(booking.total_amount).toLocaleString()}

TERMS AND CONDITIONS

1. SERVICES: The Photographer agrees to provide photography services as described in the selected package.
2. PAYMENT: A deposit is required to secure the date. The remaining balance is due on or before the day of the shoot.
3. COPYRIGHT: The Photographer retains the copyright to all images but grants the Client a license for personal use.
4. DELIVERY: Edits will be delivered within the timeframe specified in the package.
      `
    })
    .select()
    .single();

  if (createError) {
    return { success: false, error: createError.message };
  }

  revalidatePath("/dashboard/contracts");
  revalidatePath("/dashboard/pipeline");
  return { success: true, contractId: contract.id };
}

export async function updateContractStatus(contractId: string, status: string) {
  const supabase = await createClient();
  const updateData: any = { status };
  
  if (status === 'signed') updateData.signed_at = new Date().toISOString();
  if (status === 'paid') updateData.paid_at = new Date().toISOString();

  const { error } = await supabase
    .from("contracts")
    .update(updateData)
    .eq("id", contractId);

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/dashboard/contracts");
  return { success: true };
}
