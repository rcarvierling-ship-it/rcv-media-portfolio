"use server";

import { Resend } from "resend";

export async function submitContact(formData: FormData) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    const adminEmail = "rcar.vierling@gmail.com";

    // 1. Send Email
    await resend.emails.send({
      from: "RCV Media <bookings@rcv-media.com>",
      to: adminEmail,
      subject: `General Inquiry: ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #09090b; color: #ffffff;">
          <h2 style="color: #C8FF00; text-transform: uppercase;">New General Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="color: #a1a1aa;">${message}</p>
        </div>
      `,
    });

    // 2. Send SMS (Verizon)
    if (process.env.ADMIN_PHONE) {
      const cleanPhone = process.env.ADMIN_PHONE.replace(/[^0-9]/g, "");
      const carrierGateway = process.env.CARRIER_GATEWAY || "@vtext.com";
      const smsEmail = `${cleanPhone}${carrierGateway.startsWith('@') ? '' : '@'}${carrierGateway}`;
      await resend.emails.send({
        from: "RCV Media <bookings@rcv-media.com>",
        to: smsEmail,
        subject: "INQUIRY",
        text: `Inquiry from ${name}: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}" - Email: ${email}`,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Contact form error:", error);
    return { success: false };
  }
}
