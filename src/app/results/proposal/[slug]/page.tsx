import { supabase } from "@/lib/supabase";
import { generateProposal } from "@/lib/generateProposal";
import { buildProposalGallery } from "@/lib/buildProposalGallery";

import {
  calculateProposalPrice,
} from "@/lib/pricing";

import DownloadPdfButton from "@/components/DownloadPdfButton";



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

      <section
        className="relative h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            `url(${heroImage})`,
        }}
      >

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center px-6 max-w-5xl">

          <img
            src="/logo-white.png"
            alt="Portovenere Experiences"
            className="mx-auto w-44 mb-10 opacity-90"
          />

          <p className="uppercase tracking-[0.4em] text-sm mb-6">
            Private Proposal
          </p>

          <h1 className="text-4xl md:text-8xl font-light leading-none mb-10">
            {heroTitle}
          </h1>

          <p className="text-xl md:text-3xl mb-12 text-zinc-200">
            Tailored for {lead.name}
          </p>

          <div className="inline-block border border-white/20 bg-white/10 backdrop-blur-md rounded-full px-10 py-5">

            <p className="uppercase tracking-[0.3em] text-xs mb-2">
              Starting From
            </p>

            <p className="text-4xl font-light">
              {price}
            </p>

          </div>

        </div>

      </section>

      {/* DIVIDER */}

<section className="py-32 md:py-40 px-6 border-y border-white/10 bg-black">

  <div className="max-w-5xl mx-auto text-center">

    <p className="
      uppercase
      tracking-[0.4em]
      text-zinc-600
      text-xs
      mb-8
    ">
      Mediterranean Luxury
    </p>

    <h2 className="
      text-4xl
      md:text-7xl
      font-light
      leading-[1.1]
      tracking-tight
      mb-12
    ">
      {dynamicIntroTitle}
    </h2>

    <p className="
      text-zinc-400
      text-lg
      md:text-2xl
      leading-relaxed
      max-w-3xl
      mx-auto
    ">
      {dynamicIntroParagraph}
    </p>

  </div>

</section>

{/* EXPERIENCE DETAILS */}

<section className="py-20 md:py-32 px-6">

  <div className="max-w-6xl mx-auto">

    <div className="text-center mb-20">

      <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
        Curated Experience
      </p>

      <h2 className="text-3xl md:text-7xl font-light leading-tight">
        Designed around your travel profile.
      </h2>

    </div>

    <div className="grid md:grid-cols-2 gap-8">

      {/* EXPERIENCE */}

      <div className="border border-white/10 rounded-3xl p-6 md:p-10 bg-white/5">

        <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
          Featured Experience
        </p>

        <h2 className="
          text-4xl
          md:text-6xl
          font-light
          mb-8
          leading-tight
        ">
          {featuredExperience?.operator || "Experience"}
        </h2>

        <p className="text-zinc-400 leading-8 text-lg">

          {
            featuredExperience
              ?.included?.[0]
              ?.description ||

            "A private curated Riviera experience tailored around your selected atmosphere."
          }

        </p>

      </div>

      {/* PROFILE */}

      <div className="border border-white/10 rounded-3xl p-6 md:p-10 bg-white/5">

        <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
          Guest Profile
        </p>

        <div className="space-y-5 text-lg">

          <p>
            Experiences:
            {" "}
            {lead.experiences?.join(", ")}
          </p>

          <p>
            Atmosphere:
            {" "}
            {lead.moods?.join(", ")}
          </p>

          <p>
            Guests:
            {" "}
            {lead.guests}
          </p>

          <p>
            Budget:
            {" "}
            {lead.budget}
          </p>

          <p>
            Travel Dates:
            {" "}
            {lead.start_date}
            {" "}
            —
            {" "}
            {lead.end_date}
          </p>

          <p>
            Children:
            {" "}
            {lead.traveling_with_children
              ? "Yes"
              : "No"}
          </p>

        </div>

      </div>

    </div>

  </div>

</section>

{/* INCLUDED */}

<section className="pb-32 px-6">

  <div className="max-w-5xl mx-auto">

    <h2 className="
      text-4xl
      md:text-6xl
      font-light
      mb-20
      text-center
      leading-tight
    ">
      Included in your experience
    </h2>

    <div className="grid md:grid-cols-2 gap-6">

      {includedSections?.map(
        (
          section: any,
          index: number
        ) => (

          <div
            key={index}
            className="border border-white/10 rounded-2xl p-8 bg-white/5"
          >

            <p className="uppercase tracking-[0.25em] text-xs text-zinc-500 mb-5">
              {section.title}
            </p>

            <p className="text-zinc-300 leading-8 whitespace-pre-line">
              {section.text}
            </p>

            {section.optional && (

              <p className="text-zinc-600 text-[11px] italic mt-5 tracking-[0.08em]">
                * Optional curated activity available upon request
              </p>

            )}

          </div>

        )
      )}

    </div>

  </div>

</section>
      {/* GALLERY */}

<section className="pb-32 px-6">

  <div className="max-w-7xl mx-auto">

    <div className="text-center mb-20">

      <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
        Experience Gallery
      </p>

      <h2 className="text-5xl md:text-6xl font-light">
        Moments from the Riviera
      </h2>

    </div>

    <div className="grid md:grid-cols-3 gap-6">

  {galleryImages?.map(
    (
      image: string,
      index: number
    ) => (

      <div
        key={index}
        className="relative overflow-hidden rounded-[32px] group"
      >

        <img
          src={image}
          alt="Experience"
          className="
            h-[520px]
            w-full
            object-cover
            transition-all
            duration-700
            group-hover:scale-105
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      </div>

    )
  )}

</div>

  </div>

</section>

      {/* PDF DOWNLOAD */}

      <section className="pb-20 px-6 print:hidden">

        <div className="max-w-4xl mx-auto flex justify-center">

          <DownloadPdfButton />

        </div>

      </section>

      {/* CTA */}

     {/* CTA */}

<section className="pb-40 px-6">

  <div className="max-w-4xl mx-auto text-center">

    <p className="
      uppercase
      tracking-[0.35em]
      text-xs
      text-zinc-600
      mb-8
    ">
      Private Reservation
    </p>

    <div className="
      text-5xl
      md:text-7xl
      font-light
      mb-10
    ">
      72h 00m
    </div>

    <h2 className="
      text-3xl
      md:text-6xl
      font-light
      leading-tight
      mb-10
    ">
      Ready to reserve your experience?
    </h2>

    <div className="
      text-zinc-400
      leading-8
      md:leading-9
      mb-14
      space-y-6
      max-w-3xl
      mx-auto
    ">

      <p className="text-lg md:text-xl">

        {dynamicClosingParagraph}

      </p>

      <div className="
        pt-10
        text-sm
        uppercase
        tracking-[0.25em]
        text-zinc-500
        space-y-3
      ">

        <p>
          Stefano
        </p>

        <p>
          Portovenere Experiences
        </p>

        <p>
          info@portovenere.com
        </p>

        <p>
          +39 348 714 0722
        </p>

      </div>

    </div>

    <a
      href={whatsappUrl}
      target="_blank"
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
      Request Private Booking
    </a>

  </div>

</section>

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