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

export async function updateGalleryImage(
  id: string,
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
        "experience_gallery"
      )
      .update(
        updates
      )
      .eq(
        "id",
        id
      );

  if (error) {

    console.error(
      "GALLERY UPDATE ERROR",
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


export async function deleteGalleryImage(
  id: string
) {

  if (!supabase) {

    return {
      success: false,
    };
  }

  const { error } =
    await supabase
      .from(
        "experience_gallery"
      )
      .delete()
      .eq(
        "id",
        id
      );

  if (error) {

    console.error(error);

    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
  };
}


export async function createGalleryImage(
  image: any
) {

  if (!supabase) {

    return {
      success: false,
    };
  }

  const { error } =
    await supabase
      .from(
        "experience_gallery"
      )
      .insert(image);

  if (error) {

    console.error(error);

    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
  };
}


export async function uploadImage(
  file: File
) {
  if (!supabase) return null;

  const fileName =
    `${Date.now()}-${file.name}`;

  const { error } =
    await supabase.storage
      .from(
        "experience-images"
      )
      .upload(
        fileName,
        file
      );

  if (error) {
    console.error(error);
    return null;
  }

  const { data } =
    supabase.storage
      .from(
        "experience-images"
      )
      .getPublicUrl(
        fileName
      );

  return data.publicUrl;
}


export async function updateExperienceScoring(
  experienceId: string,
  updates: any
) {

  if (!supabase) {

    return {
      success: false,
    };
  }

  const { error } =
    await supabase
      .from("experience_scoring")
      .update(updates)
      .eq(
        "experience_id",
        experienceId
      );

  if (error) {

    console.error(error);

    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
  };
}

// ======================================================
// ENHANCEMENTS
// ======================================================

export async function getEnhancements() {

  if (!supabase) return [];

  const { data, error } =
    await supabase

      .from("enhancement_content")

      .select("*")

      .order("display_order");

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}

export async function createEnhancement() {

  if (!supabase) return null;

  const { data, error } =
    await supabase
      .from("enhancement_content")
      .insert({

        title: "New Enhancement",

        description: "",

        image: "",

        button_text: "Request Enhancement",

        display_order: 999,

        active: true,

      })

      .select()

      .single();

  if (error) {

    console.error(error);

    return null;

  }

  return data;

}

export async function updateEnhancement(
  id:string,
  updates:any
) {

  if (!supabase)
    return { success:false };

  const { error } =
    await supabase

      .from("enhancement_content")

      .update(updates)

      .eq("id",id);

  if (error) {

    console.error(error);

    return {

      success:false,

      error,

    };

  }

  return {

    success:true,

  };

}

export async function deleteEnhancement(
  id:string
) {

  if (!supabase)
    return { success:false };

  const { error } =
    await supabase

      .from("enhancement_content")

      .delete()

      .eq("id",id);

  if (error) {

    console.error(error);

    return {

      success:false,

      error,

    };

  }

  return {

    success:true,

  };

}

export async function uploadEnhancementImage(
  file:File
) {

  if (!supabase)
    return null;

  const fileName =
    `${Date.now()}-${file.name}`;

  const { error } =
    await supabase.storage

      .from("experience-images")

      .upload(
        `enhancements/${fileName}`,
        file
      );

  if (error) {

    console.error(error);

    return null;

  }

  const { data } =
    supabase.storage

      .from("experience-images")

      .getPublicUrl(
        `enhancements/${fileName}`
      );

  return data.publicUrl;

}


