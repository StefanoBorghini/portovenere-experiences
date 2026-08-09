"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Operator {
  id: string;
  name: string;
  email: string;
  stripe_onboarding_status: "not_started" | "pending" | "active" | "disabled";
}

const STATUS_LABEL: Record<Operator["stripe_onboarding_status"], string> = {
  not_started: "Not connected",
  pending: "Onboarding pending",
  active: "Active",
  disabled: "Disabled",
};

const STATUS_COLOR: Record<Operator["stripe_onboarding_status"], string> = {
  not_started: "text-white/40",
  pending: "text-amber-400",
  active: "text-emerald-400",
  disabled: "text-red-400",
};

export default function OperatorsPage() {

  const [operators, setOperators] = useState<Operator[]>([]);
  const [creating, setCreating] = useState(false);

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

  useEffect(() => {

    load();

  }, []);

  async function handleCreate() {

    if (!supabase) return;

    const name = window.prompt("Operator name?");
    if (!name) return;

    const email = window.prompt("Operator email?");
    if (!email) return;

    setCreating(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch("/api/admin/operators", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || ""}`,
      },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();

    setCreating(false);

    if (data.success) {
      window.location.href = `/admin/operators/${data.operator.id}`;
    }
  }

  return (

    <main className="min-h-screen bg-black text-white px-10 py-12">

      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-12">

          <div>
            <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-3">Admin</p>
            <h1 className="text-5xl font-light">Operators</h1>
          </div>

          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-6 py-4 rounded-xl bg-white text-black font-medium disabled:opacity-50"
          >
            {creating ? "Creating…" : "+ New Operator"}
          </button>

        </div>

        <div className="grid gap-5">

          {operators.map((operator) => (

            <Link
              key={operator.id}
              href={`/admin/operators/${operator.id}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950 p-6 hover:border-white/30 transition"
            >

              <div>
                <h2 className="text-2xl">{operator.name}</h2>
                <p className="text-white/40 mt-2">{operator.email}</p>
              </div>

              <div className={`text-sm ${STATUS_COLOR[operator.stripe_onboarding_status]}`}>
                {STATUS_LABEL[operator.stripe_onboarding_status]}
              </div>

            </Link>

          ))}

          {operators.length === 0 && (
            <p className="text-white/40">No operators yet.</p>
          )}

        </div>

      </div>

    </main>

  );
}
