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
  // Opzionali: non tutte le chiamate esistenti li passano ancora
  // (es. ownerNewProposalTemplate), quindi restano facoltativi
  // per non rompere le chiamate gia' in produzione.
  enhancements?: string[];
  totalPrice?: number;
  notes?: string;
  dashboardUrl?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.portovenere.com";

// Contatti reali — stesso numero gia' usato per il bottone WhatsApp
// nella pagina proposal (ProposalPage.tsx, whatsappUrl).
const CONTACT_WHATSAPP = "+39 348 714 0722";
const CONTACT_WHATSAPP_URL = "https://wa.me/393487140722";
const CONTACT_EMAIL = "info@portovenere.com";

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

function formatPrice(value: number): string {
  return `€${Math.round(value).toLocaleString("en-US")}`;
}

// =========================================================
// RIGA "Contacts" condivisa — WhatsApp + email, mostrata in
// fondo alle mail al cliente.
// =========================================================

function contactsBlock(): string {
  return `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 13px; margin: 0 0 8px;">
        Questions? Reach us directly:
      </p>
      <p style="font-size: 13px; margin: 0;">
        <a href="${CONTACT_WHATSAPP_URL}" style="color: #111; text-decoration: none;">
          WhatsApp: ${CONTACT_WHATSAPP}
        </a>
        &nbsp;·&nbsp;
        <a href="mailto:${CONTACT_EMAIL}" style="color: #111; text-decoration: none;">
          ${CONTACT_EMAIL}
        </a>
      </p>
    </div>
  `;
}

// =========================================================
// RIGHE DI RIEPILOGO condivise — experiences/enhancements/
// guests/budget/dates, + enhancements e totale se disponibili.
// =========================================================

function summaryTable(data: ProposalSummary): string {

  const enhancementsRow =
    data.enhancements && data.enhancements.length > 0
      ? `<tr><td style="padding: 6px 0; color: #666;">Enhancements</td><td>${escapeList(data.enhancements)}</td></tr>`
      : "";

  const totalRow =
    data.totalPrice && data.totalPrice > 0
      ? `<tr><td style="padding: 6px 0; color: #666;">Estimated total</td><td><strong>${formatPrice(data.totalPrice)}</strong></td></tr>`
      : "";

  return `
    <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
      <tr><td style="padding: 6px 0; color: #666;">Experiences</td><td>${escapeList(data.experiences) || "—"}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Atmosphere</td><td>${escapeList(data.moods) || "—"}</td></tr>
      ${enhancementsRow}
      <tr><td style="padding: 6px 0; color: #666;">Guests</td><td>${escapeHtml(data.guests) || "—"}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Budget</td><td>${escapeHtml(data.budget) || "—"}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Dates</td><td>${escapeHtml(data.startDate) || "—"} → ${escapeHtml(data.endDate) || "—"}</td></tr>
      ${totalRow}
    </table>
  `;
}

// ---------------------------------------------------------
// 1. Email al CLIENTE — link di verifica dopo "Request Private Booking"
//
// ARRICCHITA: logo, messaggio personale, riepilogo completo
// (incluse enhancements e totale se disponibili), tempi di
// risposta, contatti. Il bottone porta sempre allo stesso link
// di verifica (/api/verify-email) — resta l'unico modo per far
// scattare email_verified=true — solo il testo e' cambiato per
// riflettere meglio lo scopo ("vedi la tua richiesta" invece di
// "conferma la tua email", che suonava piu' tecnico che curato).
// ---------------------------------------------------------

export function verificationEmailTemplate(data: ProposalSummary, verifyUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">

      <div style="text-align: center; margin-bottom: 24px;">
        <img
          src="${SITE_URL}/logo-white.png"
          alt="Portovenere Experiences"
          style="height: 36px; filter: invert(1);"
        />
      </div>

      <h2 style="font-weight: 300;">Thank you for crafting your experience</h2>
      <p>Hi ${escapeHtml(data.name) || "there"},</p>
      <p>
        Thank you for putting together your private Riviera experience with
        Portovenere Experiences. We've received your request and we're
        already looking forward to making it happen. Here's a summary of
        what you selected:
      </p>

      ${summaryTable(data)}

      <p style="color: #666; font-size: 13px;">
        We typically respond within 24 hours with availability and final
        details.
      </p>

      <p>Please confirm your email address to activate your request.</p>

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
          Confirm my mail
        </a>
      </p>
      <p style="color: #666; font-size: 13px;">
        If you didn't request this, you can safely ignore this email.
      </p>

      ${contactsBlock()}
    </div>
  `;
}

// ---------------------------------------------------------
// 1b. Email al CLIENTE — REMINDER per proposal non confermate
// (12h / 24h / 36h dopo l'invio della mail di verifica, cioe'
// da verification_sent_at — non da created_at, perche' quello
// e' solo il momento in cui la proposal e' stata generata, non
// il momento in cui il cliente ha chiesto il booking).
//
// Riusa lo stesso verifyUrl (stesso token) della mail iniziale,
// e lo stesso riepilogo arricchito — nessuna nuova verifica da
// generare, e' solo un promemoria.
//
// stage: 1 = 12h, 2 = 24h, 3 = 36h — cambia solo tono/urgenza
// del testo, il resto del contenuto e' identico alla mail
// originale cosi' il cliente ritrova lo stesso riepilogo.
// ---------------------------------------------------------

const REMINDER_COPY: Record<number, { subject: string; heading: string; intro: string }> = {
  1: {
    subject: "Your Riviera proposal is waiting for you",
    heading: "Your booking request is still pending",
    intro: "We noticed you haven't confirmed your email yet. Your request is still saved and ready — here's a quick reminder of what you put together:",
  },
  2: {
    subject: "Reminder: confirm your Riviera booking request",
    heading: "Still there? Your request is waiting",
    intro: "Just a gentle nudge — your private Riviera request hasn't been confirmed yet. Take a moment to review it and confirm:",
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

      <div style="text-align: center; margin-bottom: 24px;">
        <img
          src="${SITE_URL}/logo-white.png"
          alt="Portovenere Experiences"
          style="height: 36px; filter: invert(1);"
        />
      </div>

      <h2 style="font-weight: 300;">${copy.heading}</h2>
      <p>Hi ${escapeHtml(data.name) || "there"},</p>
      <p>${copy.intro}</p>

      ${summaryTable(data)}

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
          View my request
        </a>
      </p>
      <p style="color: #666; font-size: 13px;">
        If you didn't request this, you can safely ignore this email.
      </p>

      ${contactsBlock()}
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
//
// ARRICCHITA: questo e' il primo momento in cui esistono davvero
// tutti i dati operativi (enhancement scelti, totale stimato,
// eventuali note) — a differenza di ownerNewProposalTemplate,
// che parte alla creazione della proposal quando questi dati
// sono ancora vuoti. Aggiunto anche il link diretto al dashboard
// admin, oltre a quello alla proposal pubblica.
// ---------------------------------------------------------

export function ownerEmailConfirmedTemplate(data: ProposalSummary) {

  const enhancementsRow =
    data.enhancements && data.enhancements.length > 0
      ? `<tr><td style="padding: 6px 0; color: #666;">Enhancements</td><td>${escapeList(data.enhancements)}</td></tr>`
      : "";

  const totalRow =
    data.totalPrice && data.totalPrice > 0
      ? `<tr><td style="padding: 6px 0; color: #666;">Estimated total</td><td><strong>${formatPrice(data.totalPrice)}</strong></td></tr>`
      : "";

  const notesRow =
    data.notes && data.notes.trim() !== ""
      ? `<tr><td style="padding: 6px 0; color: #666; vertical-align: top;">Notes</td><td>${escapeHtml(data.notes)}</td></tr>`
      : "";

  const dashboardLink =
    data.dashboardUrl
      ? `<p style="margin: 8px 0;">
          <a href="${data.dashboardUrl}" style="color: #111;">
            Open in dashboard →
          </a>
        </p>`
      : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">Email confirmed — booking request is real</h2>
      <p>
        <strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)}) has confirmed their
        email address after requesting a private booking. Here are the full details:
      </p>

      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Experiences</td><td>${escapeList(data.experiences) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Atmosphere</td><td>${escapeList(data.moods) || "—"}</td></tr>
        ${enhancementsRow}
        <tr><td style="padding: 6px 0; color: #666;">Guests</td><td>${escapeHtml(data.guests) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Budget</td><td>${escapeHtml(data.budget) || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Dates</td><td>${escapeHtml(data.startDate) || "—"} → ${escapeHtml(data.endDate) || "—"}</td></tr>
        ${totalRow}
        ${notesRow}
      </table>

      <p style="margin: 24px 0;">
        <a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #111;">
          View public proposal →
        </a>
      </p>
      ${dashboardLink}
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

// ---------------------------------------------------------
// 6. Email al PROPRIETARIO — nuova candidatura da /become-a-partner.
// Il wizard raccoglie 4 blocchi liberi (profile/details/booking/
// materials, tanti campi eterogenei e facoltativi) oltre ai campi
// fissi — jsonbSection() li rende come tabella solo se non vuoti,
// cosi' la mail non mostra sezioni vuote per chi ha saltato dei passi.
// ---------------------------------------------------------

interface PartnerApplicationSummary {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  category: string;
  profile?: Record<string, unknown>;
  details?: Record<string, unknown>;
  booking?: Record<string, unknown>;
  materials?: Record<string, unknown>;
  consentFullName?: string;
  planInterest: string;
  website?: string;
  instagram?: string;
  message?: string;
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function formatJsonbValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value) && value.length > 0) return value.join(", ");
  return null;
}

// Tabella generica chiave/valore per un blocco jsonb (profile/details/
// booking/materials) — con un titolo di sezione sopra se ci sono righe
// da mostrare, altrimenti stringa vuota (niente sezioni vuote in mail).
function jsonbSection(title: string, data: Record<string, unknown> | undefined): string {

  if (!data) return "";

  const rows = Object.entries(data)
    .map(([key, value]) => [key, formatJsonbValue(value)] as [string, string | null])
    .filter(([, value]) => value !== null) as [string, string][];

  if (rows.length === 0) return "";

  return `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(title)}</p>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        ${rows
          .map(
            ([key, value]) =>
              `<tr><td style="padding: 6px 0; color: #666; width: 45%;">${escapeHtml(humanizeKey(key))}</td><td>${escapeHtml(value)}</td></tr>`
          )
          .join("")}
      </table>
    </div>
  `;
}

export function ownerNewPartnerApplicationTemplate(data: PartnerApplicationSummary) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">New partner application</h2>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666;">Business</td><td>${escapeHtml(data.companyName)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Contact</td><td>${escapeHtml(data.contactName)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Email</td><td>${escapeHtml(data.email)}</td></tr>
        ${data.phone ? `<tr><td style="padding: 6px 0; color: #666;">Phone</td><td>${escapeHtml(data.phone)}</td></tr>` : ""}
        <tr><td style="padding: 6px 0; color: #666;">Category</td><td>${escapeHtml(data.category)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Plan interest</td><td>${escapeHtml(data.planInterest)}</td></tr>
        ${data.website ? `<tr><td style="padding: 6px 0; color: #666;">Website</td><td>${escapeHtml(data.website)}</td></tr>` : ""}
        ${data.instagram ? `<tr><td style="padding: 6px 0; color: #666;">Instagram/Facebook</td><td>${escapeHtml(data.instagram)}</td></tr>` : ""}
        ${data.consentFullName ? `<tr><td style="padding: 6px 0; color: #666;">Consent signed by</td><td>${escapeHtml(data.consentFullName)}</td></tr>` : ""}
      </table>

      ${jsonbSection("Business profile", data.profile)}
      ${jsonbSection("Category details", data.details)}
      ${jsonbSection("Booking", data.booking)}
      ${jsonbSection("Materials", data.materials)}

      ${
        data.message
          ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
               <p style="color: #666; font-size: 13px; margin: 0 0 8px;">Message</p>
               <p style="font-size: 14px; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
             </div>`
          : ""
      }

      <p style="margin: 24px 0;">
        <a href="mailto:${escapeHtml(data.email)}" style="color: #111;">
          Reply to ${escapeHtml(data.contactName)} →
        </a>
      </p>
    </div>
  `;
}

// ---------------------------------------------------------
// 7. Email all'OPERATORE — invio del contratto dopo l'accettazione
// del pagamento (vedi /admin/affiliates/[id], bottone "Invia
// contratto"). Il PDF vero e proprio va allegato da chi chiama
// sendEmail() (vedi API route /api/admin/send-partner-contract),
// questo template e' solo il corpo della mail. Nessun link di
// firma elettronica: l'accettazione e' "click-wrap" — pagare
// l'abbonamento vale come accettazione delle condizioni allegate,
// come da conferma esplicita del cliente.
// ---------------------------------------------------------

interface PartnerContractSummary {
  companyName: string;
  contactName: string;
  planLabel: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
}

export function partnerContractEmailTemplate(data: PartnerContractSummary) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">

      <div style="text-align: center; margin-bottom: 24px;">
        <img
          src="${SITE_URL}/logo-white.png"
          alt="Portovenere Experiences"
          style="height: 36px; filter: invert(1);"
        />
      </div>

      <h2 style="font-weight: 300;">Welcome aboard, ${escapeHtml(data.companyName)}</h2>
      <p>Hi ${escapeHtml(data.contactName) || "there"},</p>
      <p>
        Thank you for joining Portovenere Experience as a partner on the
        <strong>${escapeHtml(data.planLabel)}</strong> plan. Your subscription
        agreement is attached to this email as a PDF.
      </p>

      ${
        data.subscriptionStart && data.subscriptionEnd
          ? `<table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
               <tr><td style="padding: 6px 0; color: #666;">Subscription start</td><td>${escapeHtml(data.subscriptionStart)}</td></tr>
               <tr><td style="padding: 6px 0; color: #666;">Subscription end</td><td>${escapeHtml(data.subscriptionEnd)}</td></tr>
             </table>`
          : ""
      }

      <p style="color: #666; font-size: 13px;">
        By completing payment for your subscription, you confirm acceptance
        of the terms outlined in the attached agreement.
      </p>

      ${contactsBlock()}
    </div>
  `;
}