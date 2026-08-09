"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Operator {
  id: string;
  name: string;
  email: string;
  stripe_account_id: string | null;
  stripe_onboarding_status: "not_started" | "pending" | "active" | "disabled";
}

const STATUS_LABEL: Record<Operator["stripe_onboarding_status"], string> = {
  not_started: "Not connected",
  pending: "Onboarding pending — link sent, not completed yet",
  active: "Active — payouts enabled",
  disabled: "Disabled",
};

export default function OperatorEditor() {

  const params = useParams();

  const [operator, setOperator] = useState<Operator | null>(null);
  const [connecting, setConnecting] = useState(false);

  async function load() {

    if (!supabase) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(`/api/admin/operators/${params.id}`, {
      headers: { Authorization: `Bearer ${session?.access_token || ""}` },
    });

    const data = await response.json();

    if (data.success) {
      setOperator(data.operator);
    }
  }

  useEffect(() => {

    load();

  }, [params.id]);

  async function handleConnectStripe() {

    if (!supabase) return;

    setConnecting(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(`/api/admin/operators/${params.id}/stripe-connect-link`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token || ""}` },
    });

    const data = await response.json();

    setConnecting(false);

    if (data.success) {
      window.location.href = data.url;
    }
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (

    <main className="min-h-screen bg-black text-white px-10 py-12">

      <div className="max-w-3xl mx-auto">

        <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-3">Operator</p>
        <h1 className="text-5xl font-light mb-10">{operator.name}</h1>

        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 space-y-6">

          <div>
            <p className="text-white/40 text-sm mb-1">Email</p>
            <p>{operator.email}</p>
          </div>

          <div>
            <p className="text-white/40 text-sm mb-1">Stripe status</p>
            <p>{STATUS_LABEL[operator.stripe_onboarding_status]}</p>
          </div>

          <button
            onClick={handleConnectStripe}
            disabled={connecting || operator.stripe_onboarding_status === "active"}
            className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting
              ? "Redirecting…"
              : operator.stripe_onboarding_status === "active"
              ? "Connected ✓"
              : operator.stripe_onboarding_status === "pending"
              ? "Resume onboarding"
              : "Connect Stripe"}
          </button>

          <p className="text-white/30 text-xs">
            Solo gli operatori con status &quot;Active&quot; possono essere
            assegnati a esperienze/enhancement prenotabili via configuratore.
          </p>

        </div>

      </div>

    </main>

  );
}
