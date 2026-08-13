import { supabase } from "@/lib/supabase";

// =========================================================
// CUSTOM PAYMENTS REPOSITORY — stesso pattern di leadRepository.ts.
// =========================================================

export async function getCustomPayments() {
  if (!supabase) {
    console.error("Supabase not initialized");
    return [];
  }

  const { data, error } = await supabase
    .from("custom_payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading custom payments:", error);
    return [];
  }

  return data;
}
