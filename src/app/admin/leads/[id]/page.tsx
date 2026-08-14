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
  restartProposalTimer,
  LeadStatus,
} from "@/lib/supabase/leadRepository";

import { getFullExperiences } from "@/lib/supabase/experienceRepository";
import { getEnhancements } from "@/lib/supabase/enhancementRepository";

import {
  getConciergeOperatorStatus,
  updateConciergeOperatorStatus,
  CONCIERGE_OPERATOR_STATUS_OPTIONS,
} from "@/lib/supabase/conciergeRepository";

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

  // Stato separato per il bottone "Restart Timer", cosi' non si
  // confonde con il salvataggio generale del lead (saving).
  const [restartingTimer, setRestartingTimer] = useState(false);

  // Stato separato per il bottone "Send Reminder Now" — stesso
  // principio del restartingTimer, nessuna interferenza con gli
  // altri bottoni della pagina.
  const [sendingReminder, setSendingReminder] = useState(false);

  // Stato separato per il bottone "Request Payment" — stesso
  // principio di restartingTimer/sendingReminder.
  const [requestingPayment, setRequestingPayment] = useState(false);

  // Righe di concierge_operator_status per questo lead — caricate solo
  // a Concierge Fee pagata (vedi load() sotto), editate nella sezione
  // "Operator coordination". savingRowId identifica quale riga sta
  // salvando, per un indicatore per-riga invece che globale.
  const [operatorStatusRows, setOperatorStatusRows] = useState<any[]>([]);
  const [savingRowId, setSavingRowId] = useState<string | null>(null);

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

        // Concierge coordination esiste solo dopo che la fee e' stata
        // pagata (payment_status==='deposit_paid', seminata dal webhook
        // Stripe) — prima di quel momento la tabella non ha righe per
        // questo lead, niente da caricare.
        if (relatedProposal?.payment_status === "deposit_paid") {
          const rows = await getConciergeOperatorStatus(
            data.id,
            session.access_token
          );
          setOperatorStatusRows(rows);
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

  // =========================================================
  // RESTART TIMER — rimanda expires_at a 48h da ora sulla
  // proposal collegata. Aggiorna anche lo stato locale, cosi'
  // il countdown mostrato qui si allinea subito senza dover
  // ricaricare la pagina.
  // =========================================================

  async function handleRestartTimer() {
    if (!proposal) return;

    const confirmed = window.confirm(
      "Restart the 48h timer for this proposal? The client will get a fresh 48 hours from right now."
    );

    if (!confirmed) return;

    setRestartingTimer(true);

    const result = await restartProposalTimer(lead.id);

    setRestartingTimer(false);

    if (result.success) {
      setProposal((prev: any) => ({
        ...prev,
        expires_at: result.expiresAt,
      }));
      alert("Timer restarted — 48 fresh hours from now.");
    } else {
      alert("Could not restart the timer — please try again.");
    }
  }

  // =========================================================
  // SEND REMINDER NOW — visibile ogni volta che la mail non e'
  // ancora confermata. Due casi gestiti dalla route dietro le
  // quinte:
  // - se verification_sent_at e' gia' valorizzato, manda il
  //   prossimo reminder in sequenza (stage attuale + 1, saturo a 3)
  // - se verification_sent_at e' vuoto (il cliente non ha mai
  //   cliccato "Request Private Booking"), manda la mail INIZIALE
  //   vera e propria, non un reminder di qualcosa mai partito
  // Chiama direttamente la route API (non un repository) perche'
  // l'invio email richiede il server, non puo' essere una semplice
  // chiamata Supabase come updateLead/deleteLead.
  // =========================================================

  async function handleSendReminder() {
    if (!proposal) return;

    const confirmed = window.confirm(
      `Send a reminder email to ${lead.email} right now?`
    );

    if (!confirmed) return;

    setSendingReminder(true);

    try {

      if (!supabase) {
        alert("Supabase not configured");
        setSendingReminder(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/admin/send-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ leadId: lead.id }),
      });

      const data = await response.json();

      setSendingReminder(false);

      if (data.success) {
        alert(
          data.stage
            ? `Reminder sent (stage ${data.stage} of 3).`
            : "Confirmation email sent."
        );
        setProposal((prev: any) => ({
          ...prev,
          verification_sent_at: prev.verification_sent_at || new Date().toISOString(),
          reminder_stage: Math.max(prev.reminder_stage || 0, data.stage || 0),
        }));
      } else {
        alert(data.error || "Could not send the reminder — please try again.");
      }

    } catch (err) {
      console.error("send-reminder failed:", err);
      setSendingReminder(false);
      alert("Could not send the reminder — please try again.");
    }
  }

  // =========================================================
  // REQUEST CONCIERGE FEE — unico punto in cui parte davvero un
  // pagamento (mai automatico su "Prenota Ora"): calcola la Concierge
  // Fee (10% fisso) sul totale esperienze server-side, crea la Stripe
  // Checkout Session e manda al cliente il link. Il cliente paga SOLO
  // questa commissione qui — le esperienze restano da pagare
  // direttamente a ciascun operatore, fuori da questo pagamento.
  // Visibile solo quando l'email e' gia' confermata e la fee non e'
  // gia' stata pagata — vedi condizione di rendering piu' sotto.
  // =========================================================

  async function handleRequestPayment() {
    if (!proposal) return;

    const confirmed = window.confirm(
      `Send a Concierge Fee payment link to ${lead.email}?`
    );

    if (!confirmed) return;

    setRequestingPayment(true);

    try {

      if (!supabase) {
        alert("Supabase not configured");
        setRequestingPayment(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/admin/request-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ leadId: lead.id }),
      });

      const data = await response.json();

      setRequestingPayment(false);

      if (data.success) {
        alert(`Concierge Fee payment link sent (€${data.feeAmount}, ${data.feePercentage}%).`);
        setProposal((prev: any) => ({
          ...prev,
          payment_status: "payment_requested",
          concierge_fee_amount: data.feeAmount,
          concierge_fee_percentage: data.feePercentage,
        }));
      } else {
        alert(data.error || "Could not request payment — please try again.");
      }

    } catch (err) {
      console.error("request-payment failed:", err);
      setRequestingPayment(false);
      alert("Could not request payment — please try again.");
    }
  }

  // =========================================================
  // OPERATOR COORDINATION — aggiorna una riga di
  // concierge_operator_status (stato/operatore/note) dalla sezione
  // omonima piu' sotto, visibile solo a Concierge Fee pagata. Salvataggio
  // per-riga immediato (non serve un batch save: le righe esistono gia',
  // seminate dal webhook Stripe, qui e' solo update).
  // =========================================================

  async function handleUpdateOperatorStatusRow(
    id: string,
    updates: { status?: string; notes?: string | null; item_operator_name?: string | null }
  ) {
    if (!supabase) return;

    setSavingRowId(id);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const result = await updateConciergeOperatorStatus(
      id,
      updates,
      session?.access_token || ""
    );

    setSavingRowId(null);

    if (result.success) {
      setOperatorStatusRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
      );
    } else {
      alert("Could not save — please try again.");
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
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <p className="text-white/40 text-sm">Linked proposal</p>
              
                <a href={`/results/proposal/${proposal.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline hover:text-white/70"
              
                >/{proposal.slug}
              </a>

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

              {proposal.expires_at && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-white/15 text-white/50">
                  Expires{" "}
                  {new Date(proposal.expires_at).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              )}

              {/* RESTART TIMER — rimanda la scadenza a 48h da ora */}
              <button
                onClick={handleRestartTimer}
                disabled={restartingTimer}
                className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
              >
                {restartingTimer ? "Restarting..." : "⟳ Restart Timer (48h)"}
              </button>

              {/* SEND REMINDER NOW — visibile ogni volta che la mail
                  non e' ancora confermata, anche se il cliente non ha
                  mai cliccato "Request Private Booking" (in quel caso
                  manda la mail iniziale vera, non un reminder) */}
              {!proposal.email_verified && (
                <button
                  onClick={handleSendReminder}
                  disabled={sendingReminder}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  {sendingReminder
                    ? "Sending..."
                    : proposal.verification_sent_at
                      ? `✉ Send Reminder Now (stage ${Math.min((proposal.reminder_stage || 0) + 1, 3)}/3)`
                      : "✉ Send Confirmation Email"}
                </button>
              )}

              {/* REQUEST CONCIERGE FEE — visibile solo dopo che il
                  cliente ha confermato l'email e finche' la fee non e'
                  gia' stata pagata. Mai automatico: e' l'unica azione
                  che fa partire un vero pagamento Stripe — e paga SOLO
                  la commissione Portovenere, non le esperienze. */}
              {proposal.email_verified && proposal.payment_status !== "deposit_paid" && (
                <button
                  onClick={handleRequestPayment}
                  disabled={requestingPayment}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  {requestingPayment
                    ? "Sending..."
                    : proposal.payment_status === "payment_requested"
                      ? "€ Resend Concierge Fee Link"
                      : "€ Request Concierge Fee"}
                </button>
              )}

              {proposal.payment_status === "deposit_paid" && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-400/30 text-emerald-400 bg-emerald-400/10">
                  Concierge Active
                  {proposal.concierge_fee_amount
                    ? ` — €${Number(proposal.concierge_fee_amount).toLocaleString("en-US")} fee (${proposal.concierge_fee_percentage}%)`
                    : ""}
                </span>
              )}
            </div>

            {/* SELECTED EXPERIENCES */}
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
                <ul className="space-y-2 mb-5">
                  {selectedEnhancements.map((enh) => (
                    <li
                      key={enh.id}
                      className="flex items-center justify-between text-sm bg-white/[0.03] rounded-xl px-4 py-3"
                    >
                      <span>{enh.title}</span>
                      <span className="text-white/40">
                        {enh.price_type === "per_person"
                          ? `€${enh.base_price ?? "—"} / person`
                          : `€${enh.base_price ?? "—"}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* TOTAL PRICE — valore gia' calcolato e salvato lato
                client al momento di "Request Private Booking"
                (proposal.total_price), niente da ricalcolare qui.
                Mostrato solo se esiste una selezione confermata,
                altrimenti sarebbe sempre 0 e fuorviante. */}
            {(selectedExperiences.length > 0 || selectedEnhancements.length > 0) && (
              <div className="flex items-center justify-between text-sm bg-white/[0.05] rounded-xl px-4 py-3 mt-2 border border-white/[0.08]">
                <span className="text-white/70 font-medium">Total price</span>
                <span className="text-white font-medium">
                  {proposal.total_price
                    ? `€${Number(proposal.total_price).toLocaleString("en-US")}`
                    : "—"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================
          OPERATOR COORDINATION — solo a Concierge Fee pagata. Una riga
          per esperienza/enhancement confermato (seminata dal webhook
          Stripe), editabile qui: operatore (testo libero, non legato
          alla tabella operators/Stripe Connect), stato del workflow
          manuale a 7 step, note libere. Salvataggio per-riga.
          ================================================= */}
      {proposal?.payment_status === "deposit_paid" && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 text-white">
          <h2 className="text-lg font-medium mb-1">Operator coordination</h2>
          <p className="text-white/40 text-sm mb-4">
            Concierge Fee paid — coordinate each experience/enhancement
            directly with its operator. Nothing here is automated.
          </p>

          {operatorStatusRows.length === 0 ? (
            <p className="text-white/30 text-sm">No priced items to coordinate.</p>
          ) : (
            <div className="space-y-3">
              {operatorStatusRows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      {row.item_title || row.item_id}
                    </span>
                    <span className="text-white/40 text-xs">
                      {row.price !== null && row.price !== undefined
                        ? `€${Number(row.price).toLocaleString("en-US")}`
                        : "On request"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      defaultValue={row.item_operator_name || ""}
                      placeholder="Operator name"
                      onBlur={(e) => {
                        if (e.target.value !== (row.item_operator_name || "")) {
                          handleUpdateOperatorStatusRow(row.id, {
                            item_operator_name: e.target.value || null,
                          });
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] outline-none text-sm"
                    />

                    <select
                      value={row.status}
                      onChange={(e) =>
                        handleUpdateOperatorStatusRow(row.id, { status: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] outline-none text-sm"
                    >
                      {CONCIERGE_OPERATOR_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-black">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    defaultValue={row.notes || ""}
                    placeholder="Notes..."
                    rows={2}
                    onBlur={(e) => {
                      if (e.target.value !== (row.notes || "")) {
                        handleUpdateOperatorStatusRow(row.id, {
                          notes: e.target.value || null,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] outline-none text-sm resize-none"
                  />

                  {savingRowId === row.id && (
                    <p className="text-white/30 text-xs mt-1">Saving...</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================
          STATUS + INTERNAL NOTES
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