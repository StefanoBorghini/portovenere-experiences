"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  getLeadById,
  updateLead,
  deleteLead,
  getProposalForLead,
  resolveLeadSelection,
  LeadStatus,
} from "@/lib/supabase/leadRepository";

import { getFullExperiences } from "@/lib/supabase/experienceRepository";
import { getEnhancements } from "@/lib/supabase/enhancementRepository";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Esperienze/enhancements EFFETTIVAMENTE scelti dal cliente
  // (risolti dagli ID salvati in confirmed_selection), non solo
  // le categorie/mood dichiarati nel wizard iniziale.
  const [selectedExperiences, setSelectedExperiences] = useState<any[]>([]);
  const [selectedEnhancements, setSelectedEnhancements] = useState<any[]>([]);

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

      const data = await getLeadById(params.id as string);
      setLead(data);

      if (data) {
        const relatedProposal = await getProposalForLead(data.id);
        setProposal(relatedProposal);

        // Se la proposal esiste ma il cliente non ha ancora fatto
        // una scelta esplicita (confirmed_selection assente perche'
        // non ha ancora confermato l'email), non c'e' nulla da
        // risolvere: le liste restano vuote e la UI lo segnala.
        if (relatedProposal?.confirmed_selection) {
          const [allExperiences, allEnhancements] = await Promise.all([
            getFullExperiences(),
            getEnhancements(),
          ]);

          const { selectedExperiences, selectedEnhancements } =
            resolveLeadSelection(
              relatedProposal,
              allExperiences,
              allEnhancements
            );

          setSelectedExperiences(selectedExperiences);
          setSelectedEnhancements(selectedEnhancements);
        }
      }
    }

    load();
  }, [params.id]);

  if (!lead) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        Loading...
      </main>
    );
  }

  async function handleSave() {
    setSaving(true);

    const result = await updateLead(lead.id, {
      status: lead.status,
      internal_notes: lead.internal_notes,
    });

    setSaving(false);

    if (result.success) {
      alert("Lead saved!");
    } else {
      alert("Error saving lead");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete lead "${lead.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const result = await deleteLead(lead.id);

    if (result.success) {
      router.push("/admin/leads");
    } else {
      alert("Could not delete lead — please try again.");
    }
  }

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
      <button
        onClick={() => router.push("/admin/leads")}
        className="text-sm text-white/40 hover:text-white transition-colors mb-8"
      >
        ← Back to Leads
      </button>

      <div className="flex items-center gap-5 mb-10">
        <img src="/logo-white.png" alt="PV" className="h-14 w-auto" />
        <div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">
            {lead.name}
          </h1>
          <p className="text-white/50 mt-2">{lead.email}</p>
        </div>
      </div>

      {/* =================================================
          REQUEST SUMMARY — dati raccolti dal wizard, read-only
          ================================================= */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 text-white">
        <h2 className="text-lg font-medium mb-4">Request summary</h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-white/40">Experiences</dt>
            <dd>{(lead.experiences || []).join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-white/40">Moods</dt>
            <dd>{(lead.moods || []).join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-white/40">Guests</dt>
            <dd>{lead.guests || "—"}</dd>
          </div>
          <div>
            <dt className="text-white/40">Budget</dt>
            <dd>{lead.budget || "—"}</dd>
          </div>
          <div>
            <dt className="text-white/40">Dates</dt>
            <dd>
              {lead.start_date} → {lead.end_date}
            </dd>
          </div>
          <div>
            <dt className="text-white/40">Children</dt>
            <dd>
              {lead.traveling_with_children
                ? `Yes (${lead.children ?? "—"})`
                : "No"}
            </dd>
          </div>
        </dl>

        {proposal && (
          <div className="mt-6 pt-6 border-t border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-white/40 text-sm">Linked proposal</p>
              <a
                href={`/results/proposal/${proposal.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline hover:text-white/70"
              >
                /{proposal.slug}
              </a>

              {/* EMAIL CONFIRMED — badge visivo, non solo testo,
                  cosi' si vede a colpo d'occhio scorrendo la lista
                  dettagli senza dover leggere ogni riga. */}
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  proposal.email_verified
                    ? "border-emerald-400/30 text-emerald-400 bg-emerald-400/10"
                    : "border-amber-400/30 text-amber-400 bg-amber-400/10"
                }`}
              >
                {proposal.email_verified
                  ? "Email confirmed"
                  : "Email not confirmed"}
              </span>
            </div>

            {/* SELECTED EXPERIENCES — le esperienze specifiche scelte
                (con operatore), non solo le categorie dichiarate nel
                wizard sopra. */}
            <p className="text-white/40 text-sm mb-2">
              Selected experiences
            </p>

            {selectedExperiences.length > 0 ? (
              <ul className="space-y-2 mb-5">
                {selectedExperiences.map((exp) => (
                  <li
                    key={exp.id}
                    className="flex items-center justify-between text-sm bg-white/[0.03] rounded-xl px-4 py-3"
                  >
                    <span>{exp.title}</span>
                    <span className="text-white/40">
                      {exp.operator || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/30 text-sm mb-5">
                No confirmed selection yet — the client hasn't verified the
                email or finalized their choice.
              </p>
            )}

            {/* SELECTED ENHANCEMENTS */}
            {selectedEnhancements.length > 0 && (
              <>
                <p className="text-white/40 text-sm mb-2">
                  Selected enhancements
                </p>
                <ul className="space-y-2">
                  {selectedEnhancements.map((enh) => (
                    <li
                      key={enh.id}
                      className="flex items-center justify-between text-sm bg-white/[0.03] rounded-xl px-4 py-3"
                    >
                      <span>{enh.title}</span>
                      <span className="text-white/40">
                        {enh.price_type === "per_person"
                          ? `€${enh.base_price} / person`
                          : `€${enh.base_price}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {/* =================================================
          STATUS + INTERNAL NOTES — gli unici campi editabili
          ================================================= */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 text-white">
        <h2 className="text-lg font-medium mb-4">Status &amp; notes</h2>

        <label className="block text-sm text-white/40 mb-2">Status</label>
        <select
          value={lead.status || "new"}
          onChange={(e) =>
            setLead({ ...lead, status: e.target.value })
          }
          className="w-full mb-5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none"
        >
          {STATUS_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-black"
            >
              {option.label}
            </option>
          ))}
        </select>

        <label className="block text-sm text-white/40 mb-2">
          Internal notes
        </label>
        <textarea
          value={lead.internal_notes || ""}
          onChange={(e) =>
            setLead({ ...lead, internal_notes: e.target.value })
          }
          rows={5}
          placeholder="Not visible to the client — call notes, follow-up reminders, context for the team..."
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
          Delete lead
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