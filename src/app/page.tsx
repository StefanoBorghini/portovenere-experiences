export default function PortovenereExperience() {
  return (
    <div className="bg-black text-white min-h-screen font-sans overflow-hidden">
      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-sailing-on-the-sea-1569184094317?download=1080p"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <p className="uppercase tracking-[0.4em] text-sm text-zinc-300 mb-6">
            Portovenere Experience
          </p>

          <h1 className="text-5xl md:text-7xl font-light leading-tight mb-6">
            Mediterranean
            <br />
            Lifestyle Experience
          </h1>

          <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A cinematic journey between sea, sailing, sunset, underwater
            storytelling and the authentic atmosphere of Portovenere.
          </p>

          <button className="mt-10 border border-white px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-500">
            Explore The Experience
          </button>
        </div>
      </section>

      {/* STORY */}
      <section className="py-32 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="uppercase tracking-[0.3em] text-zinc-400 text-sm mb-4">
            The Vision
          </p>

          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-tight">
            More than an event.
            <br />
            A visual atmosphere.
          </h2>

          <p className="text-zinc-300 leading-relaxed text-lg mb-6">
            This project was born from the desire to tell Portovenere in a
            different way: authentic, elegant and cinematic.
          </p>

          <p className="text-zinc-400 leading-relaxed">
            Sailing, sunset, selected guests, drone footage, underwater scenes,
            lifestyle storytelling and Mediterranean aesthetics blend together
            into an immersive visual experience.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop"
            alt="Mediterranean Sea"
            className="w-full h-[500px] object-cover"
          />
        </div>
      </section>

      {/* EXPERIENCE FLOW */}
      <section className="py-32 bg-zinc-950 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 text-center">
            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-4">
              Experience Flow
            </p>

            <h2 className="text-4xl md:text-6xl font-light">
              A cinematic journey
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                title: 'Departure',
                text: 'Guests meet at Le Grazie before boarding the sailing boat.',
              },
              {
                title: 'Navigation',
                text: 'Slow sailing through the Gulf with drone and lifestyle content.',
              },
              {
                title: 'Portovenere',
                text: 'Golden hour atmosphere, aperitivo and cinematic storytelling.',
              },
              {
                title: 'Underwater',
                text: 'Mermaid-inspired underwater visuals and editorial shooting.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="border border-zinc-800 rounded-3xl p-8 hover:border-zinc-600 transition-all duration-500"
              >
                <div className="text-zinc-500 text-sm mb-4">
                  0{index + 1}
                </div>

                <h3 className="text-2xl font-light mb-4">{item.title}</h3>

                <p className="text-zinc-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-32 px-6 max-w-5xl mx-auto text-center">
        <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-4">
          Collaborations
        </p>

        <h2 className="text-4xl md:text-6xl font-light mb-10">
          Looking for selected partners
        </h2>

        <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl mx-auto">
          We are currently collaborating with creatives, hospitality brands,
          sailing experiences, lifestyle realities and selected sponsors aligned
          with the Mediterranean premium identity of the project.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {[
            'Sailing',
            'Lifestyle',
            'Hospitality',
            'Wine',
            'Luxury Real Estate',
            'Creative Production',
          ].map((tag) => (
            <span
              key={tag}
              className="border border-zinc-700 px-5 py-3 rounded-full text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center border-t border-zinc-900">
        <h2 className="text-4xl md:text-6xl font-light mb-8">
          Let’s build something beautiful.
        </h2>

        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
          For collaborations, partnerships and storytelling experiences based in
          Portovenere and the Gulf of Poets.
        </p>

        <button className="bg-white text-black px-10 py-5 rounded-full hover:scale-105 transition-all duration-500">
          Contact Us
        </button>
      </section>
    </div>
  )
}