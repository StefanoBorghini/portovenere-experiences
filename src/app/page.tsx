export default function HomePage() {
  return (
    <main className="bg-black text-white overflow-hidden">
      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-sailing-on-the-sea-1569184094317?download=1080p"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-black/50" />

        {/* NAVBAR */}
        <nav className="absolute top-0 left-0 w-full z-20 px-8 py-6 flex items-center justify-between">
          <div className="text-sm tracking-[0.4em] uppercase">
            Portovenere Experiences
          </div>

          <div className="hidden md:flex gap-10 text-sm text-zinc-300">
            <a href="#experiences" className="hover:text-white transition">
              Experiences
            </a>

            <a href="#manifesto" className="hover:text-white transition">
              Manifesto
            </a>

            <a href="#contact" className="hover:text-white transition">
              Contact
            </a>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div className="relative z-10 text-center px-6 max-w-6xl">
          <p className="uppercase tracking-[0.5em] text-zinc-300 text-sm mb-8">
            Mediterranean Lifestyle Experiences
          </p>

          <h1 className="text-6xl md:text-8xl font-light leading-[0.95] mb-10">
            Private
            <br />
            Mediterranean
            <br />
            Experiences
          </h1>

          <p className="max-w-2xl mx-auto text-zinc-300 text-lg md:text-xl leading-relaxed">
            A curated collection of cinematic experiences between sailing,
            atmosphere, storytelling and authentic Mediterranean lifestyle.
          </p>

          <div className="flex flex-col md:flex-row gap-5 justify-center mt-12">
            <a
              href="#experiences"
              className="bg-white text-black px-8 py-4 rounded-full hover:scale-105 transition-all duration-500"
            >
              Explore Experiences
            </a>

            <a
              href="#contact"
              className="border border-white px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-500"
            >
              Request Private Access
            </a>
          </div>
        </div>

        {/* SCROLL */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-400 text-sm tracking-[0.3em] uppercase">
          Scroll
        </div>
      </section>

      {/* AUTHORITY STRIP */}
      <section className="border-y border-zinc-900 py-6 overflow-hidden">
        <div className="flex gap-20 whitespace-nowrap animate-pulse text-zinc-500 uppercase tracking-[0.3em] text-sm justify-center">
          <span>Private Productions</span>
          <span>Mediterranean Storytelling</span>
          <span>Luxury Experiences</span>
          <span>Selected Collaborations</span>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section
        id="experiences"
        className="py-32 px-6 max-w-7xl mx-auto"
      >
        <div className="mb-20 text-center">
          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-4">
            Experiences
          </p>

          <h2 className="text-5xl md:text-7xl font-light">
            Curated
            <br />
            Mediterranean Moments
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* CARD 1 */}
          <div className="group relative overflow-hidden rounded-[40px] h-[650px]">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              alt=""
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex flex-col justify-end p-10">
              <p className="uppercase tracking-[0.3em] text-sm text-zinc-300 mb-4">
                Sailing Experience
              </p>

              <h3 className="text-4xl font-light mb-6 leading-tight">
                Private Sailing
                <br />
                Experience
              </h3>

              <p className="text-zinc-300 leading-relaxed mb-8">
                Golden hour navigation, slow Mediterranean atmosphere and
                cinematic storytelling across the Gulf of Poets.
              </p>

              <a
                href="/private-sailing-experience"
                className="w-fit border border-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-500"
              >
                Discover
              </a>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="group relative overflow-hidden rounded-[40px] h-[650px]">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              alt=""
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex flex-col justify-end p-10">
              <p className="uppercase tracking-[0.3em] text-sm text-zinc-300 mb-4">
                Underwater Storytelling
              </p>

              <h3 className="text-4xl font-light mb-6 leading-tight">
                Mermaid
                <br />
                Visual Experience
              </h3>

              <p className="text-zinc-300 leading-relaxed mb-8">
                Immersive visual experiences between sea, silence, movement and
                cinematic underwater storytelling.
              </p>

              <button className="w-fit border border-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-500">
                Explore
              </button>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="group relative overflow-hidden rounded-[40px] h-[650px]">
            <img
              src="https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1600&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              alt=""
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex flex-col justify-end p-10">
              <p className="uppercase tracking-[0.3em] text-sm text-zinc-300 mb-4">
                Sunset Dinner
              </p>

              <h3 className="text-4xl font-light mb-6 leading-tight">
                Mediterranean
                <br />
                Sunset Dinner
              </h3>

              <p className="text-zinc-300 leading-relaxed mb-8">
                Private tables, authentic Ligurian cuisine and unforgettable
                atmosphere by the sea.
              </p>

              <button className="w-fit border border-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-500">
                View Experience
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section
        id="manifesto"
        className="py-40 px-6 border-t border-zinc-900"
      >
        <div className="max-w-5xl mx-auto text-center">
          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-10">
            Manifesto
          </p>

          <h2 className="text-5xl md:text-7xl font-light leading-[1.1] mb-16">
            We create immersive
            <br />
            Mediterranean experiences
            <br />
            through atmosphere,
            <br />
            storytelling,
            <br />
            sea and human connection.
          </h2>

          <p className="max-w-3xl mx-auto text-zinc-400 text-xl leading-relaxed">
            Every experience is curated to feel cinematic, intimate and
            emotionally memorable.
          </p>
        </div>
      </section>

      {/* SCARCITY */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-6">
            Limited Availability
          </p>

          <h2 className="text-4xl md:text-6xl font-light mb-10">
            Selected collaborations.
            <br />
            Private access only.
          </h2>

          <p className="text-zinc-400 text-lg leading-relaxed">
            Each experience is produced in limited sessions to preserve intimacy,
            atmosphere and authenticity.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        id="contact"
        className="py-40 px-6 text-center border-t border-zinc-900"
      >
        <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-6">
          Private Access
        </p>

        <h2 className="text-5xl md:text-7xl font-light mb-10">
          Request
          <br />
          Invitation
        </h2>

        <p className="max-w-2xl mx-auto text-zinc-400 text-lg leading-relaxed mb-12">
          Access curated Mediterranean experiences designed for selected guests,
          private collaborations and cinematic storytelling productions.
        </p>

        <a
          href="mailto:info@portovenere.com"
          className="inline-block bg-white text-black px-10 py-5 rounded-full hover:scale-105 transition-all duration-500"
        >
          Contact Us
        </a>
      </section>
    </main>
  );
}