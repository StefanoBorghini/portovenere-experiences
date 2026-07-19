import { supabase } from "@/lib/supabase";
import { resizeImageBeforeUpload, HERO_RESIZE_OPTIONS } from "../../lib/upload/resizeImageBeforeUpload";

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

  // elimina price tiers
  await supabase
    .from("experience_price_tiers")
    .delete()
    .eq("experience_id", id);

  // elimina seasonal pricing
  await supabase
    .from("experience_seasonal_pricing")
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

// =========================================================
// DUPLICATE EXPERIENCE
// Clona un'esperienza intera: dati generali, filtri guest/budget,
// punteggi mood, facts, sections, hero titles, tier di prezzo
// (se presenti), fasce di seasonal pricing (se presenti) e galleria
// immagini (stessi URL, righe nuove).
//
// La copia parte SEMPRE con active=false e featured=false — cosi'
// puoi rivederla/aggiustarla prima che compaia ai clienti, invece
// di pubblicare per sbaglio un duplicato ancora da sistemare
// (titolo, prezzo, operatore quasi certamente vanno cambiati).
// =========================================================

export async function duplicateExperience(id: string) {

  if (!supabase) {
    return { success: false, error: "Supabase not initialized" };
  }

  // ---------------------------------------------------------
  // 1. ESPERIENZA BASE
  // ---------------------------------------------------------

  const { data: original, error: fetchError } = await supabase
    .from("experience_content")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    console.error("duplicateExperience: fetch error", fetchError);
    return { success: false, error: fetchError };
  }

  const newId = `dup-${Date.now()}`;

  const { id: _oldId, ...rest } = original;

  const { error: createError } = await supabase
    .from("experience_content")
    .insert({
      ...rest,
      id: newId,
      title: `${original.title} (Copy)`,
      active: false,
      featured: false,
    });

  if (createError) {
    console.error("duplicateExperience: create error", createError);
    return { success: false, error: createError };
  }

  // ---------------------------------------------------------
  // 2. FILTERS
  // ---------------------------------------------------------

  const { data: filters } = await supabase
    .from("experience_filters")
    .select("*")
    .eq("experience_id", id)
    .maybeSingle();

  if (filters) {
    await supabase.from("experience_filters").insert({
      experience_id: newId,
      guest_2: filters.guest_2,
      guest_3_4: filters.guest_3_4,
      guest_5_7: filters.guest_5_7,
      guest_8_12: filters.guest_8_12,
      guest_13_20: filters.guest_13_20,
      guest_20_plus: filters.guest_20_plus,
      budget_500_1000: filters.budget_500_1000,
      budget_1000_3000: filters.budget_1000_3000,
      budget_3000_plus: filters.budget_3000_plus,
    });
  }

  // ---------------------------------------------------------
  // 3. SCORING
  // ---------------------------------------------------------

  const { data: scoring } = await supabase
    .from("experience_scoring")
    .select("*")
    .eq("experience_id", id)
    .maybeSingle();

  if (scoring) {
    await supabase.from("experience_scoring").insert({
      experience_id: newId,
      romantic_score: scoring.romantic_score,
      authentic_score: scoring.authentic_score,
      adventure_score: scoring.adventure_score,
      cinematic_score: scoring.cinematic_score,
    });
  }

  // ---------------------------------------------------------
  // 4. FACTS
  // ---------------------------------------------------------

  const { data: facts } = await supabase
    .from("experience_facts")
    .select("*")
    .eq("experience_id", id);

  if (facts && facts.length > 0) {

    const newFacts = facts.map((fact: any, index: number) => ({
      id: `dup-fact-${Date.now()}-${index}`,
      experience_id: newId,
      label: fact.label,
      value: fact.value,
      display_order: fact.display_order,
      active: fact.active,
    }));

    await supabase.from("experience_facts").insert(newFacts);
  }

  // ---------------------------------------------------------
  // 5. SECTIONS
  // ---------------------------------------------------------

  const { data: sections } = await supabase
    .from("experience_sections")
    .select("*")
    .eq("experience_id", id);

  if (sections && sections.length > 0) {

    const newSections = sections.map((section: any, index: number) => ({
      id: `dup-section-${Date.now()}-${index}`,
      experience_id: newId,
      title: section.title,
      description: section.description,
      display_order: section.display_order,
      active: section.active,
    }));

    await supabase.from("experience_sections").insert(newSections);
  }

  // ---------------------------------------------------------
  // 6. HERO TITLES
  // ---------------------------------------------------------

  const { data: heroTitles } = await supabase
    .from("experience_hero_titles")
    .select("*")
    .eq("experience_id", id);

  if (heroTitles && heroTitles.length > 0) {

    const newHeroTitles = heroTitles.map((heroTitle: any, index: number) => ({
      id: `dup-hero-title-${Date.now()}-${index}`,
      experience_id: newId,
      title: heroTitle.title,
      display_order: heroTitle.display_order,
      active: heroTitle.active,
    }));

    await supabase.from("experience_hero_titles").insert(newHeroTitles);
  }

  // ---------------------------------------------------------
  // 7. PRICE TIERS
  // ---------------------------------------------------------

  const { data: tiers } = await supabase
    .from("experience_price_tiers")
    .select("*")
    .eq("experience_id", id);

  if (tiers && tiers.length > 0) {

    const newTiers = tiers.map((tier: any, index: number) => ({
      id: `dup-tier-${Date.now()}-${index}`,
      experience_id: newId,
      min_guests: tier.min_guests,
      max_guests: tier.max_guests,
      price: tier.price,
      display_order: tier.display_order,
    }));

    await supabase.from("experience_price_tiers").insert(newTiers);
  }

  // ---------------------------------------------------------
  // 8. SEASONAL PRICING
  // ---------------------------------------------------------

  const { data: seasonalPricing } = await supabase
    .from("experience_seasonal_pricing")
    .select("*")
    .eq("experience_id", id);

  if (seasonalPricing && seasonalPricing.length > 0) {

    const newSeasonalPricing = seasonalPricing.map((range: any, index: number) => ({
      id: `dup-season-${Date.now()}-${index}`,
      experience_id: newId,
      start_date: range.start_date,
      end_date: range.end_date,
      price: range.price,
      display_order: range.display_order,
    }));

    await supabase.from("experience_seasonal_pricing").insert(newSeasonalPricing);
  }

  // ---------------------------------------------------------
  // 9. GALLERY
  // ---------------------------------------------------------

  const { data: gallery } = await supabase
    .from("experience_gallery")
    .select("*")
    .eq("experience_id", id);

  if (gallery && gallery.length > 0) {

    const newGalleryImages = gallery.map((image: any) => ({
      experience_id: newId,
      image_url: image.image_url,
      caption: image.caption,
      featured: image.featured,
      active: image.active,
      display_order: image.display_order,
    }));

    await supabase.from("experience_gallery").insert(newGalleryImages);
  }

  return { success: true, newId };
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

// ======================================================
// PRICE TIERS
// ======================================================

export async function getExperiencePriceTiers() {

  if (!supabase) return [];

  const { data, error } =
    await supabase
      .from("experience_price_tiers")
      .select("*")
      .order("display_order");

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}

export async function createExperiencePriceTier(tier: any) {

  if (!supabase)
    return { success: false };

  const { data, error } =
    await supabase
      .from("experience_price_tiers")
      .insert({
        id: tier.id,
        experience_id: tier.experience_id,
        min_guests: tier.min_guests,
        max_guests: tier.max_guests,
        price: tier.price,
        display_order: tier.display_order,
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

export async function updateExperiencePriceTier(
  id: string,
  updates: any
) {

  if (!supabase)
    return { success: false };

  const { error } =
    await supabase
      .from("experience_price_tiers")
      .update(updates)
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

export async function deleteExperiencePriceTier(
  id: string
) {

  if (!supabase)
    return { success: false };

  const { error } =
    await supabase
      .from("experience_price_tiers")
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

// ======================================================
// SEASONAL PRICING
// Stesso identico pattern di PRICE TIERS: 1 esperienza -> N fasce
// di date, ognuna con un prezzo fisso sostitutivo. Consumato da
// resolveSeasonalPrice.ts (sceglie la fascia che contiene il
// check-in del cliente).
// ======================================================

export async function getExperienceSeasonalPricing() {

  if (!supabase) return [];

  const { data, error } =
    await supabase
      .from("experience_seasonal_pricing")
      .select("*")
      .order("display_order");

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}

export async function createExperienceSeasonalPricing(range: any) {

  if (!supabase)
    return { success: false };

  const { data, error } =
    await supabase
      .from("experience_seasonal_pricing")
      .insert({
        id: range.id,
        experience_id: range.experience_id,
        start_date: range.start_date,
        end_date: range.end_date,
        price: range.price,
        display_order: range.display_order,
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

export async function updateExperienceSeasonalPricing(
  id: string,
  updates: any
) {

  if (!supabase)
    return { success: false };

  const { error } =
    await supabase
      .from("experience_seasonal_pricing")
      .update(updates)
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

export async function deleteExperienceSeasonalPricing(
  id: string
) {

  if (!supabase)
    return { success: false };

  const { error } =
    await supabase
      .from("experience_seasonal_pricing")
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

// ======================================================
// HERO TITLES
// Stesso pattern esatto di facts/sections: 1 esperienza -> N
// righe, ognuna con title/active/display_order. Consumato da
// generateProposal.ts (filtra le active, ne sceglie una a caso).
// ======================================================

export async function getExperienceHeroTitles() {

  if (!supabase) return [];

  const { data, error } =
    await supabase
      .from("experience_hero_titles")
      .select("*")
      .order("display_order");

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}

export async function createExperienceHeroTitle(heroTitle: any) {

  if (!supabase)
    return { success: false };

  const { data, error } =
    await supabase
      .from("experience_hero_titles")
      .insert({
        id: heroTitle.id,
        experience_id: heroTitle.experience_id,
        title: heroTitle.title,
        display_order: heroTitle.display_order,
        active: heroTitle.active,
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

export async function updateExperienceHeroTitle(

  id: string,

  updates: any

) {

  if (!supabase)
    return { success: false };

  const { error } =
    await supabase
      .from("experience_hero_titles")
      .update(updates)
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

export async function deleteExperienceHeroTitle(
  id: string
) {

  if (!supabase)
    return { success: false };

  const { error } =
    await supabase
      .from("experience_hero_titles")
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

export async function getFullExperiences() {

const experiences = await getExperiences();
const scoring = await getExperienceScoring();
const filters = await getExperienceFilters();
const gallery = await getExperienceGallery();
const facts =
  await getExperienceFacts();

const sections =
  await getExperienceSections();

const priceTiers =
  await getExperiencePriceTiers();

const seasonalPricing =
  await getExperienceSeasonalPricing();

const heroTitles =
  await getExperienceHeroTitles();


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

    const experiencePriceTiers =
  priceTiers
    .filter(
      tier =>
        tier.experience_id ===
        experience.id
    )
    .sort(
      (a, b) => a.min_guests - b.min_guests
    );

    const experienceSeasonalPricing =
  seasonalPricing
    .filter(
      (range: any) =>
        range.experience_id ===
        experience.id
    )
    .sort(
      (a: any, b: any) => a.display_order - b.display_order
    );

    const experienceHeroTitles =
  heroTitles.filter(
    heroTitle =>
      heroTitle.experience_id ===
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

  price_tiers: experiencePriceTiers,

  seasonal_pricing: experienceSeasonalPricing,

  hero_titles: experienceHeroTitles,

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

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_IMAGE_SIZE_BYTES =
  5 * 1024 * 1024;

export async function uploadImage(
  file: File,
  folder?: string,
  resizeOptions?: Parameters<typeof resizeImageBeforeUpload>[1]
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
      file,
      resizeOptions
    );

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.webp`;

  const path =
    folder ? `${folder}/${fileName}` : fileName;

  const { error } =
    await supabase.storage
      .from(
        "experience-images"
      )
      .upload(
        path,
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
        path
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
// SECTIONS
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