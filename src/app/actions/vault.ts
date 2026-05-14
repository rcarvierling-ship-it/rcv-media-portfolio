"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function verifyVaultPasscode(passcode: string) {
  const supabase = await createClient();

  // Find the album with this passcode
  const { data: album, error } = await supabase
    .from("albums")
    .select("id, slug, title")
    .eq("passcode", passcode.toUpperCase())
    .single();

  if (error || !album) {
    return { success: false, error: "Invalid credentials" };
  }

  // Set a secure cookie for this specific album
  // This allows access to the private route
  const cookieStore = await cookies();
  cookieStore.set(`vault_access_${album.slug}`, "true", {
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  // Track the view - fetch current then increment
  const { data: currentAlbum } = await supabase.from("albums").select("vault_views").eq("id", album.id).single();
  await supabase.from("albums").update({ 
    vault_views: (currentAlbum?.vault_views || 0) + 1 
  }).eq("id", album.id);

  return { success: true, slug: album.slug };
}

export async function checkVaultAccess(slug: string) {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(`vault_access_${slug}`);
  return !!hasAccess;
}
