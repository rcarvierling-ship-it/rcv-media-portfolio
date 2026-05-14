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
    .select("*")
    .limit(1)
    .single();

  const { data: albums } = await supabase
    .from("albums")
    .select("id, title, is_private")
    .order("created_at", { ascending: false });

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: packages } = await supabase
    .from("pricing_packages")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: allPhotos } = await supabase
    .from("photos")
    .select("*, albums(title)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BookingsAdminClient 
        initialBookings={bookings || []} 
        initialBlockedDates={blockedDates || []} 
        initialSettings={siteSettings || {}}
        albums={albums || []}
        initialInquiries={inquiries || []}
        initialPackages={packages || []}
        initialPhotos={allPhotos || []}
      />
    </div>
  );
}
