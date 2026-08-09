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
// CONCIERGE FEE (Fase 1) — percentuale a scaglioni DECRESCENTE sul
// VALORE TOTALE delle esperienze scelte (mai sul prezzo di una singola
// riga): e' la commissione di intermediazione che il cliente paga a
// Portovenere, non un acconto sull'esperienza stessa (che il cliente
// paga poi direttamente a ciascun operatore, fuori da questo sistema).
// Scaglioni configurabili via env, con i default del documento di
// prodotto Fase 1 se non impostati.
// =====================================================================

export function getConciergeFeeTier(totalValue: number): { percentage: number; amount: number } {
  const tier1Max = Number(process.env.CONCIERGE_FEE_TIER_1_MAX) || 500;
  const tier1Pct = Number(process.env.CONCIERGE_FEE_TIER_1_PERCENTAGE) || 10;
  const tier2Max = Number(process.env.CONCIERGE_FEE_TIER_2_MAX) || 1500;
  const tier2Pct = Number(process.env.CONCIERGE_FEE_TIER_2_PERCENTAGE) || 7;
  const tier3Max = Number(process.env.CONCIERGE_FEE_TIER_3_MAX) || 3000;
  const tier3Pct = Number(process.env.CONCIERGE_FEE_TIER_3_PERCENTAGE) || 5;
  const tier4Pct = Number(process.env.CONCIERGE_FEE_TIER_4_PERCENTAGE) || 3;

  const percentage =
    totalValue <= tier1Max
      ? tier1Pct
      : totalValue <= tier2Max
        ? tier2Pct
        : totalValue <= tier3Max
          ? tier3Pct
          : tier4Pct;

  return { percentage, amount: Math.round((totalValue * percentage) / 100) };
}
