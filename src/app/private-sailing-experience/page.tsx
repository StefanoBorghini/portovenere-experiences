export default function PrivateSailingExperience() {
  return (
    <main className="bg-white text-black">

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black text-white">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070&auto=format&fit=crop"
          alt="Portovenere Sailing"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <p className="uppercase tracking-[0.4em] text-sm text-neutral-300 mb-6">
            Portovenere Private Experience
          </p>

          <h1 className="text-6xl md:text-8xl font-light leading-none mb-8">
            Mediterranean <br />
            Sailing Experience
          </h1>

          <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed max-w-3xl mx-auto">
            A private cinematic journey through Portovenere, Palmaria Island,
            hidden coves and authentic Ligurian lifestyle.
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-6">
              The Experience
            </p>

            <h2 className="text-5xl md:text-7xl font-light leading-tight mb-10">
              Discover the Gulf of Poets from the sea.
            </h2>

            <p className="text-lg leading-9 text-neutral-700 mb-8">
              Step aboard a private sailing yacht and experience the authentic
              soul of Portovenere through a curated full-day journey designed
              for relaxation, elegance and storytelling.
            </p>

            <p className="text-lg leading-9 text-neutral-700">
              Swim in crystal-clear coves, enjoy local wine, explore hidden
              corners reachable only by boat and immerse yourself in the timeless
              Mediterranean atmosphere.
            </p>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1974&auto=format&fit=crop"
              alt="Luxury Sailing"
              className="rounded-3xl w-full h-[700px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* EXPERIENCE DETAILS */}
      <section className="py-32 px-6 bg-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-6">
              Included
            </p>

            <h2 className="text-5xl md:text-7xl font-light">
              What Awaits You
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-3xl">
              <h3 className="text-3xl font-light mb-6">
                Private Yacht
              </h3>

              <p className="text-neutral-700 leading-8">
                Exclusive sailing experience aboard a private yacht with skipper,
                curated for comfort and authentic exploration.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl">
              <h3 className="text-3xl font-light mb-6">
                Swimming & Relax
              </h3>

              <p className="text-neutral-700 leading-8">
                Stop in hidden bays and crystal-clear waters around Palmaria
                Island and the Gulf of Poets.
              </p>
            </div>

            <div className="bg-white p-10 rounded-3xl">
              <h3 className="text-3xl font-light mb-6">
                Ligurian Lifestyle
              </h3>

              <p className="text-neutral-700 leading-8">
                Wine, local cuisine, sea breeze and cinematic Mediterranean
                atmosphere throughout the journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ITINERARY */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-6">
            Itinerary
          </p>

          <h2 className="text-5xl md:text-7xl font-light mb-20">
            A full-day private escape.
          </h2>

          <div className="space-y-16 text-left">
            <div>
              <h3 className="text-3xl font-light mb-4">
                Morning Departure
              </h3>

              <p className="text-lg leading-9 text-neutral-700">
                Departure from Portovenere harbor with welcome drinks and
                introduction to the sailing route.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-light mb-4">
                Palmaria Island & Swimming
              </h3>

              <p className="text-lg leading-9 text-neutral-700">
                Explore hidden coves, swim in turquoise waters and enjoy slow
                navigation around the island.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-light mb-4">
                Waterfront Lunch
              </h3>

              <p className="text-lg leading-9 text-neutral-700">
                Optional stop at a traditional waterfront restaurant reachable
                directly by boat.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-light mb-4">
                Sunset Return
              </h3>

              <p className="text-lg leading-9 text-neutral-700">
                Return navigation through the Gulf of Poets with sunset views
                and relaxed atmosphere onboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LUNCH EXPERIENCE */}
      <section className="py-32 px-6 bg-neutral-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-6">
            Palmaria Island Lunch
          </p>

          <h2 className="text-5xl md:text-7xl font-light leading-tight mb-10">
            A waterfront lunch experience reachable directly by boat.
          </h2>

          <p className="text-lg leading-9 text-neutral-700 mb-8">
            During the sailing experience, guests will stop at one of Palmaria
            Island’s most authentic waterfront restaurants.
          </p>

          <p className="text-lg leading-9 text-neutral-700 mb-8">
            Enjoy fresh local seafood, Ligurian specialties and selected
            regional wines surrounded by the unique atmosphere of the Gulf of
            Poets.
          </p>

          <p className="text-lg leading-9 text-neutral-700">
            Restaurant reservation and coordination are included within the
            experience.
          </p>
        </div>
      </section>

      {/* PRICE */}
      <section className="py-32 px-6 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto">
          <p className="uppercase tracking-[0.3em] text-sm text-neutral-400 mb-6">
            Private Experience
          </p>

          <h2 className="text-7xl md:text-8xl font-light mb-8">
            €1690
          </h2>

          <p className="text-xl text-neutral-300 leading-9 mb-12">
            Private curated experience for 2 guests. <br />
            Additional guests available on request.
          </p>

          <button className="border border-white px-10 py-5 rounded-full text-lg hover:bg-white hover:text-black transition-all duration-300">
            Request Private Booking
          </button>
        </div>
      </section>

    </main>
  );
}