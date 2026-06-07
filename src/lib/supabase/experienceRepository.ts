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

export async function getFullExperiences() {
  const experiences = await getExperiences();
const scoring = await getExperienceScoring();
const filters = await getExperienceFilters();
const gallery = await getExperienceGallery();



  return experiences.map((experience) => {
    const score = scoring.find(
      (s) => s.experience_id === experience.id
    );

    const filter = filters.find(
      (f) => f.experience_id === experience.id
    );
const experienceGallery =
  gallery.filter(
    (g) =>
      g.experience_id ===
      experience.id
  );

const featuredImage =
  experienceGallery.find(
    (g) => g.featured
  )?.image_url;
    return {
      ...experience,

      ...(score || {}),

      ...(filter || {}),

      gallery: experienceGallery,

featured_image:
  featuredImage,
    };
  });
}

export async function getExperienceGallery() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("experience_gallery")
    .select("*")
    .order("display_order");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function updateExperience(
  id: string,
  updates: any
) {

  if (!supabase) {

    return {
      success: false,
      error: "Supabase not initialized",
    };
  }

  const { error } =
    await supabase
      .from("experience_content")
      .update(updates)
      .eq("id", id);

  if (error) {

    console.error(
      "UPDATE ERROR",
      error
    );

    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
  };
}

export async function
updateExperienceFilters(
  experienceId: string,
  updates: any
) {

  if (!supabase) {

    return {
      success: false,
      error:
        "Supabase not initialized",
    };
  }

  const { error } =
    await supabase
      .from(
        "experience_filters"
      )
      .update(updates)
      .eq(
        "experience_id",
        experienceId
      );

  if (error) {

    console.error(
      "FILTER UPDATE ERROR",
      error
    );

    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
  };
}