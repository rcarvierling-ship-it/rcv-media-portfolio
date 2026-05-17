"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { deleteFromCloudinary } from "./upload";

export async function addPhoto(data: {
  title: string;
  category: string;
  album_id?: string | null;
  is_featured: boolean;
  is_curated?: boolean;
  image_url: string;
  raw_image_url?: string;
  raw_storage_path?: string;
  public_id: string;
  width: number;
  height: number;
  iso?: number;
  aperture?: string;
  shutter_speed?: string;
  focal_length?: string;
  camera_model?: string;
  lens_model?: string;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("Unauthorized");
  }

  const { data: inserted, error } = await supabase.from("photos").insert([data]).select().single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/dashboard");
  revalidatePath("/curated");
  
  return { success: true, data: inserted };
}

export async function deletePhoto(id: string, publicId: string, storagePath?: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("Unauthorized");
  }

  // 1. Delete from Cloudinary
  try {
    await deleteFromCloudinary(publicId);
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
  }

  // 2. Delete from Supabase Storage if it exists
  if (storagePath) {
    try {
      await supabase.storage.from("master-collection").remove([storagePath]);
    } catch (error) {
      console.error("Failed to delete from Supabase Storage:", error);
    }
  }

  // 3. Check and clean up global references in site_settings
  try {
    const { data: photoToDelete } = await supabase.from("photos").select("image_url").eq("id", id).single();
    if (photoToDelete?.image_url) {
      const { data: settings } = await supabase.from("site_settings").select("id, hero_image_url").limit(1).single();
      if (settings && settings.hero_image_url === photoToDelete.image_url) {
        await supabase.from("site_settings").update({ hero_image_url: null }).eq("id", settings.id);
      }
    }
  } catch (err) {
    console.error("Failed to clean up site settings reference:", err);
  }

  // 4. Delete from DB
  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/dashboard");
  revalidatePath("/curated");
}

export async function updatePhoto(id: string, updates: any) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("photos").update(updates).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/dashboard");
  revalidatePath("/curated");
}

export async function reorderPhotos(orderedIds: { id: string, sort_order: number }[]) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("Unauthorized");
  }

  for (const item of orderedIds) {
    await supabase.from("photos").update({ sort_order: item.sort_order }).eq("id", item.id);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/curated");
  return { success: true };
}
