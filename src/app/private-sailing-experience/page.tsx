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
              src="https://instagram.fmxp4-1.fna.fbcdn.net/v/t51.82787-15/681709376_18100545614475803_3585021078207847429_n.webp?_nc_cat=109&ig_cache_key=Mzg4MjM2NzI3NzgyODE1NjEwNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuNDAwMC5zZHIucmVndWxhcl9waG90by5DMiJ9&_nc_ohc=PP7nK0_j6F4Q7kNvwGOiSRD&_nc_oc=AdqUEm0E40bFSNv3p90cuxYj2wbVBzCJXkeZtfzRkHMjMeWi2L6b0wW5Po0YjLtGBEw&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fmxp4-1.fna&_nc_gid=YewZbXMysbvIWnbQeDYuXg&_nc_ss=7a22e&oh=00_Af5XtRyJipwZOEJOOZwHJYaMokzP00q_Xgi-3KqwMQl1Jg&oe=6A08E177"
              alt="Sea"
              className="rounded-3xl h-[500px] object-cover w-full"
            />

            <img
              src="https://instagram.fmxp4-1.fna.fbcdn.net/v/t51.82787-15/681890741_18100545587475803_125703852981375846_n.webp?_nc_cat=103&ig_cache_key=Mzg4MjM2NzI3NzYxMDA5MTI5OQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTQ0MC5zZHIucmVndWxhcl9waG90by5DMiJ9&_nc_ohc=81hoSxA4chsQ7kNvwGQjFeT&_nc_oc=Ado2tkmzQCxA8dU4FltJ7bqD-TQsfRFxTVwcxCjo3OmxEJZielMKqzADHRKE2E8-DxY&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fmxp4-1.fna&_nc_gid=YewZbXMysbvIWnbQeDYuXg&_nc_ss=7a22e&oh=00_Af5zyUBhtsiqobIWtWSXEvEsbe7bnENfs54p5JQ05KU_pg&oe=6A08B69D"
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
                src="https://scontent.fmxp4-1.fna.fbcdn.net/v/t39.30808-6/482236526_1155772789678440_6045626428659650179_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=BcICXQyJHRIQ7kNvwEznhwP&_nc_oc=Adolh9vhZkAFPw-MAsvQrpHf5wjB3ne6I4ZHJkla6aKseA1TePjqzV7Z5dHEwX86Gbs&_nc_zt=23&_nc_ht=scontent.fmxp4-1.fna&_nc_gid=5Z7W2VRG3klg5-pGKkjjNQ&_nc_ss=7b2a8&oh=00_Af6Ls8lkuAwoE-kdcYrjAEcwOIHleg9j40KCeSA5iE_KSQ&oe=6A08BF50"
                alt="Sea"
                className="rounded-3xl w-full h-[750px] object-cover"
              />

            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <img
              src=""
              alt="Cove"
              className="rounded-3xl h-[350px] object-cover w-full"
            />

            <img
              src=""
              alt="Sailing"
              className="rounded-3xl h-[350px] object-cover w-full"
            />

            <img
              src=""
              alt="Village"
              className="rounded-3xl h-[350px] object-cover w-full"
            />

          </div>

        </div>

      </section>

      {/* ON BOARD */}
      <section className="py-32 px-6 bg-[#1C2A36] text-white">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-24">

            <p className="uppercase tracking-[0.3em] text-sm text-neutral-400 mb-6">
              On Board Experience
            </p>

            <h2 className="text-5xl md:text-7xl font-light leading-tight">
              Ligurian food, wine and atmosphere.
            </h2>

          </div>

          <div className="grid md:grid-cols-2 gap-20 items-center mb-20">

            <div className="space-y-8 text-lg leading-9 text-neutral-300">

              <p>
                Selection of local Ligurian wines and seasonal specialties.
              </p>

              <p>
                Traditional products inspired by the authentic culture
                of the Gulf of Poets.
              </p>

              <p>
                Authentic food & wine experience inspired by Ligurian traditions.
              </p>

              <p>
                A curated onboard atmosphere designed for slow travel,
                relaxation and meaningful moments at sea.
              </p>

            </div>

            <img
              src="https://instagram.fmxp4-1.fna.fbcdn.net/v/t51.82787-15/681090431_18100545626475803_5255756396525646058_n.webp?_nc_cat=105&ig_cache_key=Mzg4MjM2NzI3NzgyODE1NjcwMQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTQ0MC5zZHIucmVndWxhcl9waG90by5DMiJ9&_nc_ohc=wiBbN7gRcyYQ7kNvwEOZIQk&_nc_oc=AdqK47TfRiCegjRyIZA83UuvY0C_vUV8vnJltcPhdf4g8TioBvVRtBYx6tsE1SWyFCA&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fmxp4-1.fna&_nc_gid=YewZbXMysbvIWnbQeDYuXg&_nc_ss=7a22e&oh=00_Af4EOG5QQr-v6Hfi43NvSblq5mX7Ryba8E1jzD-hiryu6A&oe=6A08DA85"
              alt="Wine"
              className="rounded-3xl h-[700px] object-cover w-full"
            />

          </div>
          <div className="grid md:grid-cols-3 gap-8">

            <img
              src="https://instagram.fmxp4-1.fna.fbcdn.net/v/t51.82787-15/680906430_18100545635475803_8390082691320931653_n.webp?_nc_cat=111&ig_cache_key=Mzg4MjM2NzI3NzcwMjM1MTM1Mw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuNDAwMC5zZHIucmVndWxhcl9waG90by5DMiJ9&_nc_ohc=eoX_mqniNtwQ7kNvwGJw7NX&_nc_oc=AdrMy8lg7BB51EQG7ksjc8nzAyKDnaqXqvT0psgpEXvkTxcRCznu9cfx9hbM-9YW7HA&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fmxp4-1.fna&_nc_gid=YewZbXMysbvIWnbQeDYuXg&_nc_ss=7a22e&oh=00_Af4hgJ7k6DrwW_a48ChVBUhH1nW9XQS-85v4A5DXI40QdQ&oe=6A08B957"
              alt="Food"
              className="rounded-3xl h-[320px] object-cover w-full"
            />

            <img
              src="https://instagram.fmxp4-1.fna.fbcdn.net/v/t51.82787-15/651456225_18116064373630866_6344630966903746566_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=105&ig_cache_key=Mjg1NjEwMjcwMjk0NjgzOTAxOA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTQ0MC5zZHIucmVndWxhcl9waG90by5DMiJ9&_nc_ohc=iEs5RnLm9CYQ7kNvwExAANn&_nc_oc=Adrxvqc_AkvCm8c706n2megr2loCov0UorcBEvOSpWHyHjUZUSVdf5wk4tPMKh2DOTk&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fmxp4-1.fna&_nc_gid=tj9ndINPcSl_vX7C8Id5hw&_nc_ss=7a22e&oh=00_Af65ZAq1FunUBQBQfqB-ETJXrhTLuha5SfUL0jr79ukldg&oe=6A08E8C6"
              alt="Wine"
              className="rounded-3xl h-[320px] object-cover w-full"
            />

            <img
              src="https://swite-s2026-19.r1-it.storage.cloud.it/198491/69dd45a5dc67d1ab9cd9d308/img.jpg?1778580686"
              alt="Seafood"
              className="rounded-3xl h-[320px] object-cover w-full"
            />

          </div>

        </div>

      </section>

      {/* LUNCH */}
      <section className="py-32 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-20">

            <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-6">
              Palmaria Island Lunch Experience
            </p>

            <h2 className="text-5xl md:text-7xl font-light leading-tight mb-10">
              Waterfront dining reachable directly by boat.
            </h2>

          </div>

          <div className="max-w-4xl mx-auto text-center space-y-8 text-lg leading-9 text-neutral-700 mb-24">

            <p>
              During the sailing experience, guests will stop at one of Palmaria
              Island’s most authentic waterfront restaurants.
            </p>

            <p>
              Enjoy fresh local seafood, Ligurian specialties and selected regional wines
              surrounded by the unique atmosphere of the Gulf of Poets.
            </p>

            <p>
              Restaurant reservation and coordination are included within the experience.
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">

            <img
              src="https://swite-uplimages.r1-it.storage.cloud.it/98794/5954435/src.png?z=1776149117"
              alt="Restaurant"
              className="rounded-3xl h-[500px] object-cover w-full"
            />

            <img
              src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/87/46/68/il-nostro-giardino.jpg?w=900&h=500&s=1"
              alt="Lunch"
              className="rounded-3xl h-[500px] object-cover w-full"
            />

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <img
              src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1974&auto=format&fit=crop"
              alt="Food"
              className="rounded-3xl h-[320px] object-cover w-full"
            />

            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1974&auto=format&fit=crop"
              alt="Seafood"
              className="rounded-3xl h-[320px] object-cover w-full"
            />

            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1974&auto=format&fit=crop"
              alt="Dinner"
              className="rounded-3xl h-[320px] object-cover w-full"
            />

          </div>

        </div>

      </section>

      {/* PRICE */}
      <section className="py-32 px-6 bg-neutral-100 text-center">

        <div className="max-w-4xl mx-auto">

          <p className="uppercase tracking-[0.3em] text-sm text-neutral-500 mb-6">
            Private Experience
          </p>

          <h2 className="text-7xl md:text-8xl font-light mb-8">
            €1690
          </h2>

          <p className="text-xl text-neutral-700 leading-9 mb-12">
            Private curated experience for 2 guests <br />
            All included.
          </p>

          <button className="bg-[#1C2A36] text-white px-10 py-5 rounded-full text-lg hover:bg-[#243444] transition-all duration-300">
            Request Private Booking
          </button>

        </div>

      </section>

      {/* NOTE */}
      <section className="py-24 px-6">

        <div className="max-w-5xl mx-auto">

          <h2 className="text-4xl font-light mb-10">
            Important Note
          </h2>

          <div className="space-y-8 text-lg leading-9 text-neutral-700">

            <p>
              This experience is operated by a fully authorized professional
              boat with experienced local crew.
            </p>

            <p>
              The itinerary is designed to offer an authentic and exclusive
              perspective of the Gulf of Poets, including hidden coves,
              scenic coastal areas and unique locations reachable only by sea.
            </p>

            <p>
              Weather and sea conditions may slightly affect the itinerary
              to ensure the best possible experience and maximum safety onboard.
            </p>

            <p>
              Designed for couples and travelers seeking an authentic
              and refined experience in Liguria.
            </p>

          </div>

        </div>

      </section>

      {/* CONTACT */}
      <section className="py-32 px-6 bg-[#1C2A36] text-white text-center">

        <div className="max-w-4xl mx-auto">

          <p className="uppercase tracking-[0.3em] text-sm text-neutral-400 mb-6">
            Portovenere.com
          </p>

          <h2 className="text-5xl md:text-7xl font-light mb-10">
            Stefano
          </h2>

          <p className="text-xl text-neutral-300 leading-9 mb-12">
            I’ll personally assist you throughout the experience.
          </p>

          <div className="space-y-4 text-lg text-neutral-300">

            <p>WhatsApp: +39 348 714 0722</p>

            <p>info@portovenere.com</p>

          </div>

        </div>

      </section>

    </main>
  );
}