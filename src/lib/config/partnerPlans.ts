// =========================================================
// Un solo posto per etichette/prezzi dei piani partner — usato sia
// dalla generazione del contratto (partnerContractPdf) sia dalla
// creazione del pagamento Stripe (create-stripe-payment). Se cambi
// i prezzi nel wizard (BecomePartnerClient.tsx, PLAN_OPTIONS),
// aggiornali anche qui.
// =========================================================

export const PLAN_LABELS: Record<string, string> = {
  base: "Base",
  premium: "Premium",
  signature: "Signature",
  not_sure: "Standard",
};

// Stringa da mostrare (contratto, ecc.) — "Signature"/"not_sure" non
// hanno un prezzo fisso, l'admin lo decide caso per caso.
export const PLAN_PRICE_LABELS: Record<string, string> = {
  base: "€120 / anno",
  premium: "€240 / anno",
  signature: "Su richiesta",
  not_sure: "Da definire",
};

// Importo numerico in EUR per creare il pagamento Stripe — null dove
// non c'e' un prezzo fisso (l'admin deve specificarlo a mano nel
// pannello prima di generare il link di pagamento).
export const PLAN_AMOUNTS: Record<string, number | null> = {
  base: 120,
  premium: 240,
  signature: null,
  not_sure: null,
};
