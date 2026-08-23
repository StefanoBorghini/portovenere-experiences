"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PLAN_LABELS: Record<string, string> = {
  base: "Base",
  premium: "Premium",
  signature: "Signature",
  not_sure: "Not sure",
};

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "payment_sent", label: "Payment sent" },
  { value: "paid", label: "Paid" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

// =========================================================
// Rende un blocco jsonb (profile/details/booking/materials) come
// lista chiave/valore leggibile — stesso principio di jsonbSection()
// in templates.ts, ma qui in JSX invece che HTML per email.
// =========================================================

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value) && value.length > 0) return value.join(", ");
  return null;
}

function JsonbSection({ title, data }: { title: string; data: Record<string, unknown> | null | undefined }) {
  if (!data) return null;

  const rows = Object.entries(data)
    .map(([key, value]) => [key, formatValue(value)] as [string, string | null])
    .filter(([, value]) => value !== null) as [string, string][];

  if (rows.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-white/[0.08]">
      <p className="text-white/40 text-sm mb-3 uppercase tracking-wide">{title}</p>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {rows.map(([key, value]) => (
          <div key={key}>
            <dt className="text-white/40">{humanizeKey(key)}</dt>
            <dd className="break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function AffiliateDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [partner, setPartner] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [markingPaymentSent, setMarkingPaymentSent] = useState(false);
  const [activatingSubscription, setActivatingSubscription] = useState(false);
  const [sendingContract, setSendingContract] = useState(false);

  async function getAccessToken() {
    if (!supabase) return "";
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || "";
  }

  useEffect(() => {
    async function load() {
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/admin/login";
        return;
      }

      const response = await fetch(`/api/admin/partners/${params.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const result = await response.json();

      if (result.success) {
        setPartner(result.data);
      }
    }

    load();
  }, [params.id]);

  if (!partner) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        Loading...
      </main>
    );
  }

  async function patchPartner(updates: Record<string, unknown>) {
    const token = await getAccessToken();

    const response = await fetch(`/api/admin/partners/${partner.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    return response.json();
  }

  async function handleSave() {
    setSaving(true);

    const result = await patchPartner({
      status: partner.status,
      internal_notes: partner.internal_notes,
      subscription_start_date: partner.subscription_start_date || null,
      subscription_end_date: partner.subscription_end_date || null,
      payment_amount: partner.payment_amount || null,
    });

    setSaving(false);
    alert(result.success ? "Saved!" : "Error saving — please try again.");
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete application from "${partner.company_name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const token = await getAccessToken();

    const response = await fetch(`/api/admin/partners/${partner.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();

    if (result.success) {
      router.push("/admin/affiliates");
    } else {
      alert("Could not delete — please try again.");
    }
  }

  // =========================================================
  // MARK PAYMENT SENT — non manda nessuna email (il pagamento lo
  // gestisce l'admin manualmente fuori dal sistema, es. link Stripe
  // condiviso a mano o bonifico), registra solo che e' stato inviato.
  // =========================================================

  async function handleMarkPaymentSent() {
    setMarkingPaymentSent(true);

    const nowIso = new Date().toISOString();

    const result = await patchPartner({
      payment_status: "payment_sent",
      payment_sent_at: nowIso,
    });

    setMarkingPaymentSent(false);

    if (result.success) {
      setPartner((prev: any) => ({ ...prev, payment_status: "payment_sent", payment_sent_at: nowIso }));
    } else {
      alert("Could not update — please try again.");
    }
  }

  // =========================================================
  // ACTIVATE SUBSCRIPTION — da chiamare dopo aver ricevuto il
  // pagamento reale. Imposta payment_status=paid e le date oggi ->
  // +1 anno di default (poi modificabili a mano nei campi sotto e
  // salvate con "Save changes").
  // =========================================================

  async function handleActivateSubscription() {
    setActivatingSubscription(true);

    const start = new Date();
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);

    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);

    const result = await patchPartner({
      payment_status: "paid",
      subscription_start_date: startDate,
      subscription_end_date: endDate,
    });

    setActivatingSubscription(false);

    if (result.success) {
      setPartner((prev: any) => ({
        ...prev,
        payment_status: "paid",
        subscription_start_date: startDate,
        subscription_end_date: endDate,
      }));
    } else {
      alert("Could not activate subscription — please try again.");
    }
  }

  async function handleSendContract() {
    const confirmed = window.confirm(
      `Send the contract PDF to ${partner.email}?`
    );

    if (!confirmed) return;

    setSendingContract(true);

    const token = await getAccessToken();

    const response = await fetch(`/api/admin/partners/${partner.id}/send-contract`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();

    setSendingContract(false);

    if (result.success) {
      setPartner((prev: any) => ({ ...prev, contract_sent_at: result.contractSentAt }));
      alert("Contract sent!");
    } else {
      alert(result.error || "Could not send the contract — please try again.");
    }
  }

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
      <button
        onClick={() => router.push("/admin/affiliates")}
        className="text-sm text-white/40 hover:text-white transition-colors mb-8"
      >
        ← Back to Affiliates
      </button>

      <div className="flex items-center gap-5 mb-10">
        <img src="/logo-white.png" alt="PV" className="h-14 w-auto" />
        <div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">
            {partner.company_name}
          </h1>
          <p className="text-white/50 mt-2">
            {partner.contact_name} · {partner.email}
          </p>
        </div>
      </div>

      {/* =================================================
          APPLICATION — tutti i dati raccolti dal wizard, read-only
          ================================================= */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 text-white">
        <h2 className="text-lg font-medium mb-4">Application details</h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-white/40">Category</dt>
            <dd>{partner.category || "—"}</dd>
          </div>
          <div>
            <dt className="text-white/40">Plan interest</dt>
            <dd>{PLAN_LABELS[partner.plan_interest] || partner.plan_interest}</dd>
          </div>
          <div>
            <dt className="text-white/40">Phone</dt>
            <dd>{partner.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-white/40">Website</dt>
            <dd className="break-words">{partner.website || "—"}</dd>
          </div>
          <div>
            <dt className="text-white/40">Instagram / Facebook</dt>
            <dd className="break-words">{partner.instagram || "—"}</dd>
          </div>
          <div>
            <dt className="text-white/40">Submitted</dt>
            <dd>{new Date(partner.created_at).toLocaleString("en-GB")}</dd>
          </div>
        </dl>

        <JsonbSection title="Business profile" data={partner.profile} />
        <JsonbSection title="Category details" data={partner.details} />
        <JsonbSection title="Booking" data={partner.booking} />
        <JsonbSection title="Materials" data={partner.materials} />

        {partner.message && (
          <div className="mt-6 pt-6 border-t border-white/[0.08]">
            <p className="text-white/40 text-sm mb-2">Message</p>
            <p className="text-sm whitespace-pre-wrap">{partner.message}</p>
          </div>
        )}

        {partner.consent_full_name && (
          <div className="mt-6 pt-6 border-t border-white/[0.08]">
            <p className="text-white/40 text-sm">
              Consent accepted by <strong>{partner.consent_full_name}</strong>
            </p>
          </div>
        )}
      </div>

      {/* =================================================
          PAYMENT & SUBSCRIPTION
          ================================================= */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 text-white">
        <h2 className="text-lg font-medium mb-4">Payment &amp; subscription</h2>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={partner.payment_status}
            onChange={(e) => setPartner({ ...partner, payment_status: e.target.value })}
            className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-black">
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleMarkPaymentSent}
            disabled={markingPaymentSent}
            className="text-xs px-3 py-2.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          >
            {markingPaymentSent ? "Saving..." : "✉ Mark payment sent"}
          </button>

          <button
            onClick={handleActivateSubscription}
            disabled={activatingSubscription}
            className="text-xs px-3 py-2.5 rounded-full border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 transition-all disabled:opacity-50"
          >
            {activatingSubscription ? "Activating..." : "✓ Activate subscription (today → +1 year)"}
          </button>

          {partner.payment_sent_at && (
            <span className="text-xs px-2.5 py-1 rounded-full border border-white/15 text-white/50">
              Payment sent {new Date(partner.payment_sent_at).toLocaleString("en-GB")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/40 mb-2">Payment amount (€)</label>
            <input
              type="number"
              value={partner.payment_amount ?? ""}
              onChange={(e) => setPartner({ ...partner, payment_amount: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/40 mb-2">Subscription start</label>
            <input
              type="date"
              value={partner.subscription_start_date || ""}
              onChange={(e) => setPartner({ ...partner, subscription_start_date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/40 mb-2">Subscription end</label>
            <input
              type="date"
              value={partner.subscription_end_date || ""}
              onChange={(e) => setPartner({ ...partner, subscription_end_date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
            />
          </div>
        </div>
      </div>

      {/* =================================================
          CONTRACT
          ================================================= */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 text-white">
        <h2 className="text-lg font-medium mb-4">Contract</h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSendContract}
            disabled={sendingContract}
            className="px-5 py-3 rounded-xl bg-white text-black font-medium disabled:opacity-50"
          >
            {sendingContract ? "Sending..." : "📄 Send contract"}
          </button>

          {partner.contract_sent_at && (
            <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-400/30 text-emerald-400 bg-emerald-400/10">
              Sent {new Date(partner.contract_sent_at).toLocaleString("en-GB")}
            </span>
          )}
        </div>

        <p className="text-white/30 text-sm mt-3">
          Generates a PDF filled with this application's data (business,
          plan, subscription dates) and emails it to {partner.email}.
          Acceptance is click-wrap — completing payment counts as accepting
          the attached terms. Clause text lives in
          src/lib/pdf/partnerContractTerms.ts — currently placeholder,
          needs legal review before real use.
        </p>
      </div>

      {/* =================================================
          INTERNAL NOTES
          ================================================= */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 text-white">
        <h2 className="text-lg font-medium mb-4">Internal notes</h2>

        <textarea
          value={partner.internal_notes || ""}
          onChange={(e) => setPartner({ ...partner, internal_notes: e.target.value })}
          rows={5}
          placeholder="Not visible to the operator — call notes, follow-ups, context for the team..."
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none resize-none"
        />
      </div>

      {/* =================================================
          ACTIONS
          ================================================= */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleDelete}
          className="px-5 py-3 rounded-xl border border-red-400/20 text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          Delete application
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-3 rounded-xl bg-white text-black font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
