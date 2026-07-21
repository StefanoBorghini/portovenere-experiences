// =========================================================
// Template email — HTML semplice, coerente con il brand.
// =========================================================

interface ExperienceDetail {
  title: string;
  operator?: string;
  price?: number;
}

interface EnhancementDetail {
  title: string;
  price?: number;
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
  experienceDetails?: ExperienceDetail[];
  enhancementDetails?: EnhancementDetail[];
  enhancements?: string[];
  totalPrice?: number;
  notes?: string;
  dashboardUrl?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.portovenere.com";

const CONTACT_WHATSAPP = "+39 348 714 0722";
const CONTACT_WHATSAPP_URL = "https://wa.me/393487140722";
const CONTACT_EMAIL = "info@portovenere.com";

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

function experienceDetailsList(details: ExperienceDetail[]): string {
  return details
    .map((d) => {
      const opText = d.operator
        ? ` <span style="color:#999;">(${escapeHtml(d.operator)})</span>`
        : "";
      const priceText =
        typeof d.price === "number" && d.price > 0
          ? ` — ${formatPrice(d.price)}`
          : "";
      return `${escapeHtml(d.title)}${opText}${priceText}`;
    })
    .join("<br/>");
}

function enhancementDetailsList(details: EnhancementDetail[]): string {
  return details
    .map((d) => {
      const priceText =
        typeof d.price === "number" && d.price > 0
          ? ` — ${formatPrice(d.price)}`
          : "";
      return `${escapeHtml(d.title)}${priceText}`;
    })
    .join("<br/>");
}

function contactsBlock(): string {
  return `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 13px; margin: 0 0 8px;">Questions? Reach us directly:</p>
      <p style="font-size: 13px; margin: 0;">
        <a href="${CONTACT_WHATSAPP_URL}" style="color: #111; text-decoration: none;">WhatsApp: ${CONTACT_WHATSAPP}</a>
        &nbsp;·&nbsp;
        <a href="mailto:${CONTACT_EMAIL}" style="color: #111; text-decoration: none;">${CONTACT_EMAIL}</a>
      </p>
    </div>
  `;
}

function summaryTable(data: ProposalSummary): string {

  const experiencesCell =
    data.experienceDetails && data.experienceDetails.length > 0
      ? experienceDetailsList(data.experienceDetails)
      : escapeList(data.experiences) || "—";

  const enhancementsCell =
    data.enhancementDetails && data.enhancementDetails.length > 0
      ? enhancementDetailsList(data.enhancementDetails)
      : data.enhancements && data.enhancements.length > 0
      ? escapeList(data.enhancements)
      : "";

  const enhancementsRow =
    enhancementsCell !== ""
      ? `<tr><td style="padding: 6px 0; color: #666; vertical-align: top;">Enhancements</td><td>${enhancementsCell}</td></tr>`
      : "";

  const totalRow =
    data.totalPrice && data.totalPrice > 0
      ? `<tr><td style="padding: 6px 0; color: #666;">Estimated total</td><td><strong>${formatPrice(data.totalPrice)}</strong></td></tr>`
      : "";

  return `
    <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
      <tr><td style="padding: 6px 0; color: #666; vertical-align: top;">Experiences</td><td>${experiencesCell}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Atmosphere</td><td>${escapeList(data.moods) || "—"}</td></tr>
      ${enhancementsRow}
      <tr><td style="padding: 6px 0; color: #666;">Guests</td><td>${escapeHtml(data.guests) || "—"}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Budget</td><td>${escapeHtml(data.budget) || "—"}</td></tr>
      <tr><td style="padding: 6px 0; color: #666;">Dates</td><td>${escapeHtml(data.startDate) || "—"} → ${escapeHtml(data.endDate) || "—"}</td></tr>
      ${totalRow}
    </table>
  `;
}

export function verificationEmailTemplate(data: ProposalSummary, verifyUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${SITE_URL}/logo-white.png" alt="Portovenere Experiences" style="height: 36px; filter: invert(1);" />
      </div>

      <h2 style="font-weight: 300;">Thank you for crafting your experience</h2>
      <p>Hi ${escapeHtml(data.name) || "there"},</p>
      <p>Thank you for putting together your private Riviera experience with Portovenere Experiences. We've received your request and we're already looking forward to making it happen. Here's a summary of what you selected:</p>

      ${summaryTable(data)}

      <p style="color: #666; font-size: 13px;">We typically respond within 24 hours with availability and final details.</p>
      <p>Please confirm your email address to activate your request.</p>

      <p style="margin: 32px 0;"><a href="${verifyUrl}" style="background: #111; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 999px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">View my request</a></p>
      <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>

      ${contactsBlock()}
    </div>
  `;
}

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

export function reminderEmailTemplate(data: ProposalSummary, verifyUrl: string, stage: 1 | 2 | 3) {

  const copy = REMINDER_COPY[stage];

  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${SITE_URL}/logo-white.png" alt="Portovenere Experiences" style="height: 36px; filter: invert(1);" />
      </div>

      <h2 style="font-weight: 300;">${copy.heading}</h2>
      <p>Hi ${escapeHtml(data.name) || "there"},</p>
      <p>${copy.intro}</p>

      ${summaryTable(data)}

      <p style="margin: 32px 0;"><a href="${verifyUrl}" style="background: #111; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 999px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">View my request</a></p>
      <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>

      ${contactsBlock()}
    </div>
  `;
}

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
      <p style="margin: 24px 0;"><a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #111;">View this proposal →</a></p>
    </div>
  `;
}

export function ownerEmailConfirmedTemplate(data: ProposalSummary) {

  const notesRow =
    data.notes && data.notes.trim() !== ""
      ? `<table style="width:100%; font-size:14px; border-collapse:collapse;"><tr><td style="padding: 6px 0; color: #666; vertical-align: top;">Notes</td><td>${escapeHtml(data.notes)}</td></tr></table>`
      : "";

  const dashboardLink =
    data.dashboardUrl
      ? `<p style="margin: 8px 0;"><a href="${data.dashboardUrl}" style="color: #111;">Open in dashboard →</a></p>`
      : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">Email confirmed — booking request is real</h2>
      <p><strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)}) has confirmed their email address after requesting a private booking. Here are the full details:</p>

      ${summaryTable(data)}
      ${notesRow}

      <p style="margin: 24px 0;"><a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #111;">View public proposal →</a></p>
      ${dashboardLink}
    </div>
  `;
}

export function ownerProposalModifiedTemplate(data: ProposalSummary) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">Client modified their proposal</h2>
      <p><strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)}) has changed their selection after already confirming their email address.</p>
      <p style="margin: 24px 0;"><a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="color: #111;">View the updated proposal →</a></p>
    </div>
  `;
}

export function clientChangesConfirmedTemplate(data: ProposalSummary) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">Your changes have been confirmed</h2>
      <p>Hi ${escapeHtml(data.name) || "there"},</p>
      <p>We've updated your private Riviera proposal with your latest selection, and refreshed your private reservation window.</p>
      <p style="margin: 32px 0;"><a href="${SITE_URL}/results/proposal/${encodeURIComponent(data.slug)}" style="background: #111; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 999px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">View your proposal</a></p>
    </div>
  `;
}