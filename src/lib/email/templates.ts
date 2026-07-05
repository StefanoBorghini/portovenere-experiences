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

// ---------------------------------------------------------
// 1. Email al CLIENTE — link di verifica dopo "Request Private Booking"
// ---------------------------------------------------------

export function verificationEmailTemplate(data: ProposalSummary, verifyUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">Confirm your booking request</h2>
      <p>Hi ${data.name || "there"},</p>
      <p>
        Thanks for requesting your private Riviera experience with
        Portovenere Experiences. Here's a summary of the proposal you're
        confirming:
      </p>

      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Experiences</td><td>${data.experiences.join(", ") || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Atmosphere</td><td>${data.moods.join(", ") || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guests</td><td>${data.guests || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Budget</td><td>${data.budget || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Dates</td><td>${data.startDate || "—"} → ${data.endDate || "—"}</td></tr>
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
// 2. Email al PROPRIETARIO (info@portovenere.com) —
//    non appena una proposal viene generata, indipendentemente
//    dal fatto che il cliente richieda o no il booking.
// ---------------------------------------------------------

export function ownerNewProposalTemplate(data: ProposalSummary) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 300;">New proposal generated</h2>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666;">Name</td><td>${data.name}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Email</td><td>${data.email}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Experiences</td><td>${data.experiences.join(", ")}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Moods</td><td>${data.moods.join(", ")}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Guests</td><td>${data.guests}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Budget</td><td>${data.budget}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Dates</td><td>${data.startDate} → ${data.endDate}</td></tr>
      </table>
      <p style="margin: 24px 0;">
        <a href="${SITE_URL}/results/proposal-staging/${data.slug}" style="color: #111;">
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
        <strong>${data.name}</strong> (${data.email}) has confirmed their
        email address after requesting a private booking.
      </p>
      <p style="margin: 24px 0;">
        <a href="${SITE_URL}/results/proposal-staging/${data.slug}" style="color: #111;">
          View this proposal →
        </a>
      </p>
    </div>
  `;
}