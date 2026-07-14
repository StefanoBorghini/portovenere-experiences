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

  // Serve anche confirmed_selection (experienceIds/enhancementIds
  // scelti dal cliente sulla proposal page, vedi
  // /api/confirm-changes e /api/request-booking) oltre a
  // email_verified, per mostrare nel dettaglio lead cosa ha
  // scelto davvero e se ha confermato l'email.
  const { data, error } = await supabase
    .from("Proposal")
    .select(
      "slug, expires_at, total_price, email_verified, confirmed_selection, proposal_data"
    )
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) {
    console.error("Error loading proposal for lead:", error);
    return null;
  }

  return data;
}

// =========================================================
// RESTART PROPOSAL TIMER
// Rimanda expires_at a 48h da ORA, sulla Proposal collegata a
// questo lead. Serve quando una proposal sta per scadere (o è
// già scaduta) ma il cliente ha bisogno di più tempo — l'admin
// può "resettarla" senza dover ricreare tutto da capo.
// =========================================================

export async function restartProposalTimer(leadId: string) {

  if (!supabase) {
    return { success: false, error: "Supabase not initialized" };
  }

  const newExpiresAt = new Date(
    Date.now() + 48 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabase
    .from("Proposal")
    .update({ expires_at: newExpiresAt })
    .eq("lead_id", leadId);

  if (error) {
    console.error("Error restarting proposal timer:", error);
    return { success: false, error };
  }

  return { success: true, expiresAt: newExpiresAt };
}

// =========================================================
// EMAIL VERIFIED MAP — per la pagina lista, che mostra un
// badge per ogni riga senza fare una query per lead (N+1).
// Una sola select su Proposal, poi si incrocia per lead_id.
// =========================================================

export async function getEmailVerifiedMap(): Promise<
  Record<string, boolean>
> {
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("Proposal")
    .select("lead_id, email_verified");

  if (error) {
    console.error("Error loading proposal verification map:", error);
    return {};
  }

  const map: Record<string, boolean> = {};
  (data || []).forEach((row: any) => {
    map[row.lead_id] = !!row.email_verified;
  });

  return map;
}

// =========================================================
// RESOLVE SELECTED EXPERIENCES/ENHANCEMENTS
// La Proposal salva solo gli ID scelti (confirmed_selection).
// Questa funzione li incrocia con le tabelle experience_content
// ed enhancement_content per avere titolo, operatore e prezzo
// da mostrare nel dettaglio lead. Va chiamata passando le liste
// gia' caricate da getFullExperiences()/getEnhancements(), cosi'
// da non duplicare quelle chiamate se la pagina le usa gia'.
// =========================================================

export function resolveLeadSelection(
  proposal: any,
  allExperiences: any[],
  allEnhancements: any[]
) {
  const experienceIds: string[] =
    proposal?.confirmed_selection?.experienceIds || [];

  const enhancementIds: string[] =
    proposal?.confirmed_selection?.enhancementIds || [];

  const selectedExperiences = experienceIds
    .map((id) => allExperiences.find((exp) => exp.id === id))
    .filter(Boolean)
    .map((exp) => ({
      id: exp.id,
      title: exp.title,
      operator: exp.operator,
      category: exp.category,
    }));

  const selectedEnhancements = enhancementIds
    .map((id) => allEnhancements.find((enh) => enh.id === id))
    .filter(Boolean)
    .map((enh) => ({
      id: enh.id,
      title: enh.title,
      base_price: enh.base_price,
      price_type: enh.price_type,
    }));

  return { selectedExperiences, selectedEnhancements };
}