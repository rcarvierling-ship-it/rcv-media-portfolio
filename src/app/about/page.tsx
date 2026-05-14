import { createClient } from "@/utils/supabase/server";
import { AboutClient } from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Narrative | RCV.Media",
  description: "Exploring the visual intelligence and cinematic storytelling of Reese Vierling.",
};

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").limit(1).single();

  const data = {
    titleFirst: settings?.about_title_first || "Reese",
    titleLast: settings?.about_title_last || "Vierling",
    bio: settings?.about_bio || "I am a sports, lifestyle, and event photographer based in Louisville, KY.",
    imageUrl: settings?.about_image_url || "https://images.unsplash.com/photo-1554046920-90dcac024a1e?q=80&w=1978&auto=format&fit=crop",
    instagramUrl: settings?.instagram_url,
    contactEmail: settings?.contact_email || "contact@rcv-media.com"
  };

  return <AboutClient data={data} />;
}
