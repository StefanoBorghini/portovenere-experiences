import { supabase } from "@/lib/supabase";

export async function getExperiences() {
  if (!supabase) {
    console.error("Supabase not initialized");
    return [];
  }

  const { data, error } = await supabase
    .from("experience_content")
    .select("*")
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading experiences:",
      error
    );

    return [];
  }

  return data;
}

export async function getExperienceScoring() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("experience_scoring")
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function getExperienceFilters() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("experience_filters")
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

