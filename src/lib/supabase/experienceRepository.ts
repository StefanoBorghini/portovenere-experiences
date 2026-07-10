import { supabase } from "@/lib/supabase";
import { resizeImageBeforeUpload } from "../../lib/upload/resizeImageBeforeUpload";

export async function deleteExperience(id: string) {

  if (!supabase)
    return { success: false };

  // elimina gallery
  await supabase
    .from("experience_gallery")
    .delete()
    .eq("experience_id", id);

  // elimina scoring
  await supabase
    .from("experience_scoring")
    .delete()
    .eq("experience_id", id);

  // elimina filters
  await supabase
    .from("experience_filters")
    .delete()
    .eq("experience_id", id);

  // elimina experience
  const { error } =
    await supabase
      .from("experience_content")
      .delete()
      .eq("id", id);

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



export async function createExperience() {

  if (!supabase) {

    return null;

  }

  // crea experience

  const { data, error } =
    await supabase

      .from("experience_content")

      .insert({

        id: `new-experience-${Date.now()}`,

        title: "New Experience",

        operator: "",

        category: "sea_escape",

        base_price: 0,

        description: "",

        short_description: "",

        hero_image: "",

        detail_image: "",

        featured: false,

        active: true,

      })

      .select()

      .single();

  if (error) {

    console.error(error);

    return null;

  }

const filtersInsert = await supabase
  .from("experience_filters")
  .insert({
    experience_id: data.id,
    guest_2: false,
    guest_3_4: false,
    guest_5_7: false,
    guest_8_12: false,
    guest_13_20: false,
    guest_20_plus: false,
    budget_500_1000: false,
    budget_1000_3000: false,
    budget_3000_plus: false,
  });



const scoringInsert =await supabase
  .from("experience_scoring")
  .insert({
    experience_id: data.id,
    romantic_score: 0,
    authentic_score: 0,
    adventure_score: 0,
    cinematic_score: 0,
  });



  return data;

}


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
const facts =
  await getExperienceFacts();
  
const sections =
  await getExperienceSections();


  return experiences.map((experience) => {

    const experienceFacts =
  facts.filter(
    fact =>
      fact.experience_id ===
      experience.id
  );



  
    const experienceSections =
  sections.filter(
    section =>
      section.experience_id ===
      experience.id
  );
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

  incompatible_experiences:
    experience.incompatible_experiences ?? [],

  incompatible_enhancements:
    experience.incompatible_enhancements ?? [],

  ...(score || {}),

  ...(filter || {}),

  facts: experienceFacts,

  sections: experienceSections,

  gallery: experienceGallery,

  featured_image: featuredImage,

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


// ======================================================
// IMAGE UPLOAD VALIDATION
// ======================================================

// Tipi accettati IN INGRESSO (quello che l'utente seleziona
// dal proprio dispositivo) — l'output verso lo storage e'
// sempre WebP, vedi resizeImageBeforeUpload().
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_IMAGE_SIZE_BYTES =
  5 * 1024 * 1024; // 5 MB — controllo sul file originale,
                   // prima del resize

export async function uploadImage(
  file: File
) {
  if (!supabase) return null;

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type
    )
  ) {
    console.error(
      "uploadImage: tipo file non consentito:",
      file.type
    );
    return null;
  }

  if (
    file.size >
    MAX_IMAGE_SIZE_BYTES
  ) {
    console.error(
      "uploadImage: file troppo grande:",
      file.size
    );
    return null;
  }

  const resizedFile =
    await resizeImageBeforeUpload(
      file
    );

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.webp`;

  const { error } =
    await supabase.storage
      .from(
        "experience-images"
      )
      .upload(
        fileName,
        resizedFile
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
// PROPOSAL CONFIG
// ======================================================

export async function getProposalConfig() {

  if (!supabase) return [];

  const { data, error } =
    await supabase
      .from("proposal_config")
      .select("*")
      .order("display_order");

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}

export async function getExperienceFacts() {

  if (!supabase) return [];

  const { data, error } =
    await supabase
      .from("experience_facts")
      .select("*")
      .order("display_order");

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}

export async function createExperienceFact(fact: any) {

  if (!supabase)
    return { success: false };

  

  const { data, error } =
    await supabase
      .from("experience_facts")
      .insert({
       id: fact.id,
  experience_id: fact.experience_id,
  label: fact.label,
  value: fact.value,
  display_order: fact.display_order,
  active: fact.active,
      })
      .select();

 

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
export async function updateExperienceFact(

  id:string,

  updates:any

){

  if(!supabase)
    return {success:false};

  const { error } =
    await supabase
      .from("experience_facts")
      .update(updates)
      .eq("id",id);

  if(error){

    console.error(error);

    return{
      success:false,
      error,
    };

  }

  return{
    success:true,
  };

}

export async function deleteExperienceFact(
  id:string
){

  if(!supabase)
    return {success:false};

  const { error } =
    await supabase
      .from("experience_facts")
      .delete()
      .eq("id",id);

  if(error){

    console.error(error);

    return{
      success:false,
      error,
    };

  }

  return{
    success:true,
  };

}

// ======================================================
// PROPOSAL CONFIG
// ======================================================

export async function getExperienceSections() {

  if (!supabase) return [];

  const { data, error } =
    await supabase
      .from("experience_sections")
      .select("*")
      .order("display_order");

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}

export async function createExperienceSection(section: any) {

  if (!supabase)
    return { success: false };


  const { data, error } =
    await supabase
      .from("experience_sections")
      .insert({
        id: section.id,
        experience_id: section.experience_id,
        title: section.title,
        description: section.description,
        display_order: section.display_order,
        active: section.active,
      })
      .select();

  

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
export async function updateExperienceSection(

  id:string,

  updates:any

){

  if(!supabase)
    return {success:false};

  const { error } =
    await supabase
      .from("experience_sections")
      .update(updates)
      .eq("id",id);

  if(error){

    console.error(error);

    return{
      success:false,
      error,
    };

  }

  return{
    success:true,
  };

}

export async function deleteExperienceSection(
  id:string
){

  if(!supabase)
    return {success:false};

  const { error } =
    await supabase
      .from("experience_sections")
      .delete()
      .eq("id",id);

  if(error){

    console.error(error);

    return{
      success:false,
      error,
    };

  }

  return{
    success:true,
  };

}

export async function createProposalConfig() {

  if (!supabase) return null;

  const { data, error } =
    await supabase
      .from("proposal_config")
      .insert({

        id: `proposal-${Date.now()}`,

        key: "new_key",

        value: "",

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

export async function updateProposalConfig(

  id:string,

  updates:any

){

  if(!supabase)
    return {success:false};

  const {error}=
    await supabase

      .from("proposal_config")

      .update(updates)

      .eq("id",id);

  if(error){

    console.error(error);

    return{

      success:false,

      error,

    };

  }

  return{

    success:true,

  };

}

export async function deleteProposalConfig(
  id:string
){

  if(!supabase)
    return{success:false};

  const {error}=
    await supabase

      .from("proposal_config")

      .delete()

      .eq("id",id);

  if(error){

    console.error(error);

    return{

      success:false,

      error,

    };

  }

  return{

    success:true,

  };

}