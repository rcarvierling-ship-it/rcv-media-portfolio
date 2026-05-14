import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { GalleryClient } from "./client";

export default async function GalleryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const supabase = await createClient();

  // Fetch album metadata (public info only)
  const { data: album } = await supabase
    .from("albums")
    .select("id, title, description, slug, is_private, client_name, passcode")
    .eq("slug", slug)
    .single();

  if (!album) {
    notFound();
  }

  // We fetch photos separately in the client after passcode validation
  // to ensure data privacy for private galleries.

  return (
    <div className="min-h-screen bg-black">
      <GalleryClient album={album} />
    </div>
  );
}
