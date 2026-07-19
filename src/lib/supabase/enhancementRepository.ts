import { supabase } from "@/lib/supabase";
import { resizeImageBeforeUpload, HERO_RESIZE_OPTIONS } from "../../lib/upload/resizeImageBeforeUpload";
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