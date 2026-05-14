"use server";

import { createClient } from "@/utils/supabase/server";

export async function logAnalyticsEvent(event: {
  event_type: 'vault_view' | 'photo_download' | 'portfolio_view' | 'booking_start' | 'photo_hover' | 'engagement_duration',
  album_id?: string,
  photo_id?: string,
  metadata?: any
}) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("analytics_events").insert({
    event_type: event.event_type,
    album_id: event.album_id,
    photo_id: event.photo_id,
    metadata: event.metadata || {}
  });

  if (error) console.error("Analytics Log Failed:", error.message);
  return { success: !error };
}

export async function getAgencyStats() {
  const supabase = await createClient();

  // 1. Fetch total views per event type
  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, created_at");

  // 2. Fetch top photos
  const { data: topPhotos } = await supabase
    .from("analytics_events")
    .select("photo_id, photos(title, image_url, album_id)")
    .eq("event_type", "photo_download")
    .not("photo_id", "is", null);

  // Aggregation logic would happen here or via SQL
  // For now we'll just return raw for the client to handle or do more specific queries

  return { events: events || [], topPhotos: topPhotos || [] };
}
