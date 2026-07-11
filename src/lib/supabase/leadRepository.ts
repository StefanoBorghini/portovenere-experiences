import { supabase } from "@/lib/supabase";

// =========================================================
// LEADS REPOSITORY
// Stesso pattern di experienceRepository.ts: ogni funzione
// controlla che supabase sia inizializzato, logga l'errore
// su console, e ritorna { success, error } dove applicabile.
// =========================================================

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "won"
  | "lost";

// =========================================================
// GET LEADS — lista completa, ordinata per più recente
// =========================================================

export async function getLeads() {
  if (!supabase) {
    console.error("Supabase not initialized");
    return [];
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading leads:", error);
    return [];
  }

  return data;
}

// =========================================================
// GET LEAD BY ID — usata dalla pagina di dettaglio
// =========================================================

export async function getLeadById(id: string) {
  if (!supabase) {
    console.error("Supabase not initialized");
    return null;
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error loading lead:", error);
    return null;
  }

  return data;
}

// =========================================================
// UPDATE LEAD — status, note interne, o qualsiasi altro campo.
// Aggiorna sempre updated_at, cosi' la lista puo' ordinare/
// mostrare "ultima modifica" senza doverlo passare ogni volta.
// =========================================================

export async function updateLead(id: string, updates: any) {
  if (!supabase) {
    return { success: false, error: "Supabase not initialized" };
  }

  const { error } = await supabase
    .from("leads")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("UPDATE ERROR", error);
    return { success: false, error };
  }

  return { success: true };
}

// =========================================================
// DELETE LEAD
// =========================================================

export async function deleteLead(id: string) {
  if (!supabase) {
    return { success: false, error: "Supabase not initialized" };
  }

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("DELETE ERROR", error);
    return { success: false, error };
  }

  return { success: true };
}

// =========================================================
// GET PROPOSAL FOR LEAD — per mostrare nel dettaglio se
// il lead ha gia' generato una proposal (join semplice via
// lead_id, come da schema in craft-your-experience/page.tsx)
// =========================================================

export async function getProposalForLead(leadId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("Proposal")
    .select("slug, expires_at, total_price, email_verified")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) {
    console.error("Error loading proposal for lead:", error);
    return null;
  }

  return data;
}