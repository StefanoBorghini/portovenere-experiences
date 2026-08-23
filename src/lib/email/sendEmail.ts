import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  // Facoltativi — usati es. per allegare il PDF del contratto
  // all'operatore (vedi /api/admin/partners/[id]/send-contract).
  attachments?: SendEmailAttachment[];
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      attachments,
    });
    return { success: true };
  } catch (err) {
    console.error("sendEmail error:", err);
    return { success: false, error: err };
  }
}
