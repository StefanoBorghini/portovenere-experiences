import { supabase } from "@/lib/supabase";

// =========================================================
// PARTNER PAYMENTS — per la pagina admin "Payments" unificata
// (vedi admin/payments/page.tsx). partner_applications ha RLS senza
// policy pubblica, stesso motivo di customPaymentRepository.ts: si
// passa sempre da route server-side autenticate, mai dal client
// supabase diretto.
//
// Riusa GET /api/admin/partners (gia' esistente per /admin/affiliates)
// invece di una route dedicata, filtrando qui le sole righe con un
// pagamento davvero richiesto (payment_status diverso da "pending",
// il default iniziale prima di qualsiasi azione admin).
// =========================================================

// Tutte le candidature, senza filtro — usata dalla Dashboard per il
// conteggio totale Affiliates (vedi admin/page.tsx) e da
// getPartnerPayments() sotto come base da filtrare.
export async function getPartnerApplications() {
  if (!supabase) {
    console.error("Supabase not initialized");
    return [];
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return [];
  }

  const response = await fetch("/api/admin/partners", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json();

  if (!data.success) {
    console.error("Error loading partner applications:", data.error);
    return [];
  }

  return data.data || [];
}

export async function getPartnerPayments() {
  const applications = await getPartnerApplications();
  return applications.filter((p: any) => p.payment_status !== "pending");
}

// "Reset" — non cancella la candidatura, solo i campi legati al
// pagamento (stesso spirito di deleteProposalPayment: la Proposal/il
// lead restano, solo la richiesta di pagamento viene azzerata).
export async function resetPartnerPayment(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase not initialized" };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const response = await fetch(`/api/admin/partners/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      payment_status: "pending",
      payment_sent_at: null,
      payment_amount: null,
      stripe_checkout_session_id: null,
      checkout_url: null,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    console.error("Error resetting partner payment:", data.error);
    return { success: false, error: data.error };
  }

  return { success: true };
}
