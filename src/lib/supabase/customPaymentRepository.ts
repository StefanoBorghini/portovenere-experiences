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

export async function deleteCustomPayment(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase not initialized" };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const response = await fetch("/api/admin/custom-payments", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ id }),
  });

  const data = await response.json();

  if (!data.success) {
    console.error("Error deleting custom payment:", data.error);
    return { success: false, error: data.error };
  }

  return { success: true };
}
