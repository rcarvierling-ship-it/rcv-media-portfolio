import { createClient } from "@/utils/supabase/server";
import { MediaLibraryClient } from "./client";

export default async function MediaLibraryPage() {
  const supabase = await createClient();
  
  const [photosRes, albumsRes] = await Promise.all([
    supabase.from("photos").select("*").order("created_at", { ascending: false }),
    supabase.from("albums").select("id, title")
  ]);

  return (
    <MediaLibraryClient 
      initialPhotos={photosRes.data || []} 
      albums={albumsRes.data || []} 
    />
  );
}
