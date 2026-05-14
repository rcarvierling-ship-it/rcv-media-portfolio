"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { deleteFromCloudinary } from "./upload";

export async function addPhoto(data: {
  title: string;
  category: string;
  album_id?: string | null;
  is_featured: boolean;
  image_url: string;
  public_id: string;
  width: number;
  height: number;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("photos").insert([data]);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/dashboard");
}

export async function deletePhoto(id: string, publicId: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("Unauthorized");
  }

  // First delete from Cloudinary
  try {
    await deleteFromCloudinary(publicId);
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
    // Continue to delete from DB anyway to prevent orphaned DB records
  }

  // Then delete from DB
  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/dashboard");
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
}
