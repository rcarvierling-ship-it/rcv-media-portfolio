import { createClient } from "@/utils/supabase/server";
import { BookingsAdminClient } from "./client";

export default async function BookingsDashboard() {
  const supabase = await createClient();
  
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: blockedDates } = await supabase
    .from("blocked_dates")
    .select("*")
    .order("date", { ascending: true });

  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("booking_min_advance_days, booking_max_advance_days, booking_is_active")
    .limit(1)
    .single();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12 border-b border-zinc-800 pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Bookings</h1>
        <p className="text-zinc-400 font-light text-lg">Manage incoming requests, block calendar dates, and configure rules.</p>
      </div>

      <BookingsAdminClient 
        initialBookings={bookings || []} 
        initialBlockedDates={blockedDates || []} 
        initialSettings={siteSettings || {}}
      />
    </div>
  );
}
