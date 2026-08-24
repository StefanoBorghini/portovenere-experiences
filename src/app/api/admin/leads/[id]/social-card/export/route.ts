import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/requireAdminSession";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { getSocialCardDataForSlug } from "@/lib/social-card/getSocialCardDataForProposal";
import { renderSocialCardFile } from "@/lib/social-card/renderSocialCardFile";
import { SocialCardFormatId } from "@/types/socialCard";

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
//
// maxDuration esplicito — questa route fa parecchio lavoro in una
// sola richiesta (rigenera l'intera proposal, scarica 3 pesi di
// font da Google, scarica e ri-codifica fino a 4 immagini): puo'
// superare facilmente il timeout di default delle funzioni
// serverless (10s), che ucciderebbe la funzione prima che il nostro
// try/catch possa intervenire — da cui un 500 "vuoto" senza il
// messaggio d'errore dettagliato che il catch qui sotto produrrebbe.
// =========================================================

export const maxDuration = 60;

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

    const { buffer, contentType, filename } = await renderSocialCardFile(
      socialCardData,
      formatId,
      showPrice,
      effectiveCta,
      proposal.slug
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (err) {

    console.error("admin/leads/[id]/social-card/export error:", err);

    // Route gia' protetta da requireAdminSession — nessun rischio a
    // esporre il messaggio reale qui, e aiuta a diagnosticare senza
    // dover per forza guardare i log del server.
    const message = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: `Could not generate the file: ${message}` },
      { status: 500 }
    );
  }
}
