import { supabase } from "@/lib/supabase";
import ProposalClient from "./proposalClient";
import {
  getEnhancements,
} from "@/lib/supabase/enhancementRepository";
import { generateProposal }
from "@/lib/generateProposal";



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

  const dynamicEnhancements =
  await getEnhancements();

 
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
    includedExperiencesPreSelected,
    isMultiDayTrip,
    finalPrice,
    proposalSummary,
  } = buildRendererData({

    generatedProposal,

    lead,

    enhancements:
    dynamicEnhancements,
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
// NO MATCHING EXPERIENCE
// =======================================================

if (!featuredExperience) {

  const debug = generatedProposal.noMatchDebug;

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

          No matching experience found

        </h1>

        <p
          className="
            text-zinc-400
            text-lg
            leading-[1.9]
            mb-12
          "
        >

          We couldn't find an experience matching these preferences yet.
          Contact us directly to request a new curated proposal.

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
          Back to configurator
        </a>

       

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
confirmedSelection={proposal.confirmed_selection ?? null}    

/>

);}