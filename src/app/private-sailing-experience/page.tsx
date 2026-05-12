import { cookies } from "next/headers";

export default async function PrivateSailingExperience() {

  const cookieStore = await cookies();

  const clientName =
    cookieStore.get("clientName")?.value || "Private Guest";

  return (
    <main className="bg-white text-black overflow-hidden">

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#1C2A36] text-white">

        <img
          src="https://www.portovenere.com/wp-content/uploads/2026/02/352.webp"
          alt="Portovenere Sailing"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center px-6 max-w-6xl">

          <p className="uppercase tracking-[0.45em] text-sm text-neutral-300 mb-6">
            Portovenere & Gulf of Poets
          </p>

          <p className="uppercase tracking-[0.35em] text-sm text-neutral-300 mb-4">
            Private Proposal Prepared For
          </p>

          <h2 className="text-2xl md:text-4xl font-light italic mb-10">
            {clientName}
          </h2>

          <h1 className="text-6xl md:text-8xl font-light leading-none mb-10">
            Private Sailing <br />
            Experience
          </h1>

          <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed max-w-3xl mx-auto">
            Tailored sailing experiences designed for an authentic
            and unforgettable day at sea.
          </p>

        </div>

      </section>

      {/* INTRO */}
      <section className="py-32 px-6">

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">

          <div>

            <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-6">
              The Experience
            </p>

            <h2 className="text-5xl md:text-7xl font-light leading-tight mb-10">
              Discover the Gulf of Poets from a unique perspective at sea.
            </h2>

            <div className="space-y-8 text-lg leading-9 text-neutral-700">

              <p>
                Sail through one of the most breathtaking stretches of the
                Ligurian coastline, exploring Palmaria, Tino and Tinetto islands,
                the colorful village of Portovenere and the elegant seaside gems
                of Lerici and Tellaro.
              </p>

              <p>
                Cruise across crystal-clear waters, hidden coves and dramatic
                cliffs accessible only by boat, immersed in the authentic
                atmosphere of the Gulf of Poets.
              </p>

              <p>
                An exclusive and highly scenic experience, designed for those
                who want to experience Liguria in a more intimate,
                authentic and relaxed way.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-6">

            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1974&auto=format&fit=crop"
              alt="Sea"
              className="rounded-3xl h-[500px] object-cover w-full"
            />

            <img
              src="https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&w=1974&auto=format&fit=crop"
              alt="Boat"
              className="rounded-3xl h-[500px] object-cover w-full mt-16"
            />

          </div>

        </div>

      </section>

      {/* DETAILS */}
      <section className="py-32 px-6 bg-neutral-100">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-24">

            <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-6">
              Experience Details
            </p>

            <h2 className="text-5xl md:text-7xl font-light">
              Curated private sailing.
            </h2>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            <div className="bg-white rounded-3xl p-10">
              <h3 className="text-2xl font-light mb-6">
                Duration
              </h3>

              <p className="text-neutral-700 leading-8">
                7 hours private sailing experience.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10">
              <h3 className="text-2xl font-light mb-6">
                Departure
              </h3>

              <p className="text-neutral-700 leading-8">
                Porto delle Grazie – Portovenere.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10">
              <h3 className="text-2xl font-light mb-6">
                Yacht
              </h3>

              <p className="text-neutral-700 leading-8">
                Private 40ft sailing yacht with local crew.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10">
              <h3 className="text-2xl font-light mb-6">
                Guests
              </h3>

              <p className="text-neutral-700 leading-8">
                Curated private experience for 2 guests.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* ITINERARY */}
      <section className="py-32 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-24">

            <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-6">
              Itinerary
            </p>

            <h2 className="text-5xl md:text-7xl font-light leading-tight">
              Hidden coves, islands and timeless villages.
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-20 items-center mb-24">

            <div className="space-y-14">

              <div>
                <h3 className="text-3xl font-light mb-4">
                  Panoramic Sailing
                </h3>

                <p className="text-lg leading-9 text-neutral-700">
                  Navigation through Portovenere, Palmaria, Tino,
                  Tinetto, Lerici and Tellaro.
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-light mb-4">
                  Swimming Stops
                </h3>

                <p className="text-lg leading-9 text-neutral-700">
                  Swim in crystal-clear bays and hidden coves accessible only by sea.
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-light mb-4">
                  Relaxed Exploration
                </h3>

                <p className="text-lg leading-9 text-neutral-700">
                  Slow navigation along dramatic cliffs and picturesque Mediterranean villages.
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-light mb-4">
                  Optional Land Stops
                </h3>

                <p className="text-lg leading-9 text-neutral-700">
                  Possibility to stop in Portovenere, Lerici or Tellaro,
                  depending on sea conditions.
                </p>
              </div>

            </div>

            <div>

              <img
                src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1974&auto=format&fit=crop"
                alt="Sea"
                className="rounded-3xl w-full h-[750px] object-cover"
              />

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}