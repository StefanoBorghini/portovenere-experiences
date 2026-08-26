import { ImageResponse } from "next/og";
import { SocialCardData, SocialCardFormatId } from "@/types/socialCard";
import { SOCIAL_CARD_FORMATS, SocialCardFormatConfig } from "@/components/social-card/socialCardFormats";
import { buildSocialCardElement } from "./renderSocialCardSatori";
import { buildSocialStoryElement } from "./renderSocialStorySatori";
import { loadGoogleFont } from "./googleFont";

// =========================================================
// Genera il PNG finale per un formato della Social Experience Card —
// condiviso tra la route di download
// (/api/admin/leads/[id]/social-card/export) e quella di invio email
// (/api/admin/leads/[id]/social-card/send-email), cosi' le due non
// duplicano la stessa pipeline Satori.
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

  // La Story e' una composizione autonoma (meno contenuto, testo
  // molto piu' grande), non una versione rimpicciolita del Feed —
  // vedi renderSocialStorySatori.tsx.
  const [[fontLight, fontRegular, fontMedium], element] = await Promise.all([
    fontsPromise,
    formatId === "story"
      ? buildSocialStoryElement(socialCardData, format, showPrice, cta)
      : buildSocialCardElement(socialCardData, format, showPrice, cta),
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

  return {
    buffer: pngBuffer,
    contentType: "image/png",
    filename: `portovenere-experience-${slug}-${formatId}.png`,
  };
}
