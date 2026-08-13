"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getLeads } from "@/lib/supabase/leadRepository";

// =========================================================
// CUSTOM PAYMENT — pagamento Stripe ad-hoc, non legato a una
// Proposal generata dal configuratore: cliente inserito a mano,
// importo o fisso o calcolato da prezzo totale + percentuale scelta
// qui dall'admin (a differenza della Concierge Fee, che usa scaglioni
// automatici). Collegamento opzionale a un lead esistente, solo
// informativo — vedi API route per i dettagli di sicurezza sul
// webhook. Dopo l'invio: link mostrato a schermo (copiabile) + email
// automatica al cliente.
// =========================================================

export default function CustomPaymentPage() {

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/admin/login";
        return;
      }

      setLeads(await getLeads());
      setLoading(false);
    }

    loadData();
  }, []);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");

  const [leadSearch, setLeadSearch] = useState("");
  const [linkedLead, setLinkedLead] = useState<any | null>(null);

  const [mode, setMode] = useState<"fixed" | "percentage">("fixed");
  const [fixedAmount, setFixedAmount] = useState("");
  const [referencePrice, setReferencePrice] = useState("");
  const [percentage, setPercentage] = useState("");

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ checkoutUrl: string; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const computedAmount =
    mode === "fixed"
      ? Number(fixedAmount) || 0
      : Math.round(((Number(referencePrice) || 0) * (Number(percentage) || 0)) / 100 * 100) / 100;

  const filteredLeads =
    leadSearch.trim().length === 0
      ? []
      : leads.filter((lead) => {
          const query = leadSearch.toLowerCase();
          return (
            lead.name?.toLowerCase().includes(query) ||
            lead.email?.toLowerCase().includes(query)
          );
        });

  const canSubmit =
    !!customerName.trim() &&
    /\S+@\S+\.\S+/.test(customerEmail) &&
    computedAmount > 0;

  async function handleSubmit() {
    if (!canSubmit || !supabase) return;

    const confirmed = window.confirm(
      `Send a €${computedAmount} payment link to ${customerEmail}?`
    );

    if (!confirmed) return;

    setSending(true);
    setResult(null);

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/admin/create-custom-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone: customerPhone || undefined,
          linkedLeadId: linkedLead?.id,
          description: description || undefined,
          mode,
          amount: mode === "fixed" ? Number(fixedAmount) : undefined,
          referencePrice: mode === "percentage" ? Number(referencePrice) : undefined,
          percentage: mode === "percentage" ? Number(percentage) : undefined,
        }),
      });

      const data = await response.json();

      setSending(false);

      if (data.success) {
        setResult({ checkoutUrl: data.checkoutUrl, amount: data.amount });
      } else {
        alert(data.error || "Could not create payment — please try again.");
      }

    } catch (err) {
      console.error("create-custom-payment failed:", err);
      setSending(false);
      alert("Could not create payment — please try again.");
    }
  }

  function resetForm() {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setDescription("");
    setLeadSearch("");
    setLinkedLead(null);
    setMode("fixed");
    setFixedAmount("");
    setReferencePrice("");
    setPercentage("");
    setResult(null);
    setCopied(false);
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none";
  const cardClass = "rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6";

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <p className="text-white/40">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">

      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight">
          Custom Payment
        </h1>
        <p className="text-white/40 max-w-2xl mt-4">
          Send an ad-hoc Stripe payment link — not tied to any proposal.
          Enter the customer&apos;s details, set an amount, and send it.
        </p>
      </div>

      <div className="max-w-xl">

        <div className={cardClass}>
          <h2 className="text-lg font-medium mb-4">Customer</h2>

          <div className="space-y-4">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className={inputClass}
            />
            <input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Customer email"
              type="email"
              className={inputClass}
            />
            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone (optional — reference only, not used to send anything)"
              type="tel"
              className={inputClass}
            />
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-medium mb-4">Link to an existing lead (optional)</h2>

          {linkedLead ? (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <span className="truncate">{linkedLead.name} — {linkedLead.email}</span>
              <button
                onClick={() => setLinkedLead(null)}
                className="text-white/50 hover:text-white text-sm ml-3 shrink-0"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <input
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder="Search by name or email..."
                className={inputClass}
              />
              {filteredLeads.length > 0 && (
                <div className="mt-2 rounded-xl border border-white/[0.08] overflow-hidden divide-y divide-white/[0.08]">
                  {filteredLeads.slice(0, 6).map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => {
                        setLinkedLead(lead);
                        setLeadSearch("");
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 transition-all truncate"
                    >
                      {lead.name} — {lead.email}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-medium mb-4">Payment</h2>

          <div className="space-y-4">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional — shown on the Stripe checkout page and in the email)"
              className={inputClass}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setMode("fixed")}
                className={`flex-1 px-4 py-3 rounded-xl border text-sm transition-all ${
                  mode === "fixed"
                    ? "border-white bg-white text-black"
                    : "border-white/[0.08] text-white/60 hover:bg-white/5"
                }`}
              >
                Fixed amount
              </button>
              <button
                onClick={() => setMode("percentage")}
                className={`flex-1 px-4 py-3 rounded-xl border text-sm transition-all ${
                  mode === "percentage"
                    ? "border-white bg-white text-black"
                    : "border-white/[0.08] text-white/60 hover:bg-white/5"
                }`}
              >
                Price + percentage
              </button>
            </div>

            {mode === "fixed" ? (
              <input
                value={fixedAmount}
                onChange={(e) => setFixedAmount(e.target.value)}
                placeholder="Amount (€)"
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <input
                  value={referencePrice}
                  onChange={(e) => setReferencePrice(e.target.value)}
                  placeholder="Total price (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                />
                <input
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="Percentage (%)"
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                />
              </div>
            )}

            {computedAmount > 0 && (
              <p className="text-white/50 text-sm">
                Amount to charge: <span className="text-white font-medium">€{computedAmount.toLocaleString("en-US")}</span>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || sending}
          className="px-5 py-3 rounded-xl bg-white text-black font-medium disabled:opacity-50"
        >
          {sending ? "Sending..." : "Create payment & send"}
        </button>

        {result && (
          <div className={`${cardClass} mt-6`}>
            <h2 className="text-lg font-medium mb-2">Payment link created</h2>
            <p className="text-white/50 text-sm mb-4">
              Email sent to {customerEmail}. You can also copy the link below.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                readOnly
                value={result.checkoutUrl}
                className={`${inputClass} text-white/70`}
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.checkoutUrl);
                  setCopied(true);
                }}
                className="px-4 py-3 rounded-xl border border-white/[0.08] hover:bg-white/5 transition-all shrink-0"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>

            <button
              onClick={resetForm}
              className="text-white/50 hover:text-white text-sm"
            >
              Create another payment
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
