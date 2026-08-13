"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getProposalPayments } from "@/lib/supabase/leadRepository";
import { getCustomPayments, deleteCustomPayment } from "@/lib/supabase/customPaymentRepository";

// =========================================================
// PAYMENTS — vista unificata di tutti i pagamenti Stripe mai
// richiesti: sia le Concierge Fee legate a una proposal (colonne su
// Proposal, vedi getProposalPayments) sia i pagamenti personalizzati
// creati a mano dalla sezione "Custom Payment" (tabella
// custom_payments, vedi getCustomPayments). Le due fonti restano
// separate a livello di dati (nessuna nuova tabella/join creata solo
// per questa pagina), unite solo qui in memoria per la
// visualizzazione. Link/cancellazione riguardano SOLO i pagamenti
// custom: le Concierge Fee non salvano il link (non richiesto) e
// cancellare una riga li' vorrebbe dire toccare la Proposal stessa,
// fuori scope — quindi restano sola lettura.
// =========================================================

type PaymentRow = {
  id: string;
  customPaymentId: string | null;
  type: "concierge_fee" | "custom";
  customerName: string;
  customerEmail: string;
  description: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "expired";
  requestedAt: string;
  paidAt: string | null;
  leadId: string | null;
  checkoutUrl: string | null;
};

const STATUS_OPTIONS: { value: PaymentRow["status"] | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
];

const STATUS_STYLES: Record<PaymentRow["status"], string> = {
  paid: "border-emerald-400/30 text-emerald-400 bg-emerald-400/10",
  pending: "border-amber-400/30 text-amber-400 bg-amber-400/10",
  failed: "border-red-400/30 text-red-400 bg-red-400/10",
  expired: "border-white/20 text-white/50 bg-white/5",
};

function mapProposalStatus(status: string): PaymentRow["status"] {
  if (status === "deposit_paid") return "paid";
  if (status === "failed") return "failed";
  return "pending"; // "payment_requested"
}

export default function AdminPaymentsPage() {
  const router = useRouter();

  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentRow["status"] | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | PaymentRow["type"]>("all");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

      const [proposalPayments, customPayments] = await Promise.all([
        getProposalPayments(),
        getCustomPayments(),
      ]);

      const proposalRows: PaymentRow[] = (proposalPayments || []).map((p: any) => ({
        id: `proposal-${p.lead_id}`,
        customPaymentId: null,
        type: "concierge_fee",
        customerName: p.proposal_data?.name || "—",
        customerEmail: p.proposal_data?.email || "—",
        description: `Concierge Fee (${p.concierge_fee_percentage ?? "—"}%)`,
        amount: Number(p.concierge_fee_amount || 0),
        status: mapProposalStatus(p.payment_status),
        requestedAt: p.created_at,
        paidAt: p.paid_at,
        leadId: p.lead_id,
        checkoutUrl: null,
      }));

      const customRows: PaymentRow[] = (customPayments || []).map((c: any) => ({
        id: `custom-${c.id}`,
        customPaymentId: c.id,
        type: "custom",
        customerName: c.customer_name || "—",
        customerEmail: c.customer_email || "—",
        description: c.description || "Custom payment",
        amount: Number(c.amount || 0),
        status: c.status,
        requestedAt: c.created_at,
        paidAt: c.paid_at,
        leadId: c.linked_lead_id,
        checkoutUrl: c.checkout_url || null,
      }));

      const merged = [...proposalRows, ...customRows].sort(
        (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );

      setRows(merged);
      setLoading(false);
    }

    loadData();
  }, []);

  const filteredRows = rows.filter((row) => {
    const query = search.toLowerCase();

    const matchesSearch =
      row.customerName.toLowerCase().includes(query) ||
      row.customerEmail.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    const matchesType = typeFilter === "all" || row.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  async function handleDelete(row: PaymentRow) {
    if (!row.customPaymentId) return;

    const confirmed = window.confirm(
      `Delete this custom payment for ${row.customerName}? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingIds((prev) => new Set(prev).add(row.id));

    const result = await deleteCustomPayment(row.customPaymentId);

    if (!result.success) {
      alert("Could not delete payment — please try again.");
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
      return;
    }

    setRows((prev) => prev.filter((r) => r.id !== row.id));
  }

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
          Payments
        </h1>
        <p className="text-white/40 max-w-2xl mt-4">
          Every payment ever requested — Concierge Fees from proposals and
          custom payments sent manually — with its current status.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full md:w-80 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentRow["status"] | "all")}
          className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="text-white bg-black">
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | PaymentRow["type"])}
          className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
        >
          <option value="all" className="text-white bg-black">All types</option>
          <option value="concierge_fee" className="text-white bg-black">Concierge Fee</option>
          <option value="custom" className="text-white bg-black">Custom</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/[0.08] overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/[0.03] text-white/40 text-sm">
            <tr>
              <th className="px-5 py-4 font-normal">Customer</th>
              <th className="px-5 py-4 font-normal">Type</th>
              <th className="px-5 py-4 font-normal">Description</th>
              <th className="px-5 py-4 font-normal">Amount</th>
              <th className="px-5 py-4 font-normal">Status</th>
              <th className="px-5 py-4 font-normal">Requested</th>
              <th className="px-5 py-4 font-normal">Paid</th>
              <th className="px-5 py-4 font-normal">Link</th>
              <th className="px-5 py-4 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                <td className="px-5 py-4">
                  {row.leadId ? (
                    <button
                      onClick={() => router.push(`/admin/leads/${row.leadId}`)}
                      className="hover:underline"
                    >
                      {row.customerName}
                    </button>
                  ) : (
                    row.customerName
                  )}
                  <div className="text-white/40 text-sm">{row.customerEmail}</div>
                </td>
                <td className="px-5 py-4 text-white/60">
                  {row.type === "concierge_fee" ? "Concierge Fee" : "Custom"}
                </td>
                <td className="px-5 py-4 text-white/60">{row.description}</td>
                <td className="px-5 py-4 text-white/60">€{row.amount.toLocaleString("en-US")}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[row.status]}`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-4 text-white/60">
                  {new Date(row.requestedAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-white/60">
                  {row.paidAt ? new Date(row.paidAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-4">
                  {row.checkoutUrl ? (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(row.checkoutUrl!);
                        setCopiedId(row.id);
                      }}
                      className="text-xs px-2.5 py-1 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                    >
                      {copiedId === row.id ? "Copied ✓" : "Copy link"}
                    </button>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {row.customPaymentId && (
                    <button
                      onClick={() => handleDelete(row)}
                      disabled={deletingIds.has(row.id)}
                      className="text-red-400/70 hover:text-red-400 text-sm disabled:opacity-50"
                    >
                      {deletingIds.has(row.id) ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-white/30">
                  No payments match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
