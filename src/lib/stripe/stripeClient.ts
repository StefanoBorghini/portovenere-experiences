/**
 * Client Stripe — SERVER ONLY.
 * =====================================================================
 * Inizializzazione PIGRA (lazy), stesso pattern di getSupabaseAdmin()
 * (src/lib/supabase/adminClient.ts): il client viene creato solo alla
 * prima chiamata reale, non al caricamento del modulo — un env var
 * mancante durante la fase di build di Next.js ("collecting page data")
 * non deve far fallire l'intero build se a runtime la variabile sarebbe
 * comunque stata disponibile.
 * =====================================================================
 */

import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {

  if (stripeInstance) {
    return stripeInstance;
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe not configured: STRIPE_SECRET_KEY missing from env.");
  }

  stripeInstance = new Stripe(STRIPE_SECRET_KEY);

  return stripeInstance;
}

// Percentuale trattenuta da Portovenere sull'acconto — quel che NON
// viene trasferito agli operatori dopo il pagamento (vedi
// src/app/api/webhooks/stripe/route.ts). Configurabile via env,
// default 30% se non impostata.
//
// FASE 2 (marketplace/split) — non usata dal flusso Concierge Fee
// attivo in Fase 1 (vedi getConciergeFeeTier sotto). Tenuta cosi'
// com'e' per quando/se la Fase 2 verra' riattivata.
export function getDepositPercentage(): number {
  const raw = process.env.DEPOSIT_PERCENTAGE;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 100 ? parsed : 30;
}

// =====================================================================
// CONCIERGE FEE (Fase 1) — percentuale FISSA sul VALORE TOTALE delle
// esperienze scelte (mai sul prezzo di una singola riga): e' la
// commissione di intermediazione che il cliente paga a Portovenere,
// non un acconto sull'esperienza stessa (che il cliente paga poi
// direttamente a ciascun operatore, fuori da questo sistema).
// Percentuale configurabile via env, con il default 10% se non
// impostata. Importo arrotondato per difetto (mai a favore di
// Portovenere sul centesimo).
// =====================================================================

export function getConciergeFeeTier(totalValue: number): { percentage: number; amount: number } {
  const percentage = Number(process.env.CONCIERGE_FEE_PERCENTAGE) || 10;

  return { percentage, amount: Math.floor((totalValue * percentage) / 100) };
}
