import { supabase } from "@/lib/supabase";

// =========================================================
// CUSTOM PAYMENTS REPOSITORY
// custom_payments ha RLS senza policy pubblica (vedi migration) —
// diversamente da leadRepository.ts (che legge "leads"/"Proposal",
// pubblicamente leggibili), qui il client anon non basta: si passa
// sempre da /api/admin/custom-payments, autenticata col token della
// sessione admin corrente.
// =========================================================

export async function getCustomPayments() {
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

  const response = await fetch("/api/admin/custom-payments", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json();

  if (!data.success) {
    console.error("Error loading custom payments:", data.error);
    return [];
  }

  return data.rows;
}
