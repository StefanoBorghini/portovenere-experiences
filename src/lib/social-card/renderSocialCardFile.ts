import { ImageResponse } from "next/og";
import { jsPDF } from "jspdf";
import { SocialCardData, SocialCardFormatId } from "@/types/socialCard";
import { SOCIAL_CARD_FORMATS, SocialCardFormatConfig } from "@/components/social-card/socialCardFormats";
import { buildSocialCardElement } from "./renderSocialCardSatori";
import { loadGoogleFont } from "./googleFont";

// =========================================================
// Genera il file finale (PNG o PDF) per un formato della Social
// Experience Card — condiviso tra la route di download
// (/api/admin/leads/[id]/social-card/export) e quella di invio email
// (/api/admin/leads/[id]/social-card/send-email), cosi' le due non
// duplicano la stessa pipeline Satori/jsPDF.
// =========================================================

interface RenderSocialCardFileResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

export async function renderSocialCardFile(
  socialCardData: SocialCardData,
  formatId: SocialCardFormatId,
  showPrice: boolean,
  cta: string,
  slug: string
): Promise<RenderSocialCardFileResult> {

  const format: SocialCardFormatConfig | undefined = SOCIAL_CARD_FORMATS[formatId];

  if (!format) {
    throw new Error(`Invalid social card format: ${formatId}`);
  }

  const fontsPromise = Promise.all([
    loadGoogleFont("Inter", 300),
    loadGoogleFont("Inter", 400),
    loadGoogleFont("Inter", 500),
  ]);

  const [[fontLight, fontRegular, fontMedium], element] = await Promise.all([
    fontsPromise,
    buildSocialCardElement(socialCardData, format, showPrice, cta),
  ]);

  const imageResponse = new ImageResponse(element, {
    width: format.width,
    height: format.height,
    fonts: [
      { name: "Inter", data: fontLight, weight: 300, style: "normal" },
      { name: "Inter", data: fontRegular, weight: 400, style: "normal" },
      { name: "Inter", data: fontMedium, weight: 500, style: "normal" },
    ],
  });

  const pngBuffer = Buffer.from(await imageResponse.arrayBuffer());

  const filenameBase = `portovenere-experience-${slug}`;

  if (format.exportAs === "pdf") {

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const dataUri = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    pdf.addImage(dataUri, "PNG", 0, 0, 210, 297);
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return {
      buffer: pdfBuffer,
      contentType: "application/pdf",
      filename: `${filenameBase}.pdf`,
    };
  }

  return {
    buffer: pngBuffer,
    contentType: "image/png",
    filename: `${filenameBase}-${formatId}.png`,
  };
}
