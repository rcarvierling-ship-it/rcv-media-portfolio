"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

export async function createAlbum(data: { 
  title: string; 
  description?: string; 
  is_private: boolean;
  passcode?: string;
  client_name?: string;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Unauthorized");

  const slug = slugify(data.title);

  const { error } = await supabase.from("albums").insert([{
    ...data,
    slug
  }]);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/albums");
  revalidatePath("/dashboard/albums");
}

export async function updateAlbum(id: string, updates: { 
  title?: string; 
  description?: string; 
  is_private?: boolean; 
  passcode?: string;
  client_name?: string;
  cover_image_url?: string;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Unauthorized");

  let newSlug;
  if (updates.title) {
    newSlug = slugify(updates.title);
  }

  const { error } = await supabase.from("albums").update({
    ...updates,
    ...(newSlug ? { slug: newSlug } : {})
  }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/albums");
  revalidatePath("/dashboard/albums");
}

export async function deleteAlbum(id: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Unauthorized");

  const { error } = await supabase.from("albums").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/albums");
  revalidatePath("/dashboard/albums");
}
