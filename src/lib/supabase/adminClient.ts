/**
 * Supabase admin client — SERVER ONLY.
 * =====================================================================
 * Usa la service role key, che bypassa RLS. Non importare MAI questo
 * file da un componente "use client" o da codice che finisce nel
 * bundle del browser — la service role key e' un segreto totale,
 * equivalente a un accesso admin illimitato al database.
 *
 * Usato solo dalla API route /api/translate-experience, che gira
 * sempre lato server (Vercel Function), mai nel browser.
 *
 * Inizializzazione PIGRA (lazy): il client viene creato solo alla
 * prima chiamata reale, non al caricamento del modulo. Next.js
 * durante il build esegue una fase di "collecting page data" che
 * valuta le API route — se il client fosse creato a livello di
 * modulo, un env var mancante in quella fase (es. variabile
 * impostata solo per un altro ambiente) farebbe fallire l'intero
 * build, anche se a runtime la variabile sarebbe stata disponibile.
 * =====================================================================
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClientInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {

  if (adminClientInstance) {
    return adminClientInstance;
  }

  // NOTA: se il tuo progetto usa un nome diverso per l'URL pubblico di
  // Supabase (es. SUPABASE_URL invece di NEXT_PUBLIC_SUPABASE_URL),
  // aggiorna questa riga di conseguenza — controlla lib/supabase.ts
  // per il nome esatto gia' in uso li'.
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase admin client not configured: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing from env."
    );
  }

  adminClientInstance = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return adminClientInstance;
}