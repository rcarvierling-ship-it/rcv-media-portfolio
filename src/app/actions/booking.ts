"use server";

import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

export async function submitBooking(formData: FormData) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || "missing_key");
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const shoot_type = formData.get("shoot_type") as string;
    const package_selected = formData.get("package_selected") as string;
    const event_date = formData.get("event_date") as string;
    const event_time = formData.get("event_time") as string;
    const location = formData.get("location") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !shoot_type || !event_date) {
      return { success: false, error: "Missing required fields." };
    }

    const supabase = await createClient();

    // Insert booking into Supabase
    const { error: dbError } = await supabase
      .from("bookings")
      .insert([
        {
          name,
          email,
          phone,
          shoot_type,
          package_selected,
          event_date,
          event_time,
          location,
          message,
        },
      ]);

    if (dbError) throw dbError;

    // Send Email Notification
    try {
      if (process.env.RESEND_API_KEY) {
        const adminEmail = "rcar.vierling@gmail.com";
        console.log("Attempting to send email to:", adminEmail);

        const { data, error: emailError } = await resend.emails.send({
          from: "RCV Media <bookings@rcv-media.com>",
          to: adminEmail,
          subject: `New Booking: ${shoot_type} from ${name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090b; color: #ffffff;">
              <h1 style="text-transform: uppercase; letter-spacing: 2px; color: #2563eb;">New Booking Request</h1>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || "N/A"}</p>
              <p><strong>Shoot Type:</strong> ${shoot_type}</p>
              <p><strong>Package:</strong> ${package_selected || "N/A"}</p>
              <p><strong>Date:</strong> ${event_date}</p>
              <p><strong>Time:</strong> ${event_time || "N/A"}</p>
              <p><strong>Location:</strong> ${location || "N/A"}</p>
              <p><strong>Message:</strong></p>
              <blockquote style="border-left: 4px solid #2563eb; padding-left: 16px; margin-left: 0; color: #a1a1aa;">
                ${message || "No message provided."}
              </blockquote>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/bookings" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; text-transform: uppercase;">Manage Bookings</a>
            </div>
          `,
        });

        // 2. SMS NOTIFICATION (Verizon Gateway)
        // We use a separate call with a very short text body for SMS
        if (process.env.ADMIN_PHONE) {
          const smsEmail = `${process.env.ADMIN_PHONE.replace(/[^0-9]/g, "")}@vtext.com`;
          await resend.emails.send({
            from: "RCV Media <bookings@rcv-media.com>",
            to: smsEmail,
            subject: "NEW BOOKING",
            text: `RCV Media: New booking from ${name} for ${shoot_type} on ${event_date}. Package: ${package_selected || 'None'}. Check dashboard for details.`,
          });
        }

        if (emailError) {
          console.error("Resend Error Detail:", emailError);
        } else {
          console.log("Email sent successfully! ID:", data?.id);
        }
      } else {
        console.warn("RESEND_API_KEY is missing from environment variables.");
      }
    } catch (err) {
      console.error("Critical Email Failure:", err);
    }

    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Booking error:", error);
    return { success: false, error: error.message || "Failed to submit booking." };
  }
}
