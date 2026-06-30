import { supabase } from "@/lib/supabase";

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
  });

console.log("FILTER INSERT", filtersInsert);

const scoringInsert = await supabase
  .from("experience_scoring")
  .insert({
    experience_id: data.id,
  });

console.log("SCORING INSERT", scoringInsert);
  // crea filters

  await supabase

    .from("experience_filters")

    .insert({

      experience_id: data.id,

    });

  // crea scoring

  await supabase

    .from("experience_scoring")

    .insert({

      experience_id: data.id,

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
  console.log("ALL FACTS", facts);
const sections =
  await getExperienceSections();


  return experiences.map((experience) => {

    const experienceFacts =
  facts.filter(
    fact =>
      fact.experience_id ===
      experience.id
  );
console.log(
  "FACTS DEBUG",
  {
    id: experience.id,
    title: experience.title,
    facts: experienceFacts,
  }
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

  console.log("INSERTING FACT:", fact);

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

  console.log("DATA", data);
  console.log("ERROR", error);

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

  console.log("INSERTING SECTION:", section);

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

  console.log("DATA", data);
  console.log("ERROR", error);

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

