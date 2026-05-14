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
  // Note: We fetch them server-side. The VaultClient will hide them until unlocked.
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", album.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="bg-zinc-950">
      <VaultClient album={album} photos={photos || []} />
    </div>
  );
}
