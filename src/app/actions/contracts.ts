"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createContractFromBooking(bookingId: string) {
  const supabase = await createClient();

  // 1. Fetch booking details
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: "Booking not found" };
  }

  // 2. Fetch deposit settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("deposit_percentage")
    .single();

  const depositPercent = settings?.deposit_percentage || 50;
  const totalAmount = Number(booking.total_amount);
  const depositAmount = (totalAmount * depositPercent) / 100;
  const finalBalanceAmount = totalAmount - depositAmount;

  // 3. Create contract
  const { data: contract, error: createError } = await supabase
    .from("contracts")
    .insert({
      booking_id: bookingId,
      title: `Contract: ${booking.name} - ${booking.shoot_type}`,
      amount: totalAmount,
      deposit_amount: depositAmount,
      final_balance_amount: finalBalanceAmount,
      status: 'draft',
      content: `
PHOTOGRAPHY SERVICE AGREEMENT

Client: ${booking.name}
Shoot Type: ${booking.shoot_type}
Date: ${new Date(booking.event_date).toLocaleDateString()}

FINANCIAL SUMMARY
Total Amount: $${totalAmount.toLocaleString()}
Required Deposit: $${depositAmount.toLocaleString()} (${depositPercent}%)
Final Balance: $${finalBalanceAmount.toLocaleString()}

TERMS AND CONDITIONS

1. SERVICES: The Photographer agrees to provide photography services as described in the selected package.
2. PAYMENT: A non-refundable deposit of $${depositAmount.toLocaleString()} is required to secure the date. The remaining balance of $${finalBalanceAmount.toLocaleString()} is due upon photo delivery.
3. COPYRIGHT: The Photographer retains the copyright to all images but grants the Client a license for personal use.
4. DELIVERY: High-resolution assets will be released in the digital gallery once the final balance is paid in full.
      `
    })
    .select()
    .single();

  if (createError) {
    return { success: false, error: createError.message };
  }

  revalidatePath("/dashboard/contracts");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/analytics");
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
  revalidatePath("/dashboard/analytics");
  return { success: true };
}

export async function deleteContract(contractId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("contracts")
    .delete()
    .eq("id", contractId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/contracts");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/analytics");
  return { success: true };
}
