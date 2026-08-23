// =========================================================
// Validatori di formato per il wizard /become-a-partner — usati
// solo per abilitare/disabilitare "Avanti" (isStepValid in
// BecomePartnerClient.tsx), stesso meccanismo gia' in uso per
// l'email. Nessuno di questi campi diventa obbligatorio qui: un
// campo vuoto passa sempre, un campo compilato deve avere un
// formato plausibile.
// =========================================================

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^\+?[0-9\s]{6,15}$/.test(trimmed);
}

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    // new URL() richiede uno schema esplicito — se manca (es. l'utente
    // scrive solo "miosito.it") lo aggiungiamo prima di validare,
    // cosi' non rifiutiamo un input ragionevole solo perche' senza
    // "https://" davanti.
    new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return true;
  } catch {
    return false;
  }
}

// Partita IVA italiana: 11 cifre. Codice Fiscale persona fisica: 16
// caratteri nel formato standard (6 lettere, 2 cifre, 1 lettera, 2
// cifre, 1 lettera, 3 cifre, 1 lettera) — controllo di formato, non
// di checksum (sufficiente per intercettare errori di battitura senza
// dover implementare l'algoritmo di calcolo del carattere di controllo).
const VAT_NUMBER_PATTERN = /^\d{11}$/;
const TAX_CODE_PATTERN = /^[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z]\d{3}[A-Z]$/;

export function isValidVatOrTaxCode(value: string): boolean {
  const cleaned = value.trim().toUpperCase().replace(/\s/g, "");
  if (!cleaned) return true;
  return VAT_NUMBER_PATTERN.test(cleaned) || TAX_CODE_PATTERN.test(cleaned);
}
