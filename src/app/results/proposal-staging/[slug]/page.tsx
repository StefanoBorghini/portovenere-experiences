import { supabase } from "@/lib/supabase";
import { generateProposal } from "@/lib/generateProposal";
import { buildProposalGallery } from "@/lib/buildProposalGallery";
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

import {
  calculateProposalPrice,
} from "@/lib/pricing";
import Countdown
from "@/components/countdown";

import DownloadPdfButton from "@/components/DownloadPdfButton";

import ProposalHero
from "@/components/proposal/ProposalHero";

interface ProposalPageProps {
  params: Promise<{
    slug: string;
  }>;
}


export default async function ProposalPage({
  params,
}: ProposalPageProps) {

  const { slug } = await params;

  if (!slug || !supabase) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Missing proposal ID
      </main>
    );
  }

  

  // GET PROPOSAL
 
  const { data: proposal, error } =
    await supabase
      .from("Proposal")
      .select("*")
      .eq("slug", slug)
      .single();

  const lead = proposal?.proposal_data;

  if (error || !lead) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Proposal not found
      </main>
    );
  }

  // GENERATE PROPOSAL

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
  });

    const includedSections =
  generatedProposal.includedSections;


 // =========================================================
// DYNAMIC CONTENT
// =========================================================

const heroTitle =
  generatedProposal.heroTitle;

const heroImage =
  generatedProposal.heroImage;

const dynamicIntroTitle =
  generatedProposal.dynamicIntroTitle;

const dynamicIntroParagraph =
  generatedProposal.dynamicIntroParagraph;

const dynamicClosingParagraph =
  generatedProposal.dynamicClosingParagraph;

console.log(
  "HERO IMAGE",
  heroImage
);

const featuredExperience =
  generatedProposal.featuredExperience;

const scoredExperiences =
  generatedProposal.scoredExperiences;

const galleryImages =
  buildProposalGallery({

    experiencesSelected:
      lead.experiences || [],

    moodsSelected:
      lead.moods || [],

    heroExperienceId:
      featuredExperience?.id || "",
  });

   const enhancements = [

  {
    image: galleryImages[0],

    title:
      "Private Transfer",

    description:
      "Private luxury transportation across the Riviera with curated pickup and drop-off experience.",
  },

  {
    image: galleryImages[1],

    title:
      "Boutique Stay",

    description:
      "Curated overnight stays in selected boutique properties and private hospitality locations.",
  },

  {
    image: galleryImages[2],

    title:
      "Personal Photographer",

    description:
      "Editorial-style Riviera photography throughout your curated private experience.",
  },

  {
    image: galleryImages[3],

    title:
      "Private Chef",

    description:
      "Elevated onboard culinary experiences designed around Mediterranean atmosphere.",
  },

  {
    image: galleryImages[3],

    title:
      "Sommelier Onboard",

    description:
      "Elevated onboard wine experiences designed around Mediterranean atmosphere.",
  },


  {
  image: galleryImages[4],

  title:
    "Live Onboard Music",

  description:
    "Live music performances curated around navigation and Mediterranean atmosphere.",
},
];


// PRICING ENGINE

const finalPrice =
  calculateProposalPrice({

    selectedExperiences:
      scoredExperiences || [],

    moodsSelected:
      lead.moods || [],

    guests:
      lead.guests,

    travelingWithChildren:
      lead.traveling_with_children || false,
  });

const price =
  `€${finalPrice.toLocaleString()}`;

  // =========================================================
// COUNTDOWN
// =========================================================

const expiresAt =
  proposal.expires_at;

const isExpired =

  new Date(expiresAt)
    .getTime() <

  Date.now();

const featuredOperator =
  "Sail Boat King";

  const includedExperiences = [

  {
    image: galleryImages[0],

    title:
      "Sunset Riviera Aperitivo",

    description:
      "A private culinary moment designed around Mediterranean sunset atmosphere and slow coastal navigation.",

    details: [

      "Local wine selection",

      "Private onboard setup",

      "Sunset aperitivo",
    ],
  },

  {
    image: galleryImages[1],

    title:
      "Hidden Coves Escape",

    description:
      "Discover secluded Riviera locations accessible only through private coastal navigation.",

    details: [

      "Private navigation",

      "Hidden swimming spots",

      "Slow luxury atmosphere",
    ],
  },

  {
    image: galleryImages[2],

    title:
      "Cinematic Riviera Moments",

    description:
      "Curated Riviera experiences designed around cinematic atmosphere and Mediterranean storytelling.",

    details: [

      "Editorial atmosphere",

      "Private experience",

      "Mediterranean scenery",
    ],
  },
];

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

if (isExpired) {

  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      flex
      items-center
      justify-center
      px-6
    ">

      <div className="text-center max-w-2xl">

        <p className="
          uppercase
          tracking-[0.4em]
          text-zinc-600
          text-xs
          mb-8
        ">
          Private Reservation
        </p>

        <h1 className="
          text-4xl
          md:text-7xl
          font-light
          mb-10
        ">
          This proposal has expired
        </h1>

        <p className="
          text-zinc-400
          text-lg
          leading-8
        ">
          Your private reservation window is no longer active.
          Contact us directly to request a new curated proposal.
        </p>

      </div>

    </main>
  );
}



  
  // WHATSAPP CTA

  const whatsappMessage =
    encodeURIComponent(
      `Hi Stefano, I'd like to confirm my ${featuredExperience?.title || "experience"} experience proposal for ${lead.guests} guests.`
    );

    

  const whatsappUrl =
    `https://wa.me/393487140722?text=${whatsappMessage}`;

  return (
    <main
      id="proposal-content"
      className="bg-[#0C0C0C] text-white min-h-screen"
    >

      {/* HERO */}

 <ProposalHero
  heroImage={heroImage}
  heroTitle={heroTitle}
  guests={lead.guests}
  totalPrice={finalPrice}
/>


      {/* DIVIDER */}

<ProposalNarrative
  title={dynamicIntroTitle}
  paragraph={dynamicIntroParagraph}
/>

{/* EXPERIENCE DETAILS */}
<FeaturedExperience
  image={heroImage}
  operator={featuredOperator}
  subtitle={featuredSubtitle}
  description={featuredDescription}
  essentials={featuredEssentials}
/>
<IncludedExperiences
  experiences={
    includedExperiences
  }
/>

<ProposalEnhancements
  enhancements={enhancements}
/>
      {/* GALLERY */}

<CinematicGallery
  images={galleryImages}
/>

      {/* PDF DOWNLOAD */}

      <section className="pb-20 pt-20 px-6 print:hidden">

        <div className="max-w-4xl mx-auto flex justify-center">

          <DownloadPdfButton />

        </div>

      </section>


     {/* CTA */}

<ReservationSection
  expiresAt={expiresAt}
  closingParagraph={
    dynamicClosingParagraph
  }
  whatsappUrl={whatsappUrl}
/>

      {/* FOOTER */}

      <footer className="text-center border-t border-white/10 py-12 px-6">

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

          <div>

            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Portovenere Experiences
            </p>

            <p className="text-zinc-400 mt-2">
              Private curated luxury experiences in Liguria
            </p>

          </div>

          <div className="text-zinc-500 text-sm">
            info@portovenere.com
          </div>

        </div>

      </footer>

    </main>
  );
}