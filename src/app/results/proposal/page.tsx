import { supabase } from "../../../lib/supabase";
import DownloadPdfButton from "../../../components/DownloadPdfButton";

interface ProposalPageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function ProposalPage({
  searchParams,
}: ProposalPageProps) {

  const params = await searchParams;

  const id = params.id;

  if (!id || !supabase) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Missing proposal ID
      </main>
    );
  }

  // GET LEAD

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Proposal not found
      </main>
    );
  }

  // EXPERIENCE TYPES

  const isLuxury =
    lead.budget === "€3000+";

  const isRomantic =
    lead.mood === "Romantic";

  const isSailing =
    lead.experience === "Private Sailing";

  const isUnderwater =
    lead.experience === "Underwater Experience";

  const isSunset =
    lead.experience === "Sunset Dinner";

  // HERO TITLE

  let heroTitle = "Mediterranean Escape";

  if (isSailing && isRomantic) {
    heroTitle = "Romantic Sailing Escape";
  }

  if (isLuxury) {
    heroTitle = "Ultra Luxury Riviera Experience";
  }

  if (isUnderwater) {
    heroTitle = "Private Underwater Adventure";
  }

  if (isSunset) {
    heroTitle = "Sunset Riviera Experience";
  }

  // PRICING ENGINE

  let basePrice = 1700;

  // EXPERIENCE

  if (isUnderwater) {
    basePrice = 2200;
  }

  if (isSunset) {
    basePrice = 1900;
  }

  if (isLuxury) {
    basePrice = 4200;
  }

  // GUESTS

  if (lead.guests === "4") {
    basePrice += 400;
  }

  if (lead.guests === "6") {
    basePrice += 900;
  }

  if (lead.guests === "8+") {
    basePrice += 1800;
  }

  // MOOD

  if (isRomantic) {
    basePrice += 300;
  }

  // HIGH-END ADDONS

  if (isLuxury && lead.guests === "8+") {
    basePrice += 1500;
  }

  // FINAL PRICE

  const price =
    `€${basePrice.toLocaleString()}`;

  // HERO IMAGE

  let heroImage =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070";

  if (isSailing) {
    heroImage =
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=2070";
  }

  if (isLuxury) {
    heroImage =
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=2070";
  }

  if (isUnderwater) {
    heroImage =
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070";
  }

  if (isSunset) {
    heroImage =
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&w=2070";
  }

  // WHATSAPP CTA

  const whatsappMessage = encodeURIComponent(
    `Hi Stefano, I'd like to confirm my ${lead.experience} experience proposal for ${lead.guests} guests.`
  );

  const whatsappUrl =
    `https://wa.me/393487140722?text=${whatsappMessage}`;

  // PROPOSAL PAYLOAD

  const proposalPayload = {
    name: lead.name,
    email: lead.email,

    heroTitle,
    price,
    heroImage,

    experience: lead.experience,
    mood: lead.mood,
    guests: lead.guests,
    budget: lead.budget,
  };

  // CHECK IF PROPOSAL EXISTS

  const { data: existingProposal } = await supabase
    .from("Proposal")
    .select("id")
    .eq("lead_id", lead.id)
    .maybeSingle();

  // SAVE ONLY ONCE

  if (!existingProposal) {

    await supabase
      .from("Proposal")
      .insert([
        {
          lead_id: lead.id,

          slug: `${lead.name
            .toLowerCase()
            .replace(/\s+/g, "-")}-${Date.now()}`,

          proposal_data: proposalPayload,

          total_price: basePrice,
        },
      ]);
  }

  return (
    <main
      id="proposal-content"
      className="bg-[#0C0C0C] text-white min-h-screen"
    >

      {/* HERO */}

      <section
        className="relative h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroImage})`,
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

          <h1 className="text-6xl md:text-8xl font-light leading-none mb-10">
            {heroTitle}
          </h1>

          <p className="text-2xl md:text-3xl mb-12 text-zinc-200">
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

      {/* EXPERIENCE DETAILS */}

      <section className="py-32 px-6">

        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-20">

            <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
              Curated Experience
            </p>

            <h2 className="text-5xl md:text-7xl font-light leading-tight">
              Designed around your travel style.
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-8">

            <div className="border border-white/10 rounded-3xl p-10 bg-white/5">

              <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
                Experience
              </p>

              <h2 className="text-4xl font-light mb-6">
                {lead.experience}
              </h2>

              <p className="text-zinc-400 leading-8">
                A curated Mediterranean experience inspired by your desired atmosphere, preferred pace and ideal level of exclusivity.
              </p>

            </div>

            <div className="border border-white/10 rounded-3xl p-10 bg-white/5">

              <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
                Guest Profile
              </p>

              <div className="space-y-4 text-lg">

                <p>
                  Mood: {lead.mood}
                </p>

                <p>
                  Guests: {lead.guests}
                </p>

                <p>
                  Budget: {lead.budget}
                </p>

                <p>
                  Email: {lead.email}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* PDF DOWNLOAD */}

      <section className="pb-20 px-6">

        <div className="max-w-4xl mx-auto flex justify-center">

          <DownloadPdfButton />

        </div>

      </section>

      {/* CTA */}

      <section className="pb-32 px-6">

        <div className="max-w-4xl mx-auto text-center">

          <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
            Private Reservation
          </p>

          <h2 className="text-5xl md:text-6xl font-light mb-10">
            Ready to reserve your experience?
          </h2>

          <p className="text-xl text-zinc-400 leading-9 mb-14">
            Your proposal has been privately curated around your selected atmosphere and preferences.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            className="inline-block bg-white text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500"
          >
            Request Private Booking
          </a>

        </div>

      </section>

    </main>
  );
}