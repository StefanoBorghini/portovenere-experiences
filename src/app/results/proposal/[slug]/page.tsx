import { supabase } from "@/lib/supabase";

import { generateProposal }
from "@/lib/generateProposal";

import ProposalNarrative
from "@/components/proposal/ProposalNarrative";

import FeaturedExperience
from "@/components/proposal/FeaturedExperience";

import IncludedExperiences
from "@/components/proposal/IncludedExperiences";

import CinematicGallery
from "@/components/proposal/CinematicGallery";

import ProposalEnhancements
from "@/components/proposal/ProposalEnhancements";

import ReservationSection
from "@/components/proposal/ReservationSection";

import DownloadPdfButton
from "@/components/DownloadPdfButton";

import ProposalHero
from "@/components/proposal/ProposalHero";

import {
  buildRendererData,
} from "@/lib/proposal-engine/buildRendererData";

import {
  getFullExperiences,
} from "@/lib/supabase/experienceRepository";

// =========================================================
// TYPES
// =========================================================

interface ProposalPageProps {

  params: Promise<{
    slug: string;
  }>;
}

// =========================================================
// PAGE
// =========================================================

export default async function ProposalPage({

  params,

}: ProposalPageProps) {

  // =======================================================
  // PARAMS
  // =======================================================

  const { slug } =
    await params;

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

  // =======================================================
  // FETCH PROPOSAL
  // =======================================================

  const {
    data: proposal,
    error,
  } = await supabase

    .from("Proposal")

    .select("*")

    .eq("slug", slug)

    .single();

  const lead =
    proposal?.proposal_data;

  // =======================================================
  // NOT FOUND
  // =======================================================

  if (
    error ||
    !lead
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

        Proposal not found

      </main>
    );
  }

  // =======================================================
  // GENERATE PROPOSAL
  // =======================================================

  const dynamicExperiences =
  await getFullExperiences();
const generatedProposal =

  generateProposal({

    experiencesSelected:
      lead.experiences || [],

    moodsSelected:
      lead.moods || [],

    budget:
      lead.budget,

    guests:
      lead.guests,

    travelingWithChildren:
      lead.traveling_with_children || false,

    allExperiences:
      dynamicExperiences,
  });
  // =======================================================
  // RENDERER DATA
  // =======================================================

  const {

    galleryImages,

    enhancements,

    includedExperiences,

    finalPrice,

  } = buildRendererData({

    generatedProposal,

    lead,
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

 const dynamicIntroTitle =

  generatedProposal.dynamicIntroTitle ||

  "Curated Riviera Experience";

  const dynamicIntroParagraph =
    generatedProposal.dynamicIntroParagraph;

  const dynamicClosingParagraph =

  generatedProposal.dynamicClosingParagraph ||

  "We look forward to welcoming you into your private Riviera experience.";

  const featuredExperience =
    generatedProposal.featuredExperience;

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

            Private Reservation

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

            This proposal has expired

          </h1>

          <p
            className="
              text-zinc-400
              text-lg
              leading-[1.9]
            "
          >

            Your private reservation window is no longer active.
            Contact us directly to request a new curated proposal.

          </p>

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
    "Sail Boat King";

  const featuredSubtitle =
    "Private Riviera Sailing Experience";

  const featuredDescription =
    "A cinematic Riviera sailing experience curated around Mediterranean atmosphere, hidden coves and slow luxury navigation.";

  const featuredEssentials = [

    "Private skipper",

    "Sunset navigation",

    "Hidden coves access",

    "Onboard aperitivo",
  ];

  // =======================================================
  // RENDER
  // =======================================================

  return (

    <main
      id="proposal-content"
      className="
        bg-[#0C0C0C]
        text-white
        min-h-screen
      "
    >

      {/* HERO */}

      <ProposalHero

        heroImage={heroImage}

        heroTitle={heroTitle}

        guests={lead.guests}

        totalPrice={finalPrice}
      />

      {/* NARRATIVE */}

      <ProposalNarrative

        title={dynamicIntroTitle}

        paragraph={
          dynamicIntroParagraph
        }
      />

      {/* FEATURED EXPERIENCE */}

      <FeaturedExperience

        image={heroImage}

        operator={
          featuredOperator
        }

        subtitle={
          featuredSubtitle
        }

        description={
          featuredDescription
        }

        essentials={
          featuredEssentials
        }
      />

      {/* INCLUDED EXPERIENCES */}

      <IncludedExperiences

        experiences={
          includedExperiences
        }
      />

      {/* ENHANCEMENTS */}

      <ProposalEnhancements

        enhancements={
          enhancements
        }
      />

      {/* GALLERY */}

      <CinematicGallery

        images={
          galleryImages
        }
      />

      {/* PDF */}

      <section
        className="
          py-20
          px-6
          print:hidden
        "
      >

        <div
          className="
            max-w-4xl
            mx-auto
            flex
            justify-center
          "
        >

          <DownloadPdfButton />

        </div>

      </section>

      {/* CTA */}

      <ReservationSection

        expiresAt={expiresAt}

        closingParagraph={
          dynamicClosingParagraph
        }

        whatsappUrl={
          whatsappUrl
        }
      />

      {/* FOOTER */}

      <footer
        className="
          border-t
          border-white/10
          py-12
          px-6
        "
      >

        <div
          className="
            max-w-6xl
            mx-auto
            flex
            flex-col
            md:flex-row
            items-center
            justify-between
            gap-6
          "
        >

          <div
            className="
              text-center
              md:text-left
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-[0.35em]
                text-zinc-500
              "
            >

              Portovenere Experiences

            </p>

            <p
              className="
                text-zinc-400
                mt-3
                leading-relaxed
              "
            >

              Private curated luxury experiences in Liguria

            </p>

          </div>

          <div
            className="
              text-zinc-500
              text-sm
            "
          >

            info@portovenere.com

          </div>

        </div>

      </footer>

    </main>
  );
}