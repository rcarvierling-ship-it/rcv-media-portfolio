import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = 'force-dynamic';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
  });
};

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  const stripe = getStripe();
  if (!stripe) {
    console.error("Stripe key missing");
    return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
  }

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret!);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { contractId, type, bookingId } = session.metadata || {};

    if (contractId && type) {
      const supabase = await createClient();
      
      const updateData: any = {};
      if (type === 'deposit') {
        updateData.is_deposit_paid = true;
        updateData.status = 'signed';
        updateData.signed_at = new Date().toISOString();
      } else if (type === 'final') {
        updateData.is_final_paid = true;
        updateData.status = 'paid';
        updateData.paid_at = new Date().toISOString();
        
        // Also update the booking status to fully complete if desired
        await supabase.from("bookings").update({ status: 'completed' }).eq("id", bookingId);
      }

      const { error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", contractId);

      if (error) {
        console.error("Supabase update error in webhook:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
