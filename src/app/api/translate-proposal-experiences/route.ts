/**
 * POST /api/translate-proposal-experiences
 * =====================================================================
 * Chiamata fire-and-forget da craft-your-experience subito dopo aver
 * salvato il lead (stesso pattern di /api/notify-new-proposal) — NON
 * blocca mai la generazione della proposal, un suo fallimento non deve
 * mai impedire al cliente di vedere la proposal (semplicemente restera'
 * in inglese finche' non viene ritentata).
 *
 * A differenza del backfill one-shot (src/scripts/backfill-experience-
 * translations.mjs, che traduce l'intero catalogo), qui rifacciamo lo
 * stesso matching di generateProposal() + buildRendererData() usato
 * dalla pagina proposal per capire ESATTAMENTE quali esperienze
 * finiranno mostrate in QUESTA proposal (la featured + le
 * includedExperiences di "Potrebbe piacerti anche") e traduciamo solo
 * quelle — niente quota Lara sprecata su esperienze che nessuna
 * proposal ha ancora selezionato.
 *
 * Body: { leadId }
 * =====================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/adminClient";
import { getBookableExperiences } from "@/lib/supabase/experienceRepository";
import { getBookableEnhancements } from "@/lib/supabase/enhancementRepository";
import { generateProposal } from "@/lib/generateProposal";
import { buildRendererData } from "@/lib/proposal-engine/buildRendererData";
import { syncFullExperienceTranslations } from "@/lib/translations/translateExperience";
import { syncAllEnhancementTranslations } from "@/lib/translations/translateEnhancement";
import { mapWithConcurrency } from "@/lib/concurrencyLimit";

// Tradurre content+sections+facts per piu' esperienze (la featured + i
// suggested add-ons) puo' richiedere piu' del limite di default di una
// funzione serverless Vercel (10s su Hobby) — osservato
// direttamente: la prima esperienza processata finiva tradotta per
// intero, le successive sempre meno, l'ultima per niente, esattamente
// il pattern di un timeout a meta' esecuzione. Alza il limite al
// massimo permesso dal piano.
export const maxDuration = 60;

export async function POST(request: NextRequest) {

  try {

    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "leadId is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select(
        "experiences, moods, budget, guests, children, traveling_with_children, accessibility, start_date, end_date, preferred_time"
      )
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      console.error(
        `[api/translate-proposal-experiences] could not load lead ${leadId}:`,
        leadError
      );
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Stesso calcolo di tripDays di results/proposal/[slug]/page.tsx.
    const tripDays =
      lead.start_date && lead.end_date
        ? Math.max(
            1,
            Math.round(
              (new Date(lead.end_date).getTime() -
                new Date(lead.start_date).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1
          )
        : undefined;

    // Locale "en" qui non conta ai fini del matching (i campi usati da
    // generateProposal — budget_*, guest_*, ecc. — non sono localizzati),
    // ci serve solo per ottenere gli id delle esperienze coinvolte.
    const allExperiences = await getBookableExperiences("en");

    const generatedProposal = generateProposal({
      experiencesSelected: lead.experiences || [],
      moodsSelected: lead.moods || [],
      budget: lead.budget,
      guests: lead.guests,
      children: lead.children,
      travelingWithChildren: lead.traveling_with_children || false,
      accessibility: lead.accessibility,
      tripDays,
      startDate: lead.start_date,
      endDate: lead.end_date,
      allExperiences,
    });

    // "Potrebbe piacerti anche" NON viene da suggestedAddOns (quello e'
    // solo un fallback usato da buildRendererData quando il pool
    // primario e' vuoto) — viene da includedExperiences, calcolate da
    // buildRendererData con la sua logica di compatibilita'/punteggio.
    // Usare solo suggestedAddOns qui significava non tradurre mai le
    // esperienze che finiscono davvero mostrate nella maggior parte
    // delle proposal (ogni volta che e' stata selezionata piu' di una
    // categoria, il caso comune). enhancements: [] perche' qui non ci
    // servono gli enhancement cards, solo includedExperiences.
    const { includedExperiences } = buildRendererData({
      generatedProposal,
      lead,
      enhancements: [],
    });

    const experienceIds = new Set<string>();

    if (generatedProposal.featuredExperience?.id) {
      experienceIds.add(generatedProposal.featuredExperience.id);
    }

    for (const experience of includedExperiences ?? []) {
      if (experience?.id) experienceIds.add(experience.id);
    }

    // Ogni esperienza ora costa solo 3 chiamate Lara (content, sections
    // in blocco, facts in blocco — vedi syncFullExperienceTranslations),
    // non piu' una per fact/section: possiamo permetterci piu' esperienze
    // in parallelo qui e restare comunque ben sotto la soglia che causava
    // fallimenti per rate limiting quando tutto girava insieme.
    await mapWithConcurrency(Array.from(experienceIds), 4, async (id) => {
      try {
        await syncFullExperienceTranslations(id);
      } catch (err) {
        console.error(`[api/translate-proposal-experiences] failed for ${id}:`, err);
      }
    });

    // ENHANCEMENT ("Boutique Stays", "Private Transfer", ecc.) — catalogo
    // piccolo e stabile (poche righe), non ha bisogno del meccanismo
    // on-demand per-esperienza: una sola chiamata Lara per tutto il
    // catalogo, e syncAllEnhancementTranslations salta da sola quelli
    // gia' tradotti e invariati — dopo la prima proposal generata questo
    // costa ~0 quota finche' qualcuno non modifica un enhancement in admin.
    // Solo quelli attivi: buildRendererData li esclude comunque
    // (enhancementCards filtra su item.active), tradurre i disattivati
    // sarebbe quota spesa su contenuto che nessuna proposal mostrera' mai.
    try {
      const allEnhancements = await getBookableEnhancements();
      const activeEnhancements = allEnhancements.filter((e) => e.active !== false);
      await syncAllEnhancementTranslations(activeEnhancements);
    } catch (err) {
      console.error("[api/translate-proposal-experiences] enhancement translation failed:", err);
    }

    // Il riepilogo dinamico ("Created exclusively for...") NON passa
    // piu' da qui: e' composto a partire da pezzi gia' tradotti una
    // tantum (template + fascia oraria via site_copy, nomi categorie/
    // mood riusati dal configuratore) invece che da una chiamata Lara
    // per ogni proposal — vedi buildProposalSummary.ts.

    return NextResponse.json({ success: true, translated: Array.from(experienceIds) });

  } catch (err) {

    console.error("[api/translate-proposal-experiences] unexpected error:", err);

    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
