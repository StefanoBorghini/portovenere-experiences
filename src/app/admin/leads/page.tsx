"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  getLeads,
  updateLead,
  deleteLead,
  getEmailVerifiedMap,
  LeadStatus,
} from "@/lib/supabase/leadRepository";

// =========================================================
// STATUS OPTIONS — stesso ordine mostrato nei filtri e nel
// select di dettaglio, cosi' restano sempre coerenti.
// =========================================================

const STATUS_OPTIONS: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "text-blue-400",
  contacted: "text-amber-400",
  qualified: "text-purple-400",
  won: "text-emerald-400",
  lost: "text-red-400",
};

export default function AdminLeadsPage() {
  const router = useRouter();

  const [leads, setLeads] = useState<any[]>([]);
  const [emailVerifiedMap, setEmailVerifiedMap] = useState<
    Record<string, boolean>
  >({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  // Evita doppi click mentre una richiesta e' in corso, per riga
  // (stesso pattern di togglingIds in admin/experiences).
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

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

      const [data, verifiedMap] = await Promise.all([
        getLeads(),
        getEmailVerifiedMap(),
      ]);

      setLeads(data);
      setEmailVerifiedMap(verifiedMap);
      setLoading(false);
    }

    loadData();
  }, []);

  // =======================================================
  // FILTER — ricerca su nome/email + filtro status, applicati
  // insieme (stesso principio del filtro combinato in Experiences)
  // =======================================================

  const filteredLeads = leads.filter((lead) => {
    const query = search.toLowerCase();

    const matchesSearch =
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =======================================================
  // QUICK STATUS CHANGE — aggiornamento ottimistico + rollback,
  // stesso pattern di toggleActive in admin/experiences.
  // =======================================================

  async function changeStatus(lead: any, newStatus: LeadStatus) {
    const previousStatus = lead.status;

    setUpdatingIds((prev) => new Set(prev).add(lead.id));

    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
    );

    const result = await updateLead(lead.id, { status: newStatus });

    if (!result.success) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id ? { ...l, status: previousStatus } : l
        )
      );
      alert("Could not update status — please try again.");
    }

    setUpdatingIds((prev) => {
      const next = new Set(prev);
      next.delete(lead.id);
      return next;
    });
  }

  // =======================================================
  // DELETE — richiede conferma esplicita, poi rimuove dalla
  // lista locale solo se la chiamata ha successo.
  // =======================================================

  async function handleDelete(lead: any) {
    const confirmed = window.confirm(
      `Delete lead "${lead.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const result = await deleteLead(lead.id);

    if (!result.success) {
      alert("Could not delete lead — please try again.");
      return;
    }

    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
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
              Leads
            </h1>
          </div>
        </div>

        <p className="text-white/40 max-w-2xl">
          Every request submitted through the configurator, with status and
          internal notes.
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
            placeholder="Search by name or email..."
            className="w-full md:w-80 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as LeadStatus | "all")
            }
            className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.03] text-white/40 text-sm">
            <tr>
              <th className="px-5 py-4 font-normal">Name</th>
              <th className="px-5 py-4 font-normal">Email</th>
              <th className="px-5 py-4 font-normal">Experiences</th>
              <th className="px-5 py-4 font-normal">Budget</th>
              <th className="px-5 py-4 font-normal">Email</th>
              <th className="px-5 py-4 font-normal">Status</th>
              <th className="px-5 py-4 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-t border-white/[0.06] hover:bg-white/[0.02]"
              >
                <td className="px-5 py-4">
                  <button
                    onClick={() => router.push(`/admin/leads/${lead.id}`)}
                    className="hover:underline"
                  >
                    {lead.name || "—"}
                  </button>
                </td>
                <td className="px-5 py-4 text-white/60">{lead.email}</td>
                <td className="px-5 py-4 text-white/60">
                  {(lead.experiences || []).join(", ")}
                </td>
                <td className="px-5 py-4 text-white/60">{lead.budget}</td>
                <td className="px-5 py-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      emailVerifiedMap[lead.id]
                        ? "border-emerald-400/30 text-emerald-400 bg-emerald-400/10"
                        : "border-amber-400/30 text-amber-400 bg-amber-400/10"
                    }`}
                  >
                    {emailVerifiedMap[lead.id] ? "Confirmed" : "Pending"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <select
                    value={lead.status || "new"}
                    disabled={updatingIds.has(lead.id)}
                    onChange={(e) =>
                      changeStatus(lead, e.target.value as LeadStatus)
                    }
                    className={`bg-transparent border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm ${
                      STATUS_COLORS[lead.status || "new"]
                    }`}
                  >
                    {STATUS_OPTIONS.filter((o) => o.value !== "all").map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="text-white bg-black"
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleDelete(lead)}
                    className="text-red-400/70 hover:text-red-400 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-white/30">
                  No leads match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}