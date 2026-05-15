import { supabase } from "@/lib/supabase";

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

  // DYNAMIC LOGIC

  const isLuxury =
    lead.budget === "€3000+";

  const isRomantic =
    lead.mood === "Romantic";

  const isSailing =
    lead.experience === "Private Sailing";

  let heroTitle = "Mediterranean Escape";

  if (isSailing && isRomantic) {
    heroTitle = "Romantic Sailing Escape";
  }

  if (isLuxury) {
    heroTitle = "Ultra Luxury Riviera Experience";
  }

  let price = "€1700";

  if (isLuxury) {
    price = "€4200";
  }

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

  return (
    <main className="bg-[#0C0C0C] text-white min-h-screen">

      {/* HERO */}

      <section
        className="relative h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center px-6 max-w-5xl">

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

      {/* DETAILS */}

      <section className="py-32 px-6">

        <div className="max-w-5xl mx-auto">

          <div className="grid md:grid-cols-2 gap-8">

            <div className="border border-white/10 rounded-3xl p-10 bg-white/5">

              <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
                Experience
              </p>

              <h2 className="text-4xl font-light mb-6">
                {lead.experience}
              </h2>

              <p className="text-zinc-400 leading-8">
                A curated Mediterranean experience designed around your desired atmosphere and travel style.
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

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="pb-32 px-6">

        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-5xl md:text-6xl font-light mb-10">
            Ready to reserve your experience?
          </h2>

          <p className="text-xl text-zinc-400 leading-9 mb-14">
            Your private proposal has been curated specifically around your preferences and desired atmosphere.
          </p>

          <a
            href="mailto:info@portovenere.com"
            className="inline-block bg-white text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500"
          >
            Request Private Booking
          </a>

        </div>

      </section>

    </main>
  );
}