"use server";

import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27-ac",
});

export async function createCheckoutSession(contractId: string, type: 'deposit' | 'final') {
  try {
    const supabase = await createClient();
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*, booking:bookings(*)")
      .eq("id", contractId)
      .single();

    if (contractError || !contract) throw new Error("Contract not found");

    const amount = type === 'deposit' ? contract.deposit_amount : contract.final_balance_amount;
    
    if (!amount || amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${contract.title} - ${type === 'deposit' ? 'Deposit' : 'Final Balance'}`,
              description: `Project for ${contract.booking?.name}`,
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/contracts/${contractId}?success=true&type=${type}`,
      cancel_url: `${baseUrl}/contracts/${contractId}?canceled=true`,
      metadata: {
        contractId,
        type,
        bookingId: contract.booking_id,
      },
    });

    return { success: true, url: session.url };
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return { success: false, error: error.message };
  }
}
