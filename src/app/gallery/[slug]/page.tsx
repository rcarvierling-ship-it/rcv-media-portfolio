import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { VaultClient } from "./VaultClient";

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: album } = await supabase
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!album) return notFound();

  // Fetch photos for this album
  let photosQuery = supabase
    .from("photos")
    .select("*")
    .eq("album_id", album.id);
  
  if (!album.is_private) {
    photosQuery = photosQuery.eq("is_curated", true);
  }

  const { data: photos } = await photosQuery.order("sort_order", { ascending: true });

  // Fetch the linked booking to see if it needs inspiration
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, pricing_packages(*)")
    .eq("linked_album_id", album.id)
    .single();

  const requiresInspiration = booking?.pricing_packages?.requires_inspiration || false;

  return (
    <div className="bg-zinc-950">
      <VaultClient 
        album={album} 
        photos={photos || []} 
        booking={booking} 
        requiresInspiration={requiresInspiration}
      />
    </div>
  );
}
