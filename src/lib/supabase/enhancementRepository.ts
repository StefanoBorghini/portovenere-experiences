import { supabase } from "@/lib/supabase";
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


