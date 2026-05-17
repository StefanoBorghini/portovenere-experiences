import { cookies } from "next/headers";

export default async function ProposalPage() {

  const cookieStore =
    await cookies();

  const clientName =
    cookieStore.get(
      "clientName"
    )?.value ||
    "Private Guest";

  // STATIC CONTENT

  const heroTitle =
    "Mediterranean Bachelorette Party";

  const heroImage =
    "https://www.portovenere.com/wp-content/uploads/2026/02/352.webp";

  const price =
    "€ 1800";

  const featuredExperience = {
    title:
      "Private Boat Experience",

    description:
      "A curated private sailing journey through in Portovenere, hidden coves and Mediterranean landscapes.",
  };

  const galleryImages = [

     "/images/sailing/img-3.webp",

    "/images/sailing/img-4.jpg",

    "/images/sailing/img-5.png",

    "https://i0.wp.com/www.portovenere.com/wp-content/uploads/2026/04/Copia-di-Copia-di-meeting-underwater-3-scaled.webp?fit=2560%2C1709&ssl=1",
  ];

  const whatsappUrl =
    "https://wa.me/393487140722";

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
            Tailored for {clientName} and her friends
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

      <section className="py-24 px-6 border-y border-white/10 bg-black">

        <div className="max-w-4xl mx-auto text-center">

          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-6">
            Mediterranean Luxury
          </p>

          <h2 className="text-4xl md:text-6xl font-light leading-tight">
            Crafted around your personal travel style and Riviera atmosphere.
          </h2>

        </div>

      </section>

      {/* EXPERIENCE DETAILS */}

      <section className="py-20 md:py-32 px-6">

        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-20">

            <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
             Private Sailing Experience
            </p>

            <h2 className="text-3xl md:text-7xl font-light leading-tight">
              Discover the Gulf of Poets from a unique perspective at sea.
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* EXPERIENCE */}

            <div className="border border-white/10 rounded-3xl p-6 md:p-10 bg-white/5">

              <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
                 CURATED PRIVATE SAILING
              </p>

             
              <p className="text-zinc-400 leading-8">
           Sail through one of the most breathtaking stretches of the Ligurian coastline,
            exploring Palmaria, Tino and Tinetto islands, <br></br>
           the colorful village of Portovenere and the elegant seaside gems of Lerici and Tellaro.

              </p>

            </div>

            {/* PROFILE */}

            <div className="border border-white/10 rounded-3xl p-6 md:p-10 bg-white/5">

              <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
                Guest Profile
              </p>

              <div className="space-y-5 text-lg">

                <p>
                  Guests:
                  {" "}
                  {clientName} and her friends
                </p>

                <p>
                  Experiences:
                  Sea Escape, Gourmet Escape
                </p>

                <p>
                  Atmosphere:
                  Romantic, Authentic
                </p>

                <p>
                  Guests:
                  8-10
                </p>

                

                <p>
                  Experience:
                  Private Bachelorette Party
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* INCLUDED */}

      <section className="pb-32 px-6">

        <div className="max-w-5xl mx-auto">

          <h2 className="text-5xl font-light mb-16 text-center">
            Included in your experience
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="border border-white/10 rounded-2xl p-8 bg-white/5">
             <p className="text-zinc-300 leading-8 whitespace-pre-LINE">Duration : 7 hours private sailing experience. <br></br>
             Departure : Porto delle Grazie – Portovenere.<br></br>
             Yacht : Private 40ft sailing yacht with local crew.
             <br></br>
             <br></br>
             Slow navigation along dramatic cliffs and picturesque Mediterranean villages.
             </p> </div>


                <div className="border border-white/10 rounded-2xl p-8 bg-white/5">
               <p className="text-zinc-300 leading-8 whitespace-pre-LINE">
   Hidden coves, islands and timeless villages.<br></br>
Navigation through Portovenere, Palmaria, Tino, Tinetto, Lerici and Tellaro.
<br></br>
Swim in crystal-clear bays and hidden coves accessible only by sea.


<br></br>
Possibility to stop in Portovenere, Lerici or Tellaro, depending on sea
  </p>

            </div>

            <div className="border border-white/10 rounded-2xl p-8 bg-white/5">
                            <p className="text-zinc-300 leading-8 whitespace-pre-LINE">
  Curated Mediterranean food and wine tasting experience featuring local Ligurian specialties.<br></br>
  Curated tasting of artisanal Cinque Terre wines produced by small local winemakers </p>


            </div>

        

            <div className="border border-white/10 rounded-2xl p-8 bg-white/5">
            <p className="text-zinc-300 leading-8 whitespace-pre-LINE">

    A private mermaiding experience in the crystal-clear waters of the Ligurian coast.

    Designed as a playful and cinematic Mediterranean activity, combining sea exploration, relaxation and unforgettable moments in nature.
  </p>
            </div>

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

          <div className="grid md:grid-cols-4 gap-6">

            {galleryImages.map(
              (
                image,
                index
              ) => (

                <img
                  key={index}
                  src={image}
                  alt="Experience"
                  className="rounded-3xl h-[500px] w-full object-cover"
                />

              )
            )}

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="pb-32 px-6">

        <div className="max-w-4xl mx-auto text-center">

          <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-6">
            Private Reservation
          </p>

          <h2 className="text-3xl md:text-6xl font-light mb-10">
            Ready to reserve your experience?
          </h2>

          <div className="text-zinc-400 leading-8 md:leading-9 mb-14 space-y-4">

            <p className="text-xl">
              Your proposal has been privately curated around your selected atmosphere and preferences.
            </p>

            <div className="pt-6 text-sm uppercase tracking-[0.25em] text-zinc-500">

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
            className="inline-block bg-white text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500"
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