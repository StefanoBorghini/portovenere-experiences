// =========================================================
// Carica .env.local nelle process.env quando questi script
// vengono lanciati con "node script.mjs" invece che con "next dev"
// (che legge .env.local da solo). Un plain "node" non carica MAI
// automaticamente .env.local — da qui l'errore "NEXT_PUBLIC_SUPABASE_URL
// / SUPABASE_SERVICE_ROLE_KEY mancanti" anche quando il file esiste
// ed e' gia' usato correttamente da "npm run dev".
//
// Nessuna dipendenza esterna (niente "dotenv"): un parser minimo,
// volutamente senza gestire edge case avanzati (variabili annidate,
// export multilinea, ecc.) che qui non servono — solo KEY=VALUE per
// riga, commenti con #, valori tra virgolette opzionali.
// =========================================================

import fs from "fs";
import path from "path";

export function loadEnvLocal() {

  const envPath = path.resolve(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf-8");

  for (const line of content.split("\n")) {

    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    // Rimuove eventuali virgolette (singole o doppie) attorno al valore.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Non sovrascrive variabili gia' impostate nell'ambiente (es. su
    // Vercel/CI) — .env.local resta solo un fallback per lo sviluppo locale.
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
