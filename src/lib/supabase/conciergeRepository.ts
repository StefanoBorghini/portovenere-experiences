// =========================================================
// CONCIERGE OPERATOR STATUS — coordinamento manuale per-riga (i 7 step
// del workflow concierge) una volta pagata la Concierge Fee.
//
// concierge_operator_status ha RLS senza policy pubblica (stesso
// trattamento di operators/partner_applications), quindi queste
// funzioni NON usano il client anon direttamente — passano dalla route
// admin autenticata /api/admin/concierge-operator-status, stesso motivo
// per cui GeneralCard/EnhancementCard non leggono "operators" a mano.
// =========================================================

export async function getConciergeOperatorStatus(leadId: string, accessToken: string) {
  try {
    const response = await fetch(
      `/api/admin/concierge-operator-status?leadId=${encodeURIComponent(leadId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error("getConciergeOperatorStatus error:", data.error);
      return [];
    }

    return data.rows as any[];
  } catch (err) {
    console.error("getConciergeOperatorStatus failed:", err);
    return [];
  }
}

export async function updateConciergeOperatorStatus(
  id: string,
  updates: { status?: string; notes?: string | null; item_operator_name?: string | null },
  accessToken: string
) {
  try {
    const response = await fetch("/api/admin/concierge-operator-status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id, updates }),
    });

    const data = await response.json();

    return { success: Boolean(data.success), error: data.error };
  } catch (err) {
    console.error("updateConciergeOperatorStatus failed:", err);
    return { success: false, error: err };
  }
}

// =========================================================
// Etichette italiane per gli 11 stati — usate nella dropdown della
// sezione "Operator coordination" sulla scheda lead. I valori DB
// restano stabili (vedi supabase-migrations/2026_concierge_fee.sql);
// solo l'etichetta mostrata e' localizzata.
// =========================================================

export const CONCIERGE_OPERATOR_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "da_contattare", label: "Da contattare" },
  { value: "contattato_in_attesa", label: "Contattato — in attesa di risposta" },
  { value: "disponibilita_confermata", label: "Disponibilità confermata dall'operatore" },
  { value: "non_disponibile_da_riproporre", label: "Non disponibile — da riproporre alternativa" },
  { value: "in_attesa_pagamento_cliente", label: "In attesa che il cliente paghi l'operatore" },
  { value: "pagamento_cliente_confermato", label: "Pagamento cliente confermato" },
  { value: "esperienza_confermata", label: "Esperienza confermata" },
  { value: "modifiche_richieste", label: "Modifiche richieste dal cliente" },
  { value: "in_attesa_dettagli_operativi", label: "In attesa dettagli operativi (orario/punto d'incontro)" },
  { value: "completata", label: "Completata" },
  { value: "annullata", label: "Annullata" },
];
