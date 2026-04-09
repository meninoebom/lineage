import { supabase } from "./supabase";
import type { Testimony, TestimonyCount, Profile, YearsOfPractice } from "./types";

export async function getTestimonies(resourceSlug: string): Promise<Testimony[]> {
  const { data, error } = await supabase
    .from("testimonies")
    .select("*, profiles(display_name, traditions, years_of_practice)")
    .eq("resource_slug", resourceSlug)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Testimony[];
}

export async function getTestimonyCounts(slugs: string[]): Promise<Map<string, number>> {
  if (slugs.length === 0) return new Map();

  const { data, error } = await supabase
    .from("testimony_counts")
    .select("resource_slug, count")
    .in("resource_slug", slugs);

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as TestimonyCount[]) {
    counts.set(row.resource_slug, row.count);
  }
  return counts;
}

export async function createTestimony(testimony: {
  user_id: string;
  resource_slug: string;
  impact?: string | null;
  context?: string | null;
  who_for?: string | null;
  freeform?: string | null;
}): Promise<Testimony> {
  const { data, error } = await supabase
    .from("testimonies")
    .insert(testimony)
    .select()
    .single();

  if (error) throw error;
  return data as Testimony;
}

export async function getUserTestimony(
  userId: string,
  resourceSlug: string
): Promise<Testimony | null> {
  const { data, error } = await supabase
    .from("testimonies")
    .select("*")
    .eq("user_id", userId)
    .eq("resource_slug", resourceSlug)
    .maybeSingle();

  if (error) throw error;
  return data as Testimony | null;
}

export async function updateProfile(
  userId: string,
  updates: {
    display_name?: string | null;
    bio?: string | null;
    practice_background?: string | null;
    traditions?: string[];
    years_of_practice?: YearsOfPractice | null;
  }
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}
