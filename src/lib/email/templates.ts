// =========================================================
// Template email — HTML semplice, coerente con il brand.
// Se vuoi renderli più eleganti in futuro (logo, colori),
// basta arricchire l'HTML qui dentro: la logica di invio
// (sendEmail.ts) non cambia.
// =========================================================

interface ProposalSummary {
  name: string;
  email: string;
  experiences: string[];
  moods: string[];
  guests: string;
  budget: string;
  startDate: string;
  endDate: string;
  slug: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.portovenere.com";

// =========================================================
// SICUREZZA — questi dati arrivano dal lead (nome, email,
// esperienze, ecc.), quindi tecnicamente controllabili da chi
// compila il form (o da chi chiama le API direttamente, dato
// che le RLS permettono l'insert pubblico). Senza questo escape,
// qualcuno potrebbe scrivere HTML/JS vero nel campo "Nome" e
// vederlo eseguito dentro le email che ricevi tu o il cliente.
// Va SEMPRE usato prima di inserire un valore utente nell'HTML.
// =========================================================

function escapeHtml(value: unknown): string {

  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeList(values: string[]): string {
  return values.map(escapeHtml).join(", ");
}

// ---------------------------------------------------------
// 1. Email al CLIENTE — link di verifica dopo "Request Private Booking"
// ---------------------------------------------------------

export function verificationEmailTemplate(data: ProposalSummary, verifyUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">Confirm your booking request</h2>
      <p>Hi ${escapeHtml(data.name) || "there"},</p>
      <p>
        Thanks for requesting your private Riviera experience with
        Portovenere Experiences. Here's a summary of the proposal you're
        confirming:
      </p>

      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Experiences</td><td>${escapeList(data.experiences) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Atmosphere</td><td>${escapeList(data.moods) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guests</td><td>${escapeHtml(data.guests) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Budget</td><td>${escapeHtml(data.budget) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Dates</td><td>${escapeHtml(data.startDate) || "—"} → ${escapeHtml(data.endDate) || "—"}</td></tr>
      </table>

      <p>Please confirm your email address to proceed with your booking request.</p>

      <p style="margin: 32px 0;">
        <a
          href="${verifyUrl}"
          style="
            background: #111;
            color: #fff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 999px;
            font-size: 13px;
            letter-spacing: 1px;
            text-transform: uppercase;
          "
        >
          Confirm my email
        </a>
      </p>
      <p style="color: #666; font-size: 13px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;
}

// ---------------------------------------------------------
// 1b. Email al CLIENTE — REMINDER per proposal non confermate
// (12h / 24h / 36h dopo la creazione). Riusa lo stesso
// verifyUrl (stesso token) della mail iniziale — nessuna
// nuova verifica da generare, e' solo un promemoria.
//
// stage: 1 = 12h, 2 = 24h, 3 = 36h — cambia solo tono/urgenza
// del testo, il resto del contenuto e' identico alla mail
// originale cosi' il cliente ritrova lo stesso riepilogo.
// ---------------------------------------------------------

const REMINDER_COPY: Record<number, { subject: string; heading: string; intro: string }> = {
  1: {
    subject: "Your Riviera proposal is waiting for you",
    heading: "Your booking request is still pending",
    intro: "We noticed you haven't confirmed your email yet. Your proposal is still saved and ready — here's a quick reminder of what you put together:",
  },
  2: {
    subject: "Reminder: confirm your Riviera booking request",
    heading: "Still there? Your proposal is waiting",
    intro: "Just a gentle nudge — your private Riviera proposal hasn't been confirmed yet. Take a moment to review it and confirm:",
  },
  3: {
    subject: "Last reminder: your Riviera proposal request",
    heading: "One last reminder before we close this request",
    intro: "This is our final reminder about your booking request. If you're still interested, please confirm your email to keep it active:",
  },
};

export function reminderEmailTemplate(
  data: ProposalSummary,
  verifyUrl: string,
  stage: 1 | 2 | 3
) {

  const copy = REMINDER_COPY[stage];

  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">${copy.heading}</h2>
      <p>Hi ${escapeHtml(data.name) || "there"},</p>
      <p>${copy.intro}</p>

      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Experiences</td><td>${escapeList(data.experiences) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Atmosphere</td><td>${escapeList(data.moods) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guests</td><td>${escapeHtml(data.guests) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Budget</td><td>${escapeHtml(data.budget) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Dates</td><td>${escapeHtml(data.startDate) || "—"} → ${escapeHtml(data.endDate) || "—"}</td></tr>
      </table>

      <p style="margin: 32px 0;">
        <a
          href="${verifyUrl}"
          style="
            background: #111;
            color: #fff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 999px;
            font-size: 13px;
            letter-spacing: 1px;
            text-transform: uppercase;
          "
        >
          Confirm my email
        </a>
      </p>
      <p style="color: #666; font-size: 13px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;
}

// ---------------------------------------------------------
// 2. Email al PROPRIETARIO (info@portovenere.com) —
//    non appena una proposal viene generata, indipendentemente
//    dal fatto che il cliente richieda o no il booking.
// ---------------------------------------------------------

export function ownerNewProposalTemplate(data: ProposalSummary) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">New proposal generated</h2>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666;">Name</td><td>${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Email</td><td>${escapeHtml(data.email)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Experiences</td><td>${escapeList(data.experiences)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Moods</td><td>${escapeList(data.moods)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guests</td><td>${escapeHtml(data.guests)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Budget</td><td>${escapeHtml(data.budget)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Dates</td><td>${escapeHtml(data.startDate)} → ${escapeHtml(data.endDate)}</td></tr>
      </table>
      <p style="margin: 24px 0;">
        <a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #111;">
          View this proposal →
        </a>
      </p>
    </div>
  `;
}

// ---------------------------------------------------------
// 3. Email al PROPRIETARIO — il cliente ha confermato l'email
// ---------------------------------------------------------

export function ownerEmailConfirmedTemplate(data: ProposalSummary) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">Email confirmed — booking request is real</h2>
      <p>
        <strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)}) has confirmed their
        email address after requesting a private booking.
      </p>
      <p style="margin: 24px 0;">
        <a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #111;">
          View this proposal →
        </a>
      </p>
    </div>
  `;
}

// ---------------------------------------------------------
// 4. Email al PROPRIETARIO — il cliente ha modificato la
//    proposta DOPO aver gia' confermato l'email la prima volta.
//    Non serve una nuova verifica: e' gia' un contatto verificato.
// ---------------------------------------------------------

export function ownerProposalModifiedTemplate(data: ProposalSummary) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">Client modified their proposal</h2>
      <p>
        <strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)}) has changed their
        selection after already confirming their email address.
      </p>
      <p style="margin: 24px 0;">
        <a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #111;">
          View the updated proposal →
        </a>
      </p>
    </div>
  `;
}

// ---------------------------------------------------------
// 5. Email al CLIENTE — conferma delle modifiche, nessuna
//    nuova verifica richiesta (l'ha gia' fatta)
// ---------------------------------------------------------

export function clientChangesConfirmedTemplate(data: ProposalSummary) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">Your changes have been confirmed</h2>
      <p>Hi ${escapeHtml(data.name) || "there"},</p>
      <p>
        We've updated your private Riviera proposal with your latest
        selection, and refreshed your private reservation window.
      </p>
      <p style="margin: 32px 0;">
        <a
          href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}"
          style="
            background: #111;
            color: #fff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 999px;
            font-size: 13px;
            letter-spacing: 1px;
            text-transform: uppercase;
          "
        >
          View your proposal
        </a>
      </p>
    </div>
  `;
}