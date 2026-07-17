import { supabase } from "@/lib/supabase";

export interface Operator {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getOperators(): Promise<Operator[]> {
  if (!supabase) {
    console.error("Supabase not initialized");
    return [];
  }

  const { data, error } = await supabase
    .from("operators")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading operators:", error);
    return [];
  }

  return data;
}

export async function createOperator(name: string): Promise<Operator | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("operators")
    .insert({
      name,
      active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating operator:", error);
    return null;
  }

  return data;
}

export async function updateOperator(
  id: string,
  updates: Partial<Pick<Operator, "name" | "contact_email" | "contact_phone" | "notes" | "active">>
) {
  if (!supabase) {
    return { success: false, error: "Supabase not initialized" };
  }

  const { error } = await supabase
    .from("operators")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("UPDATE OPERATOR ERROR", error);
    return { success: false, error };
  }

  return { success: true };
}

export async function deleteOperator(id: string) {
  if (!supabase) return { success: false };

  // Experiences pointing at this operator keep their row (operator_id
  // set to null via ON DELETE SET NULL) — deleting an operator never
  // deletes experiences.
  const { error } = await supabase.from("operators").delete().eq("id", id);

  if (error) {
    console.error(error);
    return { success: false, error };
  }

  return { success: true };
}

/**
 * Assigns (or clears, with operatorId = null) the operator on a single
 * experience. Thin wrapper kept here so the experiences admin page
 * doesn't need to know the underlying column name.
 */
export async function setExperienceOperator(experienceId: string, operatorId: string | null) {
  if (!supabase) {
    return { success: false, error: "Supabase not initialized" };
  }

  const { error } = await supabase
    .from("experience_content")
    .update({ operator_id: operatorId })
    .eq("id", experienceId);

  if (error) {
    console.error("SET EXPERIENCE OPERATOR ERROR", error);
    return { success: false, error };
  }

  return { success: true };
}