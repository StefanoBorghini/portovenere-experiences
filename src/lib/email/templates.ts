// =========================================================
// Template email — HTML semplice, coerente con il brand
// (sfondo nero, bottone bianco a pillola, stesso linguaggio
// visivo scuro del resto del sito).
// =========================================================

import { formatBudgetLabel } from "@/lib/config/experienceTaxonomy";

interface LineItemDetail {
  title: string;
  // null quando la riga non ha un prezzo autonomo da mostrare
  // (es. un enhancement "su richiesta") — meglio uno spazio
  // vuoto che un fuorviante "€0".
  price?: number | null;
}

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
  // Dettaglio con prezzo per riga, calcolato SEMPRE server-side
  // (mai dal client) — quando presenti sostituiscono la riga
  // "Experiences"/"Enhancements" a elenco semplice qui sotto con
  // una tabella prezzo-per-riga.
  experienceDetails?: LineItemDetail[];
  enhancementDetails?: LineItemDetail[];
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

// "On Request" (non "€0" e non uno spazio vuoto, che potrebbe
// leggersi come gratis o incluso nel prezzo) quando la riga non ha
// un prezzo autonomo da mostrare — vedi commento su LineItemDetail.price.
function formatPriceOrBlank(price: number | null | undefined): string {
  return price !== null && price !== undefined ? formatPrice(price) : "On Request";
}

// =========================================================
// TEMA SCURO CONDIVISO — stesso sfondo/bottone di tutto il
// sito (vedi es. craft-your-experience loading screen). Un
// solo punto per il wrapper cosi' ogni template resta coerente
// e un domani basta cambiare qui per aggiornarli tutti insieme.
// =========================================================

const BG_DARK = "#0C0C0C";
const TEXT_MUTED = "#999999";
const BORDER_SUBTLE = "rgba(255,255,255,0.12)";

// Avvolge il contenuto in uno sfondo nero a piena larghezza —
// senza questo, i client email che non rispettano il div interno
// mostrerebbero comunque una cornice bianca intorno alla card.
function wrapEmail(innerHtml: string, maxWidth: number = 480): string {
  return `
    <div style="background:${BG_DARK}; margin:0; padding:40px 16px;">
      <div style="font-family: Arial, sans-serif; max-width: ${maxWidth}px; margin: 0 auto; color: #fff;">
        ${innerHtml}
      </div>
    </div>
  `;
}

function logoBlock(): string {
  return `
    <div style="text-align: center; margin-bottom: 24px;">
      <img
        src="${SITE_URL}/logo-white.png"
        alt="Portovenere Experiences"
        style="height: 36px;"
      />
    </div>
  `;
}

function primaryButton(url: string, label: string): string {
  return `
    <p style="margin: 32px 0;">
      <a
        href="${url}"
        style="
          background: #fff;
          color: #111;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 999px;
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
          display: inline-block;
        "
      >
        ${label}
      </a>
    </p>
  `;
}

// =========================================================
// RIGA "Contacts" condivisa — WhatsApp + email, mostrata in
// fondo alle mail al cliente.
// =========================================================

function contactsBlock(): string {
  return `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid ${BORDER_SUBTLE};">
      <p style="color: ${TEXT_MUTED}; font-size: 13px; margin: 0 0 8px;">
        Questions? Reach us directly:
      </p>
      <p style="font-size: 13px; margin: 0;">
        <a href="${CONTACT_WHATSAPP_URL}" style="color: #fff; text-decoration: none;">
          WhatsApp: ${CONTACT_WHATSAPP}
        </a>
        &nbsp;·&nbsp;
        <a href="mailto:${CONTACT_EMAIL}" style="color: #fff; text-decoration: none;">
          ${CONTACT_EMAIL}
        </a>
      </p>
    </div>
  `;
}

// =========================================================
// TABELLA DETTAGLIO PREZZI — una riga per esperienza/enhancement
// selezionati, con il prezzo a fianco (vuoto se non determinato,
// es. "su richiesta"), totale in fondo. Sostituisce l'elenco
// semplice "Experiences: Sea Escape, Aerial Escape" quando sono
// disponibili i dettagli calcolati server-side.
// =========================================================

function priceLineItemsTable(
  experienceDetails: LineItemDetail[],
  enhancementDetails: LineItemDetail[],
  totalPrice?: number
): string {

  const rows = [...experienceDetails, ...enhancementDetails]
    .map(
      (item) => `
        <tr>
          <td style="padding: 6px 0; color: #eee;">${escapeHtml(item.title)}</td>
          <td style="padding: 6px 0; text-align: right; white-space: nowrap;">${formatPriceOrBlank(item.price)}</td>
        </tr>
      `
    )
    .join("");

  if (!rows) return "";

  const totalRow =
    totalPrice && totalPrice > 0
      ? `
        <tr>
          <td style="padding: 12px 0 0; border-top: 1px solid ${BORDER_SUBTLE}; font-weight: 600;">Total</td>
          <td style="padding: 12px 0 0; border-top: 1px solid ${BORDER_SUBTLE}; text-align: right; font-weight: 600; white-space: nowrap;">${formatPrice(totalPrice)}</td>
        </tr>
      `
      : "";

  return `
    <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
      ${rows}
      ${totalRow}
    </table>
  `;
}

// =========================================================
// RIGHE DI RIEPILOGO condivise — guests/budget/dates sempre,
// experiences/enhancements a elenco semplice SOLO quando non
// sono disponibili i dettagli con prezzo (fallback per le
// chiamate che non li passano ancora).
// =========================================================

function summaryTable(data: ProposalSummary): string {

  const hasPricedDetails =
    (data.experienceDetails && data.experienceDetails.length > 0) ||
    (data.enhancementDetails && data.enhancementDetails.length > 0);

  const experiencesRow = hasPricedDetails
    ? ""
    : `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Experiences</td><td>${escapeList(data.experiences) || "—"}</td></tr>`;

  const enhancementsRow =
    !hasPricedDetails && data.enhancements && data.enhancements.length > 0
      ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Enhancements</td><td>${escapeList(data.enhancements)}</td></tr>`
      : "";

  const totalRow =
    !hasPricedDetails && data.totalPrice && data.totalPrice > 0
      ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Estimated total</td><td><strong>${formatPrice(data.totalPrice)}</strong></td></tr>`
      : "";

  return `
    ${
      hasPricedDetails
        ? priceLineItemsTable(
            data.experienceDetails || [],
            data.enhancementDetails || [],
            data.totalPrice
          )
        : ""
    }
    <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
      ${experiencesRow}
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Atmosphere</td><td>${escapeList(data.moods) || "—"}</td></tr>
      ${enhancementsRow}
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Guests</td><td>${escapeHtml(data.guests) || "—"}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Budget</td><td>${escapeHtml(formatBudgetLabel(data.budget)) || "—"}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Dates</td><td>${escapeHtml(data.startDate) || "—"} → ${escapeHtml(data.endDate) || "—"}</td></tr>
      ${totalRow}
    </table>
  `;
}

// ---------------------------------------------------------
// 0. Email al CLIENTE — appena la proposta viene generata,
// PRIMA che clicchi "Prenota ora". Puramente informativa: porta
// alla pagina della proposta (dove sceglie/aggiunge esperienze),
// non chiede alcuna conferma email — quella arriva solo se e
// quando clicca davvero "Prenota ora" (vedi verificationEmailTemplate).
// Tenerle distinte evita che il cliente veda due bottoni diversi
// ("Prenota ora" qui e "Conferma la mail" dopo) nella stessa mail.
// ---------------------------------------------------------

export function proposalGeneratedTemplate(data: ProposalSummary, proposalUrl: string) {
  return wrapEmail(`
    ${logoBlock()}

    <h2 style="font-weight: 300;">Your Riviera proposal is ready</h2>
    <p>Hi ${escapeHtml(data.name) || "there"},</p>
    <p>
      We've put together a private Riviera experience for you. Here's
      what we've prepared so far:
    </p>

    ${summaryTable(data)}

    <p style="color: ${TEXT_MUTED}; font-size: 13px;">
      Take a look, add or remove experiences if you'd like, and confirm
      when you're ready.
    </p>

    ${primaryButton(proposalUrl, "View my proposal")}

    ${contactsBlock()}
  `);
}

// ---------------------------------------------------------
// 1. Email al CLIENTE — link di verifica dopo "Request Private Booking"
//
// Il bottone porta sempre allo stesso link di verifica
// (/api/verify-email) — resta l'unico modo per far scattare
// email_verified=true.
// ---------------------------------------------------------

export function verificationEmailTemplate(data: ProposalSummary, verifyUrl: string) {
  return wrapEmail(`
    ${logoBlock()}

    <h2 style="font-weight: 300;">Thank you for crafting your experience</h2>
    <p>Hi ${escapeHtml(data.name) || "there"},</p>
    <p>
      Thank you for putting together your private Riviera experience with
      Portovenere Experiences. We've received your request and we're
      already looking forward to making it happen. Here's a summary of
      what you selected:
    </p>

    ${summaryTable(data)}

    <p style="color: ${TEXT_MUTED}; font-size: 13px;">
      We typically respond within 24 hours with availability and final
      details.
    </p>

    <p>Please confirm your email address to activate your request.</p>

    ${primaryButton(verifyUrl, "Confirm my mail")}

    <p style="color: ${TEXT_MUTED}; font-size: 13px;">
      If you didn't request this, you can safely ignore this email.
    </p>

    ${contactsBlock()}
  `);
}

// ---------------------------------------------------------
// 1b. Email al CLIENTE — REMINDER manuale per proposal non
// confermate (inviato dall'admin da /api/admin/send-reminder,
// non dal cron automatico). Riusa lo stesso verifyUrl (stesso
// token) della mail iniziale, e lo stesso riepilogo arricchito —
// nessuna nuova verifica da generare, e' solo un promemoria.
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

  return wrapEmail(`
    ${logoBlock()}

    <h2 style="font-weight: 300;">${copy.heading}</h2>
    <p>Hi ${escapeHtml(data.name) || "there"},</p>
    <p>${copy.intro}</p>

    ${summaryTable(data)}

    ${primaryButton(verifyUrl, "View my request")}

    <p style="color: ${TEXT_MUTED}; font-size: 13px;">
      If you didn't request this, you can safely ignore this email.
    </p>

    ${contactsBlock()}
  `);
}

// ---------------------------------------------------------
// 1c. Email al CLIENTE — REMINDER automatico (cron) per chi
// non ha MAI cliccato "Request Private Booking" sulla proposal.
// A differenza di reminderEmailTemplate qui non esiste alcun
// verification_token (quel flusso non e' mai partito), quindi
// il bottone porta direttamente alla pagina della proposal
// invece che al link di verifica, e il testo non parla di
// "confermare l'email" (che il cliente non ha mai iniziato).
//
// stage: 1 = 12h, 2 = 24h, 3 = 36h dalla generazione della
// proposal (created_at) — se il cliente clicca il bottone in
// qualsiasi momento, booking_requested_at si valorizza e il
// cron smette di considerare questa proposal per sempre.
// ---------------------------------------------------------

const BOOKING_REMINDER_COPY: Record<number, { subject: string; heading: string; intro: string }> = {
  1: {
    subject: "Your Riviera proposal is still open",
    heading: "Your private Riviera proposal is waiting",
    intro: "We put together a private Riviera experience for you and it's still open — here's a quick reminder of what we prepared:",
  },
  2: {
    subject: "Still there? Your Riviera proposal hasn't expired",
    heading: "Still there? Your proposal hasn't expired yet",
    intro: "Just a gentle nudge — your private Riviera proposal is still available. Take a moment to look it over:",
  },
  3: {
    subject: "Last chance to view your Riviera proposal",
    heading: "One last reminder before this proposal closes",
    intro: "This is our final reminder — your private Riviera proposal is still open, but won't stay available much longer:",
  },
};

export function bookingReminderTemplate(
  data: ProposalSummary,
  proposalUrl: string,
  stage: 1 | 2 | 3
) {

  const copy = BOOKING_REMINDER_COPY[stage];

  return wrapEmail(`
    ${logoBlock()}

    <h2 style="font-weight: 300;">${copy.heading}</h2>
    <p>Hi ${escapeHtml(data.name) || "there"},</p>
    <p>${copy.intro}</p>

    ${summaryTable(data)}

    ${primaryButton(proposalUrl, "View my proposal")}

    <p style="color: ${TEXT_MUTED}; font-size: 13px;">
      If you didn't request this, you can safely ignore this email.
    </p>

    ${contactsBlock()}
  `);
}

// ---------------------------------------------------------
// 1d. Email al CLIENTE — richiesta di pagamento acconto, innescata
// SOLO manualmente dall'admin (bottone "Request Payment" sulla
// scheda lead), mai in automatico su "Prenota Ora" — il team rivede
// la disponibilita' prima di chiedere il pagamento. Il bottone porta
// a una Stripe Checkout Session hosted, non a una pagina del sito.
// ---------------------------------------------------------

export function depositPaymentRequestedTemplate(
  data: ProposalSummary,
  checkoutUrl: string,
  depositAmount: number
) {
  return wrapEmail(`
    ${logoBlock()}

    <h2 style="font-weight: 300;">Your booking is ready to confirm</h2>
    <p>Hi ${escapeHtml(data.name) || "there"},</p>
    <p>
      Great news — your private Riviera experience is confirmed as available.
      To secure your booking, we ask for a deposit of
      <strong>${formatPrice(depositAmount)}</strong> now; the remaining
      balance is settled separately, closer to your experience.
    </p>

    ${summaryTable(data)}

    ${primaryButton(checkoutUrl, "Pay deposit now")}

    <p style="color: ${TEXT_MUTED}; font-size: 13px;">
      This secure payment link is generated by Stripe. If you have any
      questions before paying, feel free to reach out first.
    </p>

    ${contactsBlock()}
  `);
}

// ---------------------------------------------------------
// 1e. Email al CLIENTE — conferma acconto pagato (webhook Stripe,
// checkout.session.completed). Nessun bottone di pagamento: e' fatta,
// solo un riepilogo e la promessa di essere ricontattati per i dettagli.
// ---------------------------------------------------------

export function depositPaidClientTemplate(data: ProposalSummary, depositAmount: number) {
  return wrapEmail(`
    ${logoBlock()}

    <h2 style="font-weight: 300;">Your deposit has been received</h2>
    <p>Hi ${escapeHtml(data.name) || "there"},</p>
    <p>
      Thank you — we've received your deposit of
      <strong>${formatPrice(depositAmount)}</strong> and your private
      Riviera experience is now booked. Our team will be in touch shortly
      with the final details.
    </p>

    ${summaryTable(data)}

    ${contactsBlock()}
  `);
}

// ---------------------------------------------------------
// 2. Email al PROPRIETARIO (info@portovenere.com) —
//    non appena una proposal viene generata, indipendentemente
//    dal fatto che il cliente richieda o no il booking.
// ---------------------------------------------------------

export function ownerNewProposalTemplate(data: ProposalSummary) {

  const hasPricedDetails =
    (data.experienceDetails && data.experienceDetails.length > 0) ||
    (data.enhancementDetails && data.enhancementDetails.length > 0);

  return wrapEmail(`
    <h2 style="font-weight: 300;">New proposal generated</h2>
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Name</td><td>${escapeHtml(data.name)}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Email</td><td>${escapeHtml(data.email)}</td></tr>
      ${
        hasPricedDetails
          ? ""
          : `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Experiences</td><td>${escapeList(data.experiences)}</td></tr>`
      }
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Moods</td><td>${escapeList(data.moods)}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Guests</td><td>${escapeHtml(data.guests)}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Budget</td><td>${escapeHtml(formatBudgetLabel(data.budget))}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Dates</td><td>${escapeHtml(data.startDate)} → ${escapeHtml(data.endDate)}</td></tr>
    </table>

    ${
      hasPricedDetails
        ? priceLineItemsTable(
            data.experienceDetails || [],
            data.enhancementDetails || [],
            data.totalPrice
          )
        : ""
    }

    <p style="margin: 24px 0;">
      <a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #fff;">
        View this proposal →
      </a>
    </p>
  `, 560);
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

  const hasPricedDetails =
    (data.experienceDetails && data.experienceDetails.length > 0) ||
    (data.enhancementDetails && data.enhancementDetails.length > 0);

  const experiencesRow = hasPricedDetails
    ? ""
    : `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Experiences</td><td>${escapeList(data.experiences) || "—"}</td></tr>`;

  const enhancementsRow =
    !hasPricedDetails && data.enhancements && data.enhancements.length > 0
      ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Enhancements</td><td>${escapeList(data.enhancements)}</td></tr>`
      : "";

  const totalRow =
    !hasPricedDetails && data.totalPrice && data.totalPrice > 0
      ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Estimated total</td><td><strong>${formatPrice(data.totalPrice)}</strong></td></tr>`
      : "";

  const notesRow =
    data.notes && data.notes.trim() !== ""
      ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED}; vertical-align: top;">Notes</td><td>${escapeHtml(data.notes)}</td></tr>`
      : "";

  const dashboardLink =
    data.dashboardUrl
      ? `<p style="margin: 8px 0;">
          <a href="${data.dashboardUrl}" style="color: #fff;">
            Open in dashboard →
          </a>
        </p>`
      : "";

  return wrapEmail(`
    <h2 style="font-weight: 300;">Email confirmed — booking request is real</h2>
    <p>
      <strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)}) has confirmed their
      email address after requesting a private booking. Here are the full details:
    </p>

    ${
      hasPricedDetails
        ? priceLineItemsTable(
            data.experienceDetails || [],
            data.enhancementDetails || [],
            data.totalPrice
          )
        : ""
    }

    <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
      ${experiencesRow}
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Atmosphere</td><td>${escapeList(data.moods) || "—"}</td></tr>
      ${enhancementsRow}
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Guests</td><td>${escapeHtml(data.guests) || "—"}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Budget</td><td>${escapeHtml(formatBudgetLabel(data.budget)) || "—"}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Dates</td><td>${escapeHtml(data.startDate) || "—"} → ${escapeHtml(data.endDate) || "—"}</td></tr>
      ${totalRow}
      ${notesRow}
    </table>

    <p style="margin: 24px 0;">
      <a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #fff;">
        View public proposal →
      </a>
    </p>
    ${dashboardLink}
  `, 560);
}

// ---------------------------------------------------------
// 3b. Email al PROPRIETARIO — l'acconto e' stato pagato (webhook
//    Stripe). Segnala anche split e valuta se qualche Transfer verso
//    un operatore e' fallito, cosi' non passa inosservato.
// ---------------------------------------------------------

interface DepositSplitRow {
  operatorName: string;
  amount: number;
  transferStatus: "ok" | "failed";
}

export function ownerDepositPaidTemplate(
  data: ProposalSummary,
  depositAmount: number,
  splitRows: DepositSplitRow[]
) {

  const splitTable = splitRows.length
    ? `
      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
        ${splitRows
          .map(
            (row) => `
              <tr>
                <td style="padding: 6px 0; color: #eee;">${escapeHtml(row.operatorName)}</td>
                <td style="padding: 6px 0; text-align: right;">${formatPrice(row.amount)}</td>
                <td style="padding: 6px 0; text-align: right; color: ${row.transferStatus === "ok" ? TEXT_MUTED : "#ff6b6b"};">
                  ${row.transferStatus === "ok" ? "transferred" : "TRANSFER FAILED"}
                </td>
              </tr>
            `
          )
          .join("")}
      </table>
    `
    : "";

  return wrapEmail(`
    <h2 style="font-weight: 300;">Deposit paid — ${formatPrice(depositAmount)}</h2>
    <p>
      <strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)}) has paid their
      booking deposit.
    </p>

    ${splitTable}

    <p style="margin: 24px 0;">
      <a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #fff;">
        View proposal →
      </a>
    </p>
  `, 560);
}

// ---------------------------------------------------------
// 1f. Email al CLIENTE — richiesta di pagamento CONCIERGE FEE (Fase 1),
// innescata SOLO manualmente dall'admin (bottone "Request Concierge
// Fee" sulla scheda lead). A differenza di depositPaymentRequestedTemplate
// (Fase 2, tenuto intatto sopra) qui NON si chiede un acconto sul
// valore delle esperienze: quello il cliente lo paga DIRETTAMENTE a
// ciascun operatore, fuori da questo pagamento. Il bottone porta a una
// Stripe Checkout Session per il solo importo della fee — i due valori
// vanno tenuti visivamente separati per non far pensare al cliente che
// stia pagando le esperienze stesse.
// ---------------------------------------------------------

// ---------------------------------------------------------
// Email al CLIENTE — pagamento Stripe personalizzato/ad-hoc creato a
// mano dall'admin (sezione "Custom Payment"), non legato a una
// Proposal — nessun ProposalSummary disponibile qui, quindi non riusa
// summaryTable(): solo i blocchi generici gia' condivisi.
// ---------------------------------------------------------

export function customPaymentRequestedTemplate(
  data: { name: string; email: string },
  checkoutUrl: string,
  amount: number,
  description?: string
) {
  return wrapEmail(`
    ${logoBlock()}

    <h2 style="font-weight: 300;">Payment request — Portovenere Experiences</h2>
    <p>Hi ${escapeHtml(data.name) || "there"},</p>
    ${
      description
        ? `<p>${escapeHtml(description)}</p>`
        : `<p>Please find below your payment request.</p>`
    }

    <div style="margin: 24px 0; padding: 16px 20px; border: 1px solid ${BORDER_SUBTLE}; border-radius: 12px; background: rgba(255,255,255,0.03);">
      <p style="margin: 0; font-size: 22px; font-weight: 600;">
        ${formatPrice(amount)}
      </p>
    </div>

    ${primaryButton(checkoutUrl, "Pay now")}

    <p style="color: ${TEXT_MUTED}; font-size: 13px;">
      This secure payment link is generated by Stripe. If you have any
      questions before paying, feel free to reach out first.
    </p>

    ${contactsBlock()}
  `);
}

export function conciergeFeePaymentRequestedTemplate(
  data: ProposalSummary,
  checkoutUrl: string,
  feeAmount: number,
  feePercentage: number
) {
  return wrapEmail(`
    ${logoBlock()}

    <h2 style="font-weight: 300;">Your concierge is ready to activate</h2>
    <p>Hi ${escapeHtml(data.name) || "there"},</p>
    <p>
      Great news — your private Riviera experience is confirmed as
      available. Below is your selection, followed by the one payment
      we ask for now to activate your concierge.
    </p>

    ${summaryTable(data)}

    <div style="margin: 24px 0; padding: 16px 20px; border: 1px solid ${BORDER_SUBTLE}; border-radius: 12px; background: rgba(255,255,255,0.03);">
      <p style="margin: 0 0 4px; font-size: 13px; color: ${TEXT_MUTED};">
        Concierge Fee (${feePercentage}% of your total above)
      </p>
      <p style="margin: 0; font-size: 22px; font-weight: 600;">
        ${formatPrice(feeAmount)}
      </p>
      <p style="margin: 10px 0 0; font-size: 12px; color: ${TEXT_MUTED};">
        Our fee for curating, coordinating and personally handling your
        private itinerary. The experience total above is paid directly
        to each local expert/operator, arranged separately by our team —
        it is not collected by Portovenere.
      </p>
    </div>

    ${primaryButton(checkoutUrl, "Pay Concierge Fee now")}

    <p style="color: ${TEXT_MUTED}; font-size: 13px;">
      This secure payment link is generated by Stripe. If you have any
      questions before paying, feel free to reach out first.
    </p>

    ${contactsBlock()}
  `);
}

// ---------------------------------------------------------
// 1g. Email al CLIENTE — conferma Concierge Fee pagata (webhook
// Stripe, checkout.session.completed). Attenzione: non deve MAI
// suonare come "il tuo booking e' pagato" — la fee e' solo la
// commissione, le esperienze restano da pagare direttamente agli
// operatori.
// ---------------------------------------------------------

export function conciergeFeePaidClientTemplate(data: ProposalSummary, feeAmount: number) {
  return wrapEmail(`
    ${logoBlock()}

    <h2 style="font-weight: 300;">Your concierge is now active</h2>
    <p>Hi ${escapeHtml(data.name) || "there"},</p>
    <p>
      Thank you — we've received your Concierge Fee of
      <strong>${formatPrice(feeAmount)}</strong>. Your concierge is now
      active: our team will personally contact each partner on your
      behalf to confirm every detail. You'll settle payment for each
      experience directly with them, as arranged together.
    </p>

    ${summaryTable(data)}

    ${contactsBlock()}
  `);
}

// ---------------------------------------------------------
// 3c. Email al PROPRIETARIO — la Concierge Fee e' stata pagata
// (webhook Stripe). Sostituisce ownerDepositPaidTemplate (Fase 2,
// tenuto intatto sopra) nel flusso attivo — qui non c'e' alcuno split
// da segnalare, solo la checklist per partire con lo step 1 del
// workflow manuale (contattare ogni operatore).
// ---------------------------------------------------------

interface ConciergeOperatorRow {
  itemTitle: string;
  operatorName: string;
  price: number | null;
}

export function ownerConciergeFeePaidTemplate(
  data: ProposalSummary,
  feeAmount: number,
  feePercentage: number,
  operatorRows: ConciergeOperatorRow[]
) {

  const checklistTable = operatorRows.length
    ? `
      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
        ${operatorRows
          .map(
            (row) => `
              <tr>
                <td style="padding: 6px 0; color: #eee;">${escapeHtml(row.itemTitle)}</td>
                <td style="padding: 6px 0; color: ${TEXT_MUTED};">${escapeHtml(row.operatorName)}</td>
                <td style="padding: 6px 0; text-align: right; white-space: nowrap;">${formatPriceOrBlank(row.price)}</td>
              </tr>
            `
          )
          .join("")}
      </table>
    `
    : `<p style="color: ${TEXT_MUTED}; font-size: 13px;">No operators assigned to any selected item yet — assign operators from the experience/enhancement editor to track coordination here.</p>`;

  return wrapEmail(`
    <h2 style="font-weight: 300;">Concierge Fee paid — ${formatPrice(feeAmount)} (${feePercentage}%)</h2>
    <p>
      <strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)}) has paid their
      Concierge Fee. Time to start the manual workflow — contact each
      operator below to confirm availability and pricing, then keep the
      client informed. Track progress in the lead's Operator coordination
      section.
    </p>

    ${checklistTable}

    <p style="margin: 24px 0;">
      <a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #fff;">
        View proposal →
      </a>
    </p>
  `, 560);
}

// ---------------------------------------------------------
// 4. Email al PROPRIETARIO — il cliente ha modificato la
//    proposta DOPO aver gia' confermato l'email la prima volta.
//    Non serve una nuova verifica: e' gia' un contatto verificato.
// ---------------------------------------------------------

export function ownerProposalModifiedTemplate(data: ProposalSummary) {
  return wrapEmail(`
    <h2 style="font-weight: 300;">Client modified their proposal</h2>
    <p>
      <strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)}) has changed their
      selection after already confirming their email address.
    </p>
    <p style="margin: 24px 0;">
      <a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #fff;">
        View the updated proposal →
      </a>
    </p>
  `, 560);
}

// ---------------------------------------------------------
// 5. Email al CLIENTE — conferma delle modifiche, nessuna
//    nuova verifica richiesta (l'ha gia' fatta)
// ---------------------------------------------------------

export function clientChangesConfirmedTemplate(data: ProposalSummary) {
  return wrapEmail(`
    <h2 style="font-weight: 300;">Your changes have been confirmed</h2>
    <p>Hi ${escapeHtml(data.name) || "there"},</p>
    <p>
      We've updated your private Riviera proposal with your latest
      selection, and refreshed your private reservation window.
    </p>

    ${summaryTable(data)}

    ${primaryButton(`${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}`, "View your proposal")}
  `);
}

// ---------------------------------------------------------
// 6. Email al PROPRIETARIO — nuova candidatura operatore da
//    /become-a-partner. Nessuna email al richiedente: la conferma
//    e' solo a schermo sul form (result.success), coerente col
//    fatto che ogni candidatura viene rivista a mano, non c'e'
//    nessun "flusso automatico" da confermare via email.
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

// "roomsCount" -> "Rooms Count" — le chiavi di profile/details/booking/
// materials sono i nomi dei campi del wizard (vedi BecomePartnerClient),
// scritti in camelCase perche' sono anche chiavi di stato React.
function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string | null {
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
    .map(([key, value]) => [key, formatValue(value)] as [string, string | null])
    .filter(([, value]) => value !== null) as [string, string][];

  if (rows.length === 0) return "";

  return `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid ${BORDER_SUBTLE};">
      <p style="color: ${TEXT_MUTED}; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(title)}</p>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        ${rows
          .map(
            ([key, value]) =>
              `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED}; width: 45%;">${escapeHtml(humanizeKey(key))}</td><td>${escapeHtml(value)}</td></tr>`
          )
          .join("")}
      </table>
    </div>
  `;
}

export function ownerNewPartnerApplicationTemplate(data: PartnerApplicationSummary) {
  return wrapEmail(`
    <h2 style="font-weight: 300;">New partner application</h2>
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Business</td><td>${escapeHtml(data.companyName)}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Contact</td><td>${escapeHtml(data.contactName)}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Email</td><td>${escapeHtml(data.email)}</td></tr>
      ${data.phone ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Phone</td><td>${escapeHtml(data.phone)}</td></tr>` : ""}
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Category</td><td>${escapeHtml(data.category)}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Plan interest</td><td>${escapeHtml(data.planInterest)}</td></tr>
      ${data.website ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Website</td><td>${escapeHtml(data.website)}</td></tr>` : ""}
      ${data.instagram ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Instagram/Facebook</td><td>${escapeHtml(data.instagram)}</td></tr>` : ""}
      ${data.consentFullName ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Consent signed by</td><td>${escapeHtml(data.consentFullName)}</td></tr>` : ""}
    </table>

    ${jsonbSection("Business profile", data.profile)}
    ${jsonbSection("Category details", data.details)}
    ${jsonbSection("Booking", data.booking)}
    ${jsonbSection("Materials", data.materials)}

    ${
      data.message
        ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid ${BORDER_SUBTLE};">
             <p style="color: ${TEXT_MUTED}; font-size: 13px; margin: 0 0 8px;">Message</p>
             <p style="font-size: 14px; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
           </div>`
        : ""
    }

    <p style="margin: 24px 0;">
      <a href="mailto:${escapeHtml(data.email)}" style="color: #fff;">
        Reply to ${escapeHtml(data.contactName)} →
      </a>
    </p>
  `, 560);
}

// ---------------------------------------------------------
// 7. Email al PROPRIETARIO — un operatore ha proposto UNA singola
// esperienza da /submit-experience (diverso da become-a-partner, che
// riguarda l'intera attivita'). Nessuna email all'operatore: stesso
// principio di ownerNewPartnerApplicationTemplate, ogni proposta viene
// rivista a mano e poi inserita manualmente nel CMS se accettata —
// niente "flusso automatico" da confermare.
// ---------------------------------------------------------

interface ExperienceSubmissionSummary {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  categoryLabel: string;
  experienceTitle: string;
  shortDescription?: string;
  fullDescription?: string;
  details?: Record<string, unknown>;
  basePrice?: string;
  priceType?: string;
  duration?: string;
  minParticipants?: string;
  maxParticipants?: string;
  meetingPoint?: string;
  availabilityNotes?: string;
  photoDelivery?: string;
  photoLink?: string;
  message?: string;
}

export function ownerNewExperienceSubmissionTemplate(data: ExperienceSubmissionSummary) {

  const logistics: Record<string, unknown> = {
    basePrice: data.basePrice,
    priceType: data.priceType,
    duration: data.duration,
    minParticipants: data.minParticipants,
    maxParticipants: data.maxParticipants,
    meetingPoint: data.meetingPoint,
    availabilityNotes: data.availabilityNotes,
  };

  const photos: Record<string, unknown> = {
    photoDelivery: data.photoDelivery,
    photoLink: data.photoLink,
  };

  return wrapEmail(`
    <h2 style="font-weight: 300;">New experience submission</h2>
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Business</td><td>${escapeHtml(data.businessName)}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Contact</td><td>${escapeHtml(data.contactName)}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Email</td><td>${escapeHtml(data.email)}</td></tr>
      ${data.phone ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Phone</td><td>${escapeHtml(data.phone)}</td></tr>` : ""}
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Category</td><td>${escapeHtml(data.categoryLabel)}</td></tr>
      <tr><td style="padding: 6px 0; color: ${TEXT_MUTED};">Experience title</td><td>${escapeHtml(data.experienceTitle)}</td></tr>
      ${data.shortDescription ? `<tr><td style="padding: 6px 0; color: ${TEXT_MUTED}; vertical-align: top;">Short description</td><td>${escapeHtml(data.shortDescription)}</td></tr>` : ""}
    </table>

    ${
      data.fullDescription
        ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid ${BORDER_SUBTLE};">
             <p style="color: ${TEXT_MUTED}; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Full description</p>
             <p style="font-size: 14px; white-space: pre-wrap;">${escapeHtml(data.fullDescription)}</p>
           </div>`
        : ""
    }

    ${jsonbSection("Category details", data.details)}
    ${jsonbSection("Logistics", logistics)}
    ${jsonbSection("Photos", photos)}

    ${
      data.message
        ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid ${BORDER_SUBTLE};">
             <p style="color: ${TEXT_MUTED}; font-size: 13px; margin: 0 0 8px;">Message</p>
             <p style="font-size: 14px; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
           </div>`
        : ""
    }

    <p style="margin: 24px 0;">
      <a href="mailto:${escapeHtml(data.email)}" style="color: #fff;">
        Reply to ${escapeHtml(data.contactName)} →
      </a>
    </p>
  `, 560);
}
