"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// =========================================================
// STATUS OPTIONS — stesso principio di admin/leads: un solo posto
// per i filtri, sempre coerente con i valori ammessi lato DB (vedi
// supabase-migrations/2026_partner_applications_payment.sql).
// =========================================================

const PAYMENT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All payment statuses" },
  { value: "pending", label: "Pending" },
  { value: "payment_sent", label: "Payment sent" },
  { value: "paid", label: "Paid" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "text-white/50",
  payment_sent: "text-amber-400",
  paid: "text-emerald-400",
  expired: "text-red-400",
  cancelled: "text-red-400/70",
};

const PLAN_LABELS: Record<string, string> = {
  base: "Base",
  premium: "Premium",
  signature: "Signature",
  not_sure: "Not sure",
};

export default function AdminAffiliatesPage() {
  const router = useRouter();

  const [partners, setPartners] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

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

      const response = await fetch("/api/admin/partners", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const result = await response.json();

      setPartners(result.success ? result.data : []);
      setLoading(false);
    }

    loadData();
  }, []);

  const filteredPartners = partners.filter((partner) => {
    const query = search.toLowerCase();

    const matchesSearch =
      partner.company_name?.toLowerCase().includes(query) ||
      partner.email?.toLowerCase().includes(query) ||
      partner.contact_name?.toLowerCase().includes(query);

    const matchesPayment =
      paymentFilter === "all" || partner.payment_status === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  async function handleDelete(partner: any) {
    const confirmed = window.confirm(
      `Delete application from "${partner.company_name}"? This cannot be undone.`
    );

    if (!confirmed || !supabase) return;

    setDeletingIds((prev) => new Set(prev).add(partner.id));

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(`/api/admin/partners/${partner.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token || ""}` },
    });

    const result = await response.json();

    if (result.success) {
      setPartners((prev) => prev.filter((p) => p.id !== partner.id));
    } else {
      alert("Could not delete — please try again.");
    }

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(partner.id);
      return next;
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo-white.png" alt="PV" className="h-25 w-auto" />
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight">
              Affiliates
            </h1>
          </div>
        </div>

        <p className="text-white/40 max-w-2xl">
          Every application submitted through /become-a-partner, with
          payment status and subscription dates.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <button
          onClick={async () => {
            if (!supabase) return;
            await supabase.auth.signOut();
            window.location.href = "/admin/login";
          }}
          className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
        >
          Logout
        </button>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business, contact or email..."
            className="w-full md:w-80 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
          />

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-black">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/[0.03] text-white/40 text-sm">
            <tr>
              <th className="px-5 py-4 font-normal">Business</th>
              <th className="px-5 py-4 font-normal">Contact</th>
              <th className="px-5 py-4 font-normal">Category</th>
              <th className="px-5 py-4 font-normal">Plan</th>
              <th className="px-5 py-4 font-normal">Payment</th>
              <th className="px-5 py-4 font-normal">Subscription ends</th>
              <th className="px-5 py-4 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.map((partner) => (
              <tr
                key={partner.id}
                className="border-t border-white/[0.06] hover:bg-white/[0.02]"
              >
                <td className="px-5 py-4">
                  <button
                    onClick={() => router.push(`/admin/affiliates/${partner.id}`)}
                    className="hover:underline"
                  >
                    {partner.company_name || "—"}
                  </button>
                </td>
                <td className="px-5 py-4 text-white/60">
                  {partner.contact_name}
                  <div className="text-white/30 text-sm">{partner.email}</div>
                </td>
                <td className="px-5 py-4 text-white/60">{partner.category}</td>
                <td className="px-5 py-4 text-white/60">
                  {PLAN_LABELS[partner.plan_interest] || partner.plan_interest}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border border-white/10 ${
                      PAYMENT_STATUS_COLORS[partner.payment_status] || "text-white/50"
                    }`}
                  >
                    {partner.payment_status}
                  </span>
                </td>
                <td className="px-5 py-4 text-white/60">
                  {partner.subscription_end_date || "—"}
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleDelete(partner)}
                    disabled={deletingIds.has(partner.id)}
                    className="text-red-400/70 hover:text-red-400 text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredPartners.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-white/30">
                  No affiliates match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
