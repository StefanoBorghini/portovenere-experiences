import { supabase } from "@/lib/supabase";
import { resizeImageBeforeUpload, HERO_RESIZE_OPTIONS } from "../../lib/upload/resizeImageBeforeUpload";
import { getLocalizedExperience } from "@/lib/translations/getLocalizedField";
import { getActiveOperatorIds } from "./operatorRepository";
// ======================================================
// ENHANCEMENTS
// ======================================================



export async function getEnhancements(locale: string = "en") {

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

  if (!data) return data;

  // Regole di disponibilita' (screening date, non prenotazione — vedi
  // resolveAvailability.ts) allegate a ogni riga, stesso pattern di
  // seasonal_pricing/price_tiers su getFullExperiences() in
  // experienceRepository.ts.
  const [availabilitySeasons, availabilityWeekdays, availabilityDates] = await Promise.all([
    getEnhancementAvailabilitySeasons(),
    getEnhancementAvailabilityWeekdays(),
    getEnhancementAvailabilityDates(),
  ]);

  const withAvailability = data.map((enhancement: any) => ({
    ...enhancement,
    availability_seasons: availabilitySeasons
      .filter((rule: any) => rule.enhancement_id === enhancement.id)
      .sort((a: any, b: any) => a.display_order - b.display_order),
    availability_weekdays: availabilityWeekdays.filter(
      (rule: any) => rule.enhancement_id === enhancement.id
    ),
    availability_dates: availabilityDates.filter(
      (rule: any) => rule.enhancement_id === enhancement.id
    ),
  }));

  if (locale === "en") return withAvailability;

  const { data: translations, error: translationsError } =
    await supabase
      .from("enhancement_content_translations")
      .select("*")
      .eq("locale", locale);

  if (translationsError) {
    console.error(translationsError);
    return withAvailability;
  }

  return withAvailability.map((enhancement) =>
    getLocalizedExperience(
      enhancement,
      translations?.find((t) => t.enhancement_id === enhancement.id),
      ["title", "description", "unselected_button_text", "selected_button_text"]
    )
  );

}

// =========================================================
// AVAILABILITY — stesso schema/logica di
// getExperienceAvailability{Season,Weekday,Date} in
// experienceRepository.ts, per gli enhancement. Vedi
// supabase-migrations/2026_availability.sql e
// src/lib/availability/resolveAvailability.ts.
// =========================================================

export async function getEnhancementAvailabilitySeasons() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("enhancement_availability_seasons")
    .select("*")
    .order("display_order");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function createEnhancementAvailabilitySeason(rule: any) {
  if (!supabase) return { success: false };

  const { error } = await supabase.from("enhancement_availability_seasons").insert({
    id: rule.id,
    enhancement_id: rule.enhancement_id,
    status: rule.status,
    start_month: rule.start_month,
    start_day: rule.start_day,
    end_month: rule.end_month,
    end_day: rule.end_day,
    display_order: rule.display_order,
  });

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  return { success: true };
}

export async function updateEnhancementAvailabilitySeason(id: string, updates: any) {
  if (!supabase) return { success: false };

  const { error } = await supabase
    .from("enhancement_availability_seasons")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  return { success: true };
}

export async function deleteEnhancementAvailabilitySeason(id: string) {
  if (!supabase) return { success: false };

  const { error } = await supabase
    .from("enhancement_availability_seasons")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  return { success: true };
}

export async function getEnhancementAvailabilityWeekdays() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("enhancement_availability_weekdays")
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function createEnhancementAvailabilityWeekday(rule: any) {
  if (!supabase) return { success: false };

  const { error } = await supabase.from("enhancement_availability_weekdays").insert({
    id: rule.id,
    enhancement_id: rule.enhancement_id,
    status: rule.status,
    weekday: rule.weekday,
  });

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  return { success: true };
}

export async function deleteEnhancementAvailabilityWeekday(id: string) {
  if (!supabase) return { success: false };

  const { error } = await supabase
    .from("enhancement_availability_weekdays")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  return { success: true };
}

export async function getEnhancementAvailabilityDates() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("enhancement_availability_dates")
    .select("*")
    .order("date");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function createEnhancementAvailabilityDate(rule: any) {
  if (!supabase) return { success: false };

  const { error } = await supabase.from("enhancement_availability_dates").insert({
    id: rule.id,
    enhancement_id: rule.enhancement_id,
    date: rule.date,
    status: rule.status,
    source: rule.source,
    note: rule.note || null,
  });

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  return { success: true };
}

export async function updateEnhancementAvailabilityDate(id: string, updates: any) {
  if (!supabase) return { success: false };

  const { error } = await supabase
    .from("enhancement_availability_dates")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  return { success: true };
}

export async function deleteEnhancementAvailabilityDate(id: string) {
  if (!supabase) return { success: false };

  const { error } = await supabase
    .from("enhancement_availability_dates")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  return { success: true };
}

// =========================================================
// Come getEnhancements(), ma esclude solo quelli GIA' ASSEGNATI a un
// operatore che non ha completato l'onboarding Stripe Connect — un
// enhancement senza operatore assegnato resta visibile come sempre,
// stesso ragionamento (opt-in, non retroattivo) di
// getBookableExperiences() in experienceRepository.ts.
// =========================================================

export async function getBookableEnhancements(locale: string = "en") {

  const [enhancements, activeOperatorIds] = await Promise.all([
    getEnhancements(locale),
    getActiveOperatorIds(),
  ]);

  return (enhancements || []).filter(
    (enhancement: { operator_id?: string | null }) =>
      !enhancement.operator_id || activeOperatorIds.has(enhancement.operator_id)
  );
}

export async function createEnhancement() {

  if (!supabase) return null;

  const { data, error } =
    await supabase
      .from("enhancement_content")
      .insert({

    title:"New Enhancement",

    description:"",

    image:"",

    button_text:"Request",

    base_price:0,

    price_type:"fixed",

    category:"general",

    display_order:999,

    active:true,

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

// ======================================================
// IMAGE UPLOAD VALIDATION
// (stesse regole di experienceRepository.ts: tipo consentito
// + dimensione massima sul file originale, prima del resize)
// ======================================================

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_IMAGE_SIZE_BYTES =
  5 * 1024 * 1024; // 5 MB

export async function uploadEnhancementImage(
  file:File
) {

  if (!supabase)
    return null;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {

    console.error(
      "uploadEnhancementImage: tipo file non consentito:",
      file.type
    );

    return null;

  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {

    console.error(
      "uploadEnhancementImage: file troppo grande:",
      file.size
    );

    return null;

  }

  const resizedFile =
    await resizeImageBeforeUpload(
      file,
      HERO_RESIZE_OPTIONS
    );

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.webp`;

  const { error } =
    await supabase.storage

      .from("experience-images")

      .upload(
        `enhancements/${fileName}`,
        resizedFile
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