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
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        const { data, error: emailError } = await resend.emails.send({
          from: "RCV Media <bookings@rcv-media.com>",
          to: adminEmail,
          subject: `NEW REQUEST: ${shoot_type} - ${name}`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #000000; color: #ffffff; border: 1px solid #18181b;">
              <div style="margin-bottom: 40px; text-align: center;">
                <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">RCV<span style="color: #52525b;">.</span>MEDIA</h1>
                <p style="font-size: 10px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 3px; margin-top: 10px;">New Booking Request</p>
              </div>
              
              <div style="padding: 30px; background-color: #09090b; border: 1px solid #27272a; border-radius: 4px;">
                <div style="margin-bottom: 30px;">
                  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin-bottom: 5px;">Client Information</p>
                  <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: #ffffff;">${name}</h2>
                  <p style="margin: 5px 0; font-size: 14px; color: #a1a1aa;">${email} • ${phone || "No Phone"}</p>
                </div>

                <div style="grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #18181b; padding-top: 20px;">
                  <div style="margin-bottom: 15px;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin: 0;">Shoot Type</p>
                    <p style="font-size: 14px; font-weight: 700; margin: 5px 0;">${shoot_type}</p>
                  </div>
                  <div style="margin-bottom: 15px;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin: 0;">Date / Time</p>
                    <p style="font-size: 14px; font-weight: 700; margin: 5px 0;">${event_date} @ ${event_time || "TBD"}</p>
                  </div>
                  <div style="margin-bottom: 15px;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin: 0;">Location</p>
                    <p style="font-size: 14px; font-weight: 700; margin: 5px 0;">${location || "Not Specified"}</p>
                  </div>
                </div>

                ${message ? `
                  <div style="margin-top: 20px; padding: 20px; background-color: #000000; border-left: 2px solid #3b82f6;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin-bottom: 10px;">Message</p>
                    <p style="font-size: 13px; font-style: italic; color: #d4d4d8; margin: 0; line-height: 1.6;">"${message}"</p>
                  </div>
                ` : ""}

                <div style="margin-top: 40px;">
                  <a href="${siteUrl}/dashboard/bookings" style="display: block; padding: 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; text-align: center; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; border-radius: 2px;">Review Request</a>
                </div>
              </div>
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
  } catch (error) {
    console.error("Booking submission error:", error);
    return { success: false, error: "Failed to submit booking." };
  }
}

export async function deleteBooking(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard/analytics");
    return { success: true };
  } catch (error) {
    console.error("Delete booking error:", error);
    return { success: false };
  }
}

export async function updateBookingStatus(id: string, status: string) {
  try {
    const supabase = await createClient();
    
    // 1. Get booking details first to send email
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();
      
    if (fetchError || !booking) throw fetchError || new Error("Booking not found");

    // 2. Update status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);
      
    if (updateError) throw updateError;

    // 3. Send Automated Client Email
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const isConfirmed = status === "confirmed";
      const subject = isConfirmed 
        ? `BOOKING CONFIRMED: ${booking.shoot_type} with RCV.Media`
        : `Update regarding your RCV.Media booking`;

      const headerColor = isConfirmed ? "#2563eb" : "#f43f5e";
      const accentText = isConfirmed ? "Your shoot is officially on the calendar." : "Unfortunately, I am unable to fulfill this booking request.";

      await resend.emails.send({
        from: "RCV Media <info@rcv-media.com>",
        to: booking.email,
        reply_to: "rcar.vierling@gmail.com",
        subject: subject,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #000000; color: #ffffff; border: 1px solid #18181b;">
            <div style="margin-bottom: 40px; text-align: center;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">RCV<span style="color: #52525b;">.</span>MEDIA</h1>
            </div>
            
            <div style="padding: 30px; background-color: #09090b; border: 1px solid #27272a; border-radius: 4px;">
              <h2 style="color: ${headerColor}; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; margin-bottom: 10px;">
                ${isConfirmed ? "Booking Confirmed" : "Booking Update"}
              </h2>
              <p style="font-size: 18px; font-weight: 300; line-height: 1.6; margin-bottom: 30px; color: #e4e4e7;">
                Hi ${booking.name},<br/><br/>
                ${accentText}
              </p>
              
              <div style="border-top: 1px solid #27272a; padding-top: 20px; margin-top: 20px;">
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin-bottom: 15px;">Shoot Details</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong style="color: #71717a;">Type:</strong> ${booking.shoot_type}</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong style="color: #71717a;">Date:</strong> ${booking.event_date}</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong style="color: #71717a;">Time:</strong> ${booking.event_time || "TBD"}</p>
              </div>

              ${isConfirmed ? `
                <div style="margin-top: 30px; padding: 20px; background-color: #ffffff; color: #000000; text-align: center; border-radius: 2px;">
                  <p style="margin: 0; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">See you at the shoot.</p>
                </div>
              ` : ""}
            </div>

            <div style="margin-top: 40px; text-align: center; border-top: 1px solid #18181b; pt: 20px;">
              <p style="font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 2px;">
                Questions? Reply to this email or visit <a href="https://rcv-media.com" style="color: #ffffff; text-decoration: none;">rcv-media.com</a>
              </p>
            </div>
          </div>
        `,
      });
    }

    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Update booking status error:", error);
    return { success: false };
  }
}

export async function sendMessageToClient(bookingId: string, message: string) {
  try {
    const supabase = await createClient();
    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (!booking) throw new Error("Booking not found");

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmail = "rcar.vierling@gmail.com";

      await resend.emails.send({
        from: "RCV Media <info@rcv-media.com>",
        to: booking.email,
        reply_to: adminEmail,
        subject: `Message from RCV.Media regarding your booking`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #000000; color: #ffffff; border: 1px solid #18181b;">
            <div style="margin-bottom: 40px; text-align: center;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">RCV<span style="color: #52525b;">.</span>MEDIA</h1>
            </div>
            
            <div style="padding: 30px; background-color: #09090b; border: 1px solid #27272a; border-radius: 4px;">
              <h2 style="color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; margin-bottom: 20px;">Personal Message</h2>
              <p style="font-size: 16px; font-weight: 300; line-height: 1.6; margin-bottom: 30px; color: #e4e4e7; white-space: pre-wrap;">${message}</p>
              
              <div style="border-top: 1px solid #27272a; padding-top: 20px; margin-top: 20px;">
                <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin: 0;">Reply to this email to respond directly to me.</p>
              </div>
            </div>
          </div>
        `,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Send message error:", error);
    return { success: false };
  }
}
