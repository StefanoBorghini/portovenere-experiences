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
 * =====================================================================
 */

import { createClient } from "@supabase/supabase-js";

// NOTA: se il tuo progetto usa un nome diverso per l'URL pubblico di
// Supabase (es. SUPABASE_URL invece di NEXT_PUBLIC_SUPABASE_URL),
// aggiorna questa riga di conseguenza — controlla lib/supabase.ts
// per il nome esatto gia' in uso li'.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);