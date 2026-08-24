import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { jsPDF } from "jspdf";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { getSocialCardDataForSlug } from "@/lib/social-card/getSocialCardDataForProposal";
import { SOCIAL_CARD_FORMATS, SocialCardFormatConfig } from "@/components/social-card/socialCardFormats";
import { SocialCardFormatId } from "@/types/socialCard";
import { buildSocialCardElement } from "@/lib/social-card/renderSocialCardSatori";
import { loadGoogleFont } from "@/lib/social-card/googleFont";

// =========================================================
// GET /api/admin/leads/[id]/social-card/export?format=portrait|story|a4&showPrice=0|1&cta=...
// Genera il file finale — SEMPRE lato server (next/og, basato su
// Satori), mai nel browser dell'admin: elimina l'intera categoria di
// bug del rendering client-side via html2canvas (font non ancora
// caricati, immagini cross-origin, oklab non supportato...), a costo
// di perdere la possibilita' di generare un'anteprima 1:1 senza
// round-trip — accettabile, perche' l'anteprima interattiva nel
// modale (SocialExperienceCard.tsx) resta un React normale, mai
// catturato: solo il download passa da qui.
// =========================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const auth = await requireAdminSession(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const url = new URL(req.url);
  const formatId = (url.searchParams.get("format") || "portrait") as SocialCardFormatId;
  const showPrice = url.searchParams.get("showPrice") === "1";
  const requestedCta = url.searchParams.get("cta") || "";

  const format: SocialCardFormatConfig | undefined = SOCIAL_CARD_FORMATS[formatId];

  if (!format) {
    return NextResponse.json({ success: false, error: "Invalid format" }, { status: 400 });
  }

  try {

    const { data: proposal, error } = await getSupabaseAdmin()
      .from("Proposal")
      .select("slug")
      .eq("lead_id", id)
      .maybeSingle();

    if (error || !proposal) {
      return NextResponse.json(
        { success: false, error: "This lead has no proposal yet" },
        { status: 404 }
      );
    }

    const socialCardData = await getSocialCardDataForSlug(proposal.slug);

    if (!socialCardData) {
      return NextResponse.json(
        { success: false, error: "Could not generate the social card for this proposal" },
        { status: 404 }
      );
    }

    const effectiveCta = requestedCta || socialCardData.cta;

    const [fontLight, fontRegular, fontMedium] = await Promise.all([
      loadGoogleFont("Inter", 300),
      loadGoogleFont("Inter", 400),
      loadGoogleFont("Inter", 500),
    ]);

    const element = buildSocialCardElement(socialCardData, format, showPrice, effectiveCta);

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

    const filenameBase = `portovenere-experience-${proposal.slug}`;

    if (format.exportAs === "pdf") {

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const dataUri = `data:image/png;base64,${pngBuffer.toString("base64")}`;
      pdf.addImage(dataUri, "PNG", 0, 0, 210, 297);
      const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
        },
      });
    }

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filenameBase}-${formatId}.png"`,
      },
    });

  } catch (err) {

    console.error("admin/leads/[id]/social-card/export error:", err);

    return NextResponse.json({ success: false, error: "Could not generate the file" }, { status: 500 });
  }
}
