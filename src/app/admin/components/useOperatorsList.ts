"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// =========================================================
// Elenco operatori per i dropdown "Payout Operator" nelle schede
// esperienza/enhancement — operators non ha policy RLS pubbliche
// (stesso trattamento di partner_applications), quindi anche una
// semplice lettura passa da /api/admin/operators con la sessione
// admin, non dal client Supabase anon usato altrove in queste pagine.
// =========================================================

export interface OperatorOption {
  id: string;
  name: string;
  stripe_onboarding_status: "not_started" | "pending" | "active" | "disabled";
}

export function useOperatorsList() {

  const [operators, setOperators] = useState<OperatorOption[]>([]);

  useEffect(() => {

    async function load() {

      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/admin/operators", {
        headers: { Authorization: `Bearer ${session?.access_token || ""}` },
      });

      const data = await response.json();

      if (data.success) {
        setOperators(data.operators);
      }
    }

    load();

  }, []);

  return operators;
}
