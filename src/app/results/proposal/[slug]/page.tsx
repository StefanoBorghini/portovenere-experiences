import { cache } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProposalClient from "./proposalClient";
import {
  getBookableEnhancements,
} from "@/lib/supabase/enhancementRepository";
import { generateProposal }
from "@/lib/generateProposal";



import {
  buildRendererData,
} from "@/lib/proposal-engine/buildRendererData";

import {
  getBookableExperiences,
} from "@/lib/supabase/experienceRepository";
import { getCurrentLocale } from "@/i18n/locale";
import { getTranslations } from "next-intl/server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

// =========================================================
// PROPOSAL CORE — fetch + generateProposal(), condivisi tra
// generateMetadata() e il componente pagina qui sotto. Sono due
// invocazioni separate nella stessa request (Next non le dedup
// automaticamente come fa per fetch()), quindi wrappiamo in
// cache() cosi' il lavoro (query Supabase + matching) viene fatto
// una volta sola, non due.
// =========================================================

const getProposalCore = cache(async (slug: string) => {

  if (!slug || !supabase) {
    return null;
  }

  const { data: proposal, error } = await supabase
    .from("Proposal")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !proposal) {
    return null;
  }

  const lead = proposal.proposal_data;

  if (!lead) {
    return null;
  }

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

  const locale = await getCurrentLocale();

  const dynamicExperiences = await getBookableExperiences(locale);

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
    allExperiences: dynamicExperiences,
  });

  return { proposal, lead, locale, generatedProposal };
});

// =========================================================
// METADATA — Open Graph/Twitter card dinamica per-proposal, cosi'
// il link condiviso (WhatsApp, ecc.) mostra l'immagine hero e il
// titolo di QUELLA proposta specifica, non piu' l'immagine
// generica del sito per tutte. Fallback sui default del layout
// (src/app/layout.tsx) per i casi senza match/scaduti/non trovati,
// cosi' nessuna regressione per quei rami.
// =========================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {

  const { slug } = await params;

  const core = await getProposalCore(slug);

  const featuredExperience = core?.generatedProposal.featuredExperience;

  if (!core || !featuredExperience) {

    return {
      title: "Portovenere Experiences",
      description: "Private luxury experiences on the Italian Riviera.",
      openGraph: {
        title: "Portovenere Experiences",
        description: "Private luxury experiences on the Italian Riviera.",
        url: `${SITE_URL}/results/proposal/${slug}`,
        siteName: "Portovenere Experiences",
        images: [{ url: `${SITE_URL}/hero-config.jpg`, width: 1200, height: 630 }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Portovenere Experiences",
        description: "Private luxury experiences on the Italian Riviera.",
        images: [`${SITE_URL}/hero-config.jpg`],
      },
    };
  }

  const heroImage = core.generatedProposal.heroImage || "/images/default-hero.webp";

  const absoluteHeroImage = heroImage.startsWith("http")
    ? heroImage
    : `${SITE_URL}${heroImage}`;

  const title = `${core.generatedProposal.heroTitle || featuredExperience.title} — Portovenere Experiences`;

  const description =
    featuredExperience.short_description ||
    featuredExperience.description ||
    "A private luxury experience curated for you on the Italian Riviera.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/results/proposal/${slug}`,
      siteName: "Portovenere Experiences",
      images: [{ url: absoluteHeroImage }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteHeroImage],
    },
  };
}

// =========================================================
// TYPES
// =========================================================

interface ProposalPageProps {

  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

// =========================================================
// PAGE
// =========================================================

export default async function ProposalPage({

  params,
   searchParams,

}: ProposalPageProps) {

  // =======================================================
  // PARAMS
  // =======================================================



  const { slug } =
    await params;

  // Chiamata qui, prima di ogni return anticipato (validation/no-match/
  // expired compresi), cosi' e' disponibile in tutti i rami — non solo
  // nel percorso "felice" piu' sotto. Senza namespace: serve per
  // raggiungere sia "proposal.*" che "configurator.*" (buildProposalSummary
  // riusa le traduzioni di categorie/mood del configuratore).
  const t = await getTranslations();

  // =======================================================
  // VALIDATION
  // =======================================================

  if (
    !slug ||
    !supabase
  ) {

    return (

      <main
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
        "
      >

        Missing proposal ID

      </main>
    );
  }
const resolvedSearchParams =
    await searchParams;
  // =======================================================
  // FETCH PROPOSAL + GENERATE PROPOSAL
  // Stessa logica gia' eseguita da generateMetadata() qui sopra —
  // getProposalCore e' cache()-ata per request, quindi questa
  // chiamata riusa il risultato gia' calcolato invece di rifare
  // la query Supabase e il matching da capo.
  // =======================================================

  const core = await getProposalCore(slug);

  // =======================================================
  // CONCIERGE FEE GIA' PAGATA — la proposal non e' piu' modificabile
  // da questo momento: si va sulla pagina di sola lettura
  // (results/proposal/[slug]/confirmed), mai piu' su questa (checkbox,
  // "Prenota ora"/"Confirm changes"). Va controllato PRIMA di ogni
  // altra elaborazione, cosi' anche un vecchio link salvato non
  // riporta mai a una proposal ormai congelata.
  // =======================================================

  if (core?.proposal?.payment_status === "deposit_paid") {
    redirect(`/results/proposal/${slug}/confirmed`);
  }

  // =======================================================
  // NOT FOUND
  // =======================================================

  if (!core) {

    return (

      <main
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
        "
      >

        Proposal not found

      </main>
    );
  }

  const { proposal, lead, locale, generatedProposal } = core;

  const dynamicEnhancements =
  await getBookableEnhancements(locale);

  // =======================================================
  // RENDERER DATA
  // =======================================================

   const {
    galleryImages,
    enhancements,
    includedExperiences,
    includedExperiencesPreSelected,
    isMultiDayTrip,
    finalPrice,
    proposalSummary,
  } = buildRendererData({

    generatedProposal,

    lead,

    enhancements:
    dynamicEnhancements,

    t,

    locale,
  });

  // =======================================================
  // DYNAMIC CONTENT
  // =======================================================

  const heroTitle =

  generatedProposal.heroTitle ||

  "Mediterranean Escape";

  const heroImage =

  generatedProposal.heroImage ||

  "/images/default-hero.webp";

 // introTitles/closingParagraphs vengono da site_copy (tradotti una
 // volta sola, non per-proposal — sono solo 5+4 varianti fisse, non
 // testo dinamico): peschiamo per indice invece di usare la stringa
 // inglese di generateProposal, che resta solo come fallback per il
 // caso "nessuna esperienza trovata" (indice non disponibile).
 // (t dichiarato in cima alla funzione, disponibile qui.)

 const dynamicIntroTitle =

  generatedProposal.dynamicIntroTitleIndex !== undefined
    ? t(`proposal.introTitles.${generatedProposal.dynamicIntroTitleIndex}`)
    : generatedProposal.dynamicIntroTitle ||
      "Curated Riviera Experience";

  const dynamicIntroParagraph =
    generatedProposal.dynamicIntroParagraph;

  const dynamicClosingParagraph =

  generatedProposal.dynamicClosingParagraphIndex !== undefined
    ? t(`proposal.closingParagraphs.${generatedProposal.dynamicClosingParagraphIndex}`)
    : generatedProposal.dynamicClosingParagraph ||

  "We look forward to welcoming you into your private Riviera experience.";

 const featuredExperience =
  generatedProposal.featuredExperience;

// =======================================================
// NO MATCHING EXPERIENCE
// =======================================================

if (!featuredExperience) {

  return (

    <main
      className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
        px-6
        py-24
      "
    >

      <div
        className="
          text-center
          max-w-2xl
        "
      >

        <p
          className="
            uppercase
            tracking-[0.4em]
            text-zinc-600
            text-xs
            mb-8
          "
        >

          {t("proposal.reservation.label")}

        </p>

        <h1
          className="
            text-4xl
            md:text-7xl
            font-light
            leading-[0.92]
            tracking-[-0.04em]
            mb-10
          "
        >

          {t("proposal.noMatch.title")}

        </h1>

        <p
          className="
            text-zinc-400
            text-lg
            leading-[1.9]
            mb-12
          "
        >

          {t("proposal.noMatch.description")}

        </p>
<a

          href="/craft-your-experience"
          className="
            inline-block
            bg-white
            text-black
            px-10
            py-5
            rounded-full
            uppercase
            tracking-[0.25em]
            text-xs
            hover:scale-105
            transition-all
            duration-500
          "
        >
          {t("proposal.noMatch.cta")}
        </a>

        <div className="mt-8">
          <a
            href={`https://wa.me/393487140722?text=${encodeURIComponent(
              `Hi Stefano, I'm ${lead.name} and I couldn't find a matching experience for my request. Could you help me put together a custom proposal?`
            )}`}
            target="_blank"
            className="
              inline-block
              border
              border-white/20
              rounded-full
              px-6
              py-3
              text-white/60
              text-[11px]
              uppercase
              tracking-[0.22em]
              hover:border-white/40
              hover:text-white
              transition-all
              duration-500
            "
          >
            {t("common.speakWithTeam")}
          </a>
        </div>

      </div>

    </main>
  );
}




  // =======================================================
  // EXPIRATION
  // =======================================================

  const expiresAt =
    proposal.expires_at;

  const isExpired =

    new Date(expiresAt)
      .getTime() <

    Date.now();

  // =======================================================
  // EXPIRED
  // =======================================================

  if (isExpired) {

    return (

      <main
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
          px-6
        "
      >

        <div
          className="
            text-center
            max-w-2xl
          "
        >

          <p
            className="
              uppercase
              tracking-[0.4em]
              text-zinc-600
              text-xs
              mb-8
            "
          >

            {t("proposal.reservation.label")}

          </p>

          <h1
            className="
              text-4xl
              md:text-7xl
              font-light
              leading-[0.92]
              tracking-[-0.04em]
              mb-10
            "
          >

            {t("proposal.expired.title")}

          </h1>

          <p
            className="
              text-zinc-400
              text-lg
              leading-[1.9]
            "
          >

            {t("proposal.expired.description")}

          </p>

          <a
            href="/craft-your-experience"
            className="
              inline-block
              bg-white
              text-black
              px-10
              py-5
              rounded-full
              uppercase
              tracking-[0.25em]
              text-xs
              hover:scale-105
              transition-all
              duration-500
              mt-12
            "
          >
            {t("proposal.noMatch.cta")}
          </a>

          <div className="mt-8">
            <a
              href={`https://wa.me/393487140722?text=${encodeURIComponent(
                `Hi Stefano, I'm ${lead.name} and my ${featuredExperience?.title || "experience"} proposal has expired. Could you help me get a new one?`
              )}`}
              target="_blank"
              className="
                inline-block
                border
                border-white/20
                rounded-full
                px-6
                py-3
                text-white/60
                text-[11px]
                uppercase
                tracking-[0.22em]
                hover:border-white/40
                hover:text-white
                transition-all
                duration-500
              "
            >
              {t("common.speakWithTeam")}
            </a>
          </div>

        </div>

      </main>
    );
  }

  // =======================================================
  // WHATSAPP
  // =======================================================

  const whatsappMessage =

    encodeURIComponent(

      `Hi Stefano, I'd like to confirm my ${featuredExperience?.title || "experience"} experience proposal for ${lead.guests} guests.`
    );

  const whatsappUrl =

    `https://wa.me/393487140722?text=${whatsappMessage}`;

  // =======================================================
  // FEATURED EXPERIENCE
  // =======================================================
const featuredOperator =
  featuredExperience?.operator || "";

const featuredSubtitle =
  featuredExperience?.title || "";

const featuredDescription =
  featuredExperience?.description || "";

const featuredEssentials =
  featuredExperience?.essentials || [];

  const featuredSections =
    featuredExperience?.sections || [];

  // =======================================================
  // RENDER
  // =======================================================

  return (

<ProposalClient

    heroImage={heroImage}

    heroTitle={heroTitle}

    lead={lead}

    featuredExperience={featuredExperience}

    includedExperiences={includedExperiences}

    includedExperiencesPreSelected={includedExperiencesPreSelected}

    enhancements={enhancements}

    galleryImages={galleryImages}

    expiresAt={expiresAt}

    whatsappUrl={whatsappUrl}

    isMultiDayTrip={isMultiDayTrip}


  dynamicIntroParagraph={dynamicIntroParagraph ?? ""}
dynamicClosingParagraph={dynamicClosingParagraph ?? ""}
dynamicIntroTitle={dynamicIntroTitle ?? ""}

    finalPrice={finalPrice}

    proposalSummary={proposalSummary}

    slug={slug}
      leadName={lead.name}
      leadEmail={lead.email}
alreadyVerified={proposal.email_verified === true}
alreadyRequested={proposal.booking_requested_at != null}
confirmedSelection={proposal.confirmed_selection ?? null}

/>

);}