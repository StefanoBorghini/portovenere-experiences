import { supabase } from "@/lib/supabase";

// =========================================================
// Gating Stripe Connect per il configuratore — legge SOLO id +
// stripe_onboarding_status dalla vista pubblica public_operator_status
// (vedi supabase-migrations/2026_stripe_connect.sql), mai dalla tabella
// operators direttamente (bloccata da RLS, contiene email/stripe_account_id
// sensibili). Un Set di id "active" e' quanto serve a
// getBookableExperiences()/getBookableEnhancements() per escludere le
// righe di operatori non ancora connessi.
// =========================================================

export async function getActiveOperatorIds(): Promise<Set<string>> {

  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from("public_operator_status")
    .select("id")
    .eq("stripe_onboarding_status", "active");

  if (error) {
    console.error("[operatorRepository] getActiveOperatorIds failed:", error);
    return new Set();
  }

  return new Set((data || []).map((row: { id: string }) => row.id));
}
