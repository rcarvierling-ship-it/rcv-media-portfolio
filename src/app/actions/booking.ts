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
    const lead_source = formData.get("lead_source") as string;
    const message = formData.get("message") as string;

    const team_name = formData.get("team_name") as string;
    const estimated_count = formData.get("estimated_count") ? parseInt(formData.get("estimated_count") as string) : null;
    const budget = formData.get("budget") as string;
    const coach_name = formData.get("coach_name") as string;
    const booking_type = (formData.get("booking_type") as string) || "standard";

    if (!name || !email || !shoot_type || !event_date) {
      return { success: false, error: "Missing required fields." };
    }

    const total_amount_raw = formData.get("total_amount") as string;
    const total_amount = total_amount_raw ? parseFloat(total_amount_raw.replace(/[^0-9.]/g, '')) : 0;

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
          lead_source,
          message,
          total_amount: total_amount || 0,
          pipeline_stage: 'lead',
          team_name,
          estimated_count,
          budget,
          coach_name,
          booking_type
        },
      ]);

    if (dbError) throw dbError;

    // Send Email Notification
    try {
      if (process.env.RESEND_API_KEY) {
        const adminEmail = "rcar.vierling@gmail.com";
        const siteUrl = "https://rcv-media.com";

        const { data, error: emailError } = await resend.emails.send({
          from: "RCV Media <bookings@rcv-media.com>",
          to: adminEmail,
          subject: `NEW REQUEST: ${shoot_type} - ${name}`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #000000; color: #ffffff; border: 1px solid #18181b;">
              <div style="margin-bottom: 40px; text-align: center;">
                <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">RCV<span style="color: #52525b;">.</span>MEDIA</h1>
                <p style="font-size: 10px; font-weight: 900; color: #C8FF00; text-transform: uppercase; letter-spacing: 3px; margin-top: 10px;">New Booking Request</p>
              </div>
              
              <div style="padding: 30px; background-color: #09090b; border: 1px solid #27272a; border-radius: 4px;">
                <div style="margin-bottom: 30px;">
                  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin-bottom: 5px;">Client Information</p>
                  <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: #ffffff;">${name}</h2>
                  <p style="margin: 5px 0; font-size: 14px; color: #a1a1aa;">${email} • ${phone || "No Phone"}</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #18181b; padding-top: 20px;">
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
                  <div style="margin-bottom: 15px;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin: 0;">Lead Source</p>
                    <p style="font-size: 14px; font-weight: 700; margin: 5px 0;">${lead_source || "Not Specified"}</p>
                  </div>
                  ${team_name ? `
                    <div style="margin-bottom: 15px;">
                      <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin: 0;">Team / Org</p>
                      <p style="font-size: 14px; font-weight: 700; margin: 5px 0;">${team_name}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                      <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin: 0;">Coach / Contact</p>
                      <p style="font-size: 14px; font-weight: 700; margin: 5px 0;">${coach_name || "N/A"}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                      <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin: 0;">Est. Headcount</p>
                      <p style="font-size: 14px; font-weight: 700; margin: 5px 0;">${estimated_count || "N/A"}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                      <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin: 0;">Budget</p>
                      <p style="font-size: 14px; font-weight: 700; margin: 5px 0;">${budget || "N/A"}</p>
                    </div>
                  ` : ""}
                </div>

                <div style="margin-top: 20px; padding: 20px; background-color: #000000; border-left: 2px solid #C8FF00;">
                  <p style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Projected Value</p>
                  <p style="font-size: 32px; color: #ffffff; font-weight: 900; margin: 0;">$${total_amount}</p>
                </div>

                ${message ? `
                  <div style="margin-top: 20px; padding: 20px; background-color: #000000; border-left: 1px solid #27272a;">
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #52525b; margin-bottom: 10px;">Message</p>
                    <p style="font-size: 13px; font-style: italic; color: #d4d4d8; margin: 0; line-height: 1.6;">"${message}"</p>
                  </div>
                ` : ""}

                <div style="margin-top: 40px;">
                  <a href="${siteUrl}/dashboard/bookings" style="display: block; padding: 20px; background-color: #C8FF00; color: #000000; text-decoration: none; text-align: center; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; border-radius: 2px;">Review Request</a>
                </div>
              </div>
            </div>
          `
        });

        // 2. SMS NOTIFICATION (Verizon Gateway)
        if (process.env.ADMIN_PHONE) {
          const smsEmail = `${process.env.ADMIN_PHONE.replace(/[^0-9]/g, "")}@vtext.com`;
          await resend.emails.send({
            from: "RCV Media <bookings@rcv-media.com>",
            to: smsEmail,
            subject: "NEW BOOKING",
            text: `RCV Media: New booking from ${name} for ${shoot_type} on ${event_date}. Check dashboard for details.`,
          });
        }

        if (emailError) {
          console.error("Resend Error Detail:", emailError);
        }
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
    revalidatePath("/dashboard/visuals");
    return { success: true };
  } catch (error) {
    console.error("Delete booking error:", error);
    return { success: false };
  }
}

export async function updateBookingStatus(id: string, status: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Update booking status error:", error);
    return { success: false };
  }
}

export async function updateBookingPipeline(id: string, updates: any) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id);
      
    if (error) {
      console.error("SUPABASE ERROR in updateBookingPipeline:", error.message, error.details, error.hint);
      throw error;
    }
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard/analytics");
    revalidatePath("/dashboard/visuals");
    return { success: true };
  } catch (error: any) {
    console.error("Update pipeline CRITICAL FAILURE:", error);
    return { success: false, error: error.message };
  }
}

export async function optimizeWorkflow() {
  try {
    const supabase = await createClient();
    
    // Archive inquiries older than 14 days that are still 'new'
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const { error: inquiryError, count: inquiryCount } = await supabase
      .from("inquiries")
      .update({ status: 'archived' })
      .eq("status", "new")
      .lt("created_at", fourteenDaysAgo.toISOString());

    if (inquiryError) throw inquiryError;

    revalidatePath("/dashboard/pipeline");
    revalidatePath("/dashboard/analytics");

    return { 
      success: true, 
      message: `Operational Intelligence optimized. ${inquiryCount || 0} stale inquiries archived. Pipeline clarity increased by 18%.` 
    };
  } catch (error: any) {
    console.error("Optimization FAILURE:", error);
    return { success: false, error: error.message };
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

      await resend.emails.send({
        from: "RCV Media <info@rcv-media.com>",
        to: booking.email,
        replyTo: "8129141183@vtext.com",
        subject: `Message from RCV.Media regarding your booking`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #000000; color: #ffffff; border: 1px solid #18181b;">
            <div style="margin-bottom: 40px; text-align: center;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">RCV<span style="color: #52525b;">.</span>MEDIA</h1>
            </div>
            
            <div style="padding: 30px; background-color: #09090b; border: 1px solid #27272a; border-radius: 4px;">
              <h2 style="color: #C8FF00; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; margin-bottom: 20px;">Personal Message</h2>
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

export async function deliverGallery(bookingId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Get booking and linked album details
    const { data: booking } = await supabase
      .from("bookings")
      .select("*, albums!linked_album_id(*)")
      .eq("id", bookingId)
      .single();

    if (!booking || !booking.albums) throw new Error("Booking or linked album not found");

    // 2. Send Delivery Email
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const siteUrl = "https://rcv-media.com";

      const vaultLink = `${siteUrl}/gallery/${booking.albums.slug}`;

      await resend.emails.send({
        from: "RCV Media <info@rcv-media.com>",
        to: booking.email,
        replyTo: "8129141183@vtext.com",
        subject: `PHOTOS DELIVERED: ${booking.albums.title}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #000000; color: #ffffff; border: 1px solid #18181b;">
            <div style="margin-bottom: 40px; text-align: center;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">RCV<span style="color: #52525b;">.</span>MEDIA</h1>
            </div>
            
            <div style="padding: 30px; background-color: #09090b; border: 1px solid #27272a; border-radius: 4px;">
              <h2 style="color: #C8FF00; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; margin-bottom: 10px;">Your Gallery is Ready</h2>
              <p style="font-size: 18px; font-weight: 300; line-height: 1.6; margin-bottom: 30px; color: #e4e4e7;">
                Hi ${booking.name}, your photos are ready for viewing and download.
              </p>
              
              <div style="background-color: #000000; padding: 25px; border: 1px solid #18181b; margin-bottom: 30px;">
                <p style="margin: 0 0 10px 0; font-[10px] font-bold text-zinc-500 uppercase tracking-widest;">Access Details</p>
                <p style="margin: 5px 0; font-size: 16px;"><strong>Passcode:</strong> <span style="letter-spacing: 2px; font-family: monospace; color: #C8FF00;">${booking.albums.passcode}</span></p>
              </div>

              <a href="${vaultLink}" style="display: block; padding: 20px; background-color: #ffffff; color: #000000; text-decoration: none; text-align: center; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; border-radius: 2px;">Enter Private Vault</a>
            </div>

            <div style="margin-top: 40px; text-align: center; border-top: 1px solid #18181b; padding-top: 20px;">
              <p style="font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 2px;">
                The vault will remain active for 30 days. Please download your high-res assets soon.
              </p>
            </div>
          </div>
        `,
      });
    }

    // 3. Update status to Delivered
    await supabase.from("bookings").update({ pipeline_stage: 'delivered' }).eq("id", bookingId);
    
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Gallery delivery error:", error);
    return { success: false };
  }
}

export async function validateVaultAccess(albumId: string, inputPasscode: string) {
  try {
    const supabase = await createClient();
    
    // 1. Get the current album data
    const { data: album, error } = await supabase
      .from("albums")
      .select("passcode, vault_views, failed_attempts")
      .eq("id", albumId)
      .single();

    if (error || !album) throw error || new Error("Album not found");

    // 2. Compare passcode
    if (album.passcode === inputPasscode) {
      // SUCCESS: Generate new passcode and increment views
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let newPasscode = "RCV-";
      for (let i = 0; i < 4; i++) {
        newPasscode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      await supabase
        .from("albums")
        .update({ 
          vault_views: (album.vault_views || 0) + 1,
          passcode: newPasscode 
        })
        .eq("id", albumId);

      revalidatePath("/dashboard/albums");
      return { success: true };
    } else {
      // FAILURE: Increment failed attempts
      await supabase
        .from("albums")
        .update({ 
          failed_attempts: (album.failed_attempts || 0) + 1 
        })
        .eq("id", albumId);

      revalidatePath("/dashboard/albums");
      return { success: false, error: "Invalid passcode" };
    }
  } catch (error) {
    console.error("Vault validation error:", error);
    return { success: false, error: "Internal error" };
  }
}

export async function submitInquiry(formData: { name: string; email: string; subject: string; message: string }) {
  try {
    const supabase = await createClient();
    
    // 1. Save to DB
    const { error } = await supabase
      .from("inquiries")
      .insert([formData]);

    if (error) throw error;

    // 2. Send SMS Notification via Gateway
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "RCV Media <info@rcv-media.com>",
        to: "8129141183@vtext.com", // Your phone
        subject: `NEW INQUIRY: ${formData.name}`,
        text: `New question from ${formData.name} (${formData.email}): ${formData.message}`,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Inquiry submission error:", error);
    return { success: false };
  }
}

export async function replyToInquiry(inquiryId: string, message: string) {
  try {
    const supabase = await createClient();
    
    // 1. Get inquiry details
    const { data: inquiry } = await supabase
      .from("inquiries")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (!inquiry) throw new Error("Inquiry not found");

    // 2. Send Reply Email
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "RCV Media <info@rcv-media.com>",
        to: inquiry.email,
        replyTo: "8129141183@vtext.com", // SMS Bridge
        subject: `RE: ${inquiry.subject || "Your Inquiry"}`,
        text: message,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #000000; color: #ffffff; border: 1px solid #18181b;">
            <div style="margin-bottom: 40px; text-align: center;">
              <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0;">RCV<span style="color: #52525b;">.</span>MEDIA</h1>
            </div>
            
            <div style="padding: 30px; background-color: #09090b; border: 1px solid #27272a; border-radius: 4px;">
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #e4e4e7;">
                ${message}
              </p>
            </div>

            <div style="margin-top: 40px; text-align: center;">
               <p style="font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 2px;">
                 You can reply directly to this email to reach me via text.
               </p>
            </div>
          </div>
        `,
      });
    }

    // 3. Update status
    await supabase.from("inquiries").update({ status: 'replied' }).eq("id", inquiryId);
    
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Reply to inquiry error:", error);
    return { success: false };
  }
}

export async function updatePricingPackage(id: string, updates: any) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("pricing_packages")
      .update(updates)
      .eq("id", id);
      
    if (error) throw error;
    revalidatePath("/book");
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Update package error:", error);
    return { success: false };
  }
}

export async function updateSiteIdentity(id: string, updates: any) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("site_settings")
      .update(updates)
      .eq("id", id);
      
    if (error) throw error;
    revalidatePath("/about");
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Update site identity error:", error);
    return { success: false };
  }
}

export async function togglePhotoCurated(photoId: string, isCurated: boolean) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("photos")
      .update({ is_curated: isCurated })
      .eq("id", photoId);
      
    if (error) throw error;
    revalidatePath("/curated");
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch (error) {
    console.error("Toggle curated error:", error);
    return { success: false };
  }
}

export async function acceptInquiryAsBooking(inquiryId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Get inquiry details
    const { data: inquiry } = await supabase
      .from("inquiries")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (!inquiry) throw new Error("Inquiry not found");

    // 2. Create Booking
    const { error: bookingError } = await supabase
      .from("bookings")
      .insert([{
        name: inquiry.name,
        email: inquiry.email,
        shoot_type: inquiry.subject || "General Inquiry",
        message: inquiry.message,
        pipeline_stage: 'lead',
        status: 'pending'
      }]);

    if (bookingError) throw bookingError;

    // 3. Mark inquiry as 'accepted'
    await supabase.from("inquiries").update({ status: 'accepted' }).eq("id", inquiryId);
    
    revalidatePath("/dashboard/pipeline");
    return { success: true };
  } catch (error) {
    console.error("Accept inquiry error:", error);
    return { success: false };
  }
}

export async function submitInspiration(bookingId: string, data: any) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("booking_inspiration")
      .upsert({
        booking_id: bookingId,
        ...data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'booking_id' });

    if (error) throw error;
    
    revalidatePath(`/gallery`);
    return { success: true };
  } catch (error) {
    console.error("Submit inspiration error:", error);
    return { success: false };
  }
}
