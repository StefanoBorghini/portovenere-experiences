"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-[#0F1117] text-white overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden">
        {/* DESKTOP VIDEO */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/Hero/poster-desktop.png"
          className="hidden lg:block absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source
            src="/videos/Hero/hero-desktop.mp4"
            type="video/mp4"
          />
        </video>

        {/* TABLET VIDEO */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/Hero/poster-mobile.png"
          className="hidden md:block lg:hidden absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="/videos/Hero/hero-mobile.mp4"
            type="video/mp4"
          />
        </video>

        {/* MOBILE VIDEO */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/Hero/poster-mobile.png"
          className="block md:hidden absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="/videos/Hero/hero-mobile.mp4"
            type="video/mp4"
          />
        </video>

        {/* OVERLAY */}
<div className="absolute inset-0 bg-black/45" />
        {/* GRAIN */}
        <div className="absolute inset-0 opacity-20 mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-10" />

        {/* NAVBAR */}
        <nav
          className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
            scrolled
              ? "bg-[#0F1117]/80 backdrop-blur-xl"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
            {/* LOGO */}
            <div className="text-white text-[11px] md:text-xs uppercase tracking-[0.35em] leading-tight">
              Portovenere
              <br />
              Experiences
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-10 text-sm text-zinc-300">
              <a href="#experiences" className="hover:text-white transition">
                Experiences
              </a>

              <a href="#manifesto" className="hover:text-white transition">
                Manifesto
              </a>

              <a href="#contact" className="hover:text-white transition">
                Contact
              </a>

              <a
                href="/craft-your-experience"
                className="bg-white text-black px-5 py-3 rounded-full uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all duration-300"
              >
                Craft Experience
              </a>
            </div>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 z-50"
            >
              <span className="w-6 h-[1px] bg-white"></span>
              <span className="w-6 h-[1px] bg-white"></span>
              <span className="w-6 h-[1px] bg-white"></span>
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <div
          className={`fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-10 transition-all duration-500 ${
            menuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <a
            href="#experiences"
            onClick={() => setMenuOpen(false)}
            className="text-white text-5xl font-light"
          >
            Experiences
          </a>

          <a
            href="#manifesto"
            onClick={() => setMenuOpen(false)}
            className="text-white text-5xl font-light"
          >
            Manifesto
          </a>

          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="text-white text-5xl font-light"
          >
            Contact
          </a>

          <a
            href="/craft-your-experience"
            onClick={() => setMenuOpen(false)}
            className="mt-4 bg-white text-black px-8 py-4 rounded-full uppercase tracking-[0.2em] text-xs"
          >
            Craft Experience
          </a>
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-20 min-h-screen flex items-center justify-center px-6 text-center">
          <div className="max-w-6xl pt-32">
            <p className="uppercase tracking-[0.45em] text-zinc-300 text-[11px] md:text-sm mb-8">
              Curated Luxury Experiences — Italian Riviera
            </p>

            <h1 className="text-[58px] leading-[0.9] md:text-[140px] font-light tracking-tight mb-10">
              Beyond
              <br />
              Cinque Terre
            </h1>

            <p className="max-w-2xl mx-auto text-zinc-200 text-lg md:text-2xl leading-relaxed">
              Private yacht escapes, cinematic sunsets and curated experiences
              on the hidden side of the Italian Riviera.
            </p>

            {/* CTA */}
            <div className="flex flex-col md:flex-row justify-center gap-5 mt-12">
              <a
                href="/craft-your-experience"
                className="bg-white text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500"
              >
                Craft Your Experience
              </a>

              <a
                href="#experiences"
                className="border border-white/30 backdrop-blur-md px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:bg-white hover:text-black transition-all duration-500"
              >
                Explore Experiences
              </a>
            </div>

            {/* TRUST STRIP */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-14 text-[10px] md:text-xs uppercase tracking-[0.3em] text-zinc-300">
              <span>Limited Summer Availability</span>
              <span>Private Access</span>
              <span>Selected Collaborations</span>
              <span>Luxury Storytelling</span>
            </div>
          </div>
        </div>

        {/* SCROLL */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-zinc-300 text-[10px] uppercase tracking-[0.5em]">
          Scroll
        </div>
      </section>

      {/* AUTHORITY */}
      <section className="border-y border-white/10 py-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-10 uppercase tracking-[0.35em] text-[10px] md:text-xs text-zinc-500 px-6 text-center">
          <span>Private Productions</span>
          <span>Mediterranean Lifestyle</span>
          <span>Luxury Experiences</span>
          <span>Italian Riviera</span>
          <span>Selected Guests Only</span>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section
        id="experiences"
        className="py-24 md:py-32 px-6 max-w-7xl mx-auto"
      >
        <div className="text-center mb-24">
          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-5">
            Experiences
          </p>

          <h2 className="text-5xl md:text-8xl font-light leading-[0.95]">
            Curated
            <br />
            Mediterranean
            <br />
            Escapes
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* CARD 1 */}
          <div className="group relative overflow-hidden rounded-[40px] h-[520px] md:h-[700px]">
            <img
              src="/images/sailing/sailing-01.jpg"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
              alt="Private Sailing Experience"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.25em]">
              Limited Access
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
              <p className="uppercase tracking-[0.3em] text-sm text-zinc-300 mb-4">
                Yacht Experience
              </p>

              <h3 className="text-4xl md:text-5xl font-light leading-tight mb-6">
                Private
                <br />
                Sailing Escape
              </h3>

              <p className="text-zinc-200 leading-relaxed mb-8">
                Golden hour navigation, hidden coves and cinematic atmosphere
                across the Gulf of Poets.
              </p>

              <a
                href="/private-sailing-experience"
                className="w-fit border border-white/30 backdrop-blur-md px-6 py-3 rounded-full uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-black transition-all duration-500"
              >
                Discover Experience
              </a>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="group relative overflow-hidden rounded-[40px] h-[520px] md:h-[700px]">
            <img
              src="/images/underwater/underwater-01.jpg"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
              alt="Underwater Storytelling"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.25em]">
              Selected Guests
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
              <p className="uppercase tracking-[0.3em] text-sm text-zinc-300 mb-4">
                Underwater Storytelling
              </p>

              <h3 className="text-4xl md:text-5xl font-light leading-tight mb-6">
                Mermaid
                <br />
                Experience
              </h3>

              <p className="text-zinc-200 leading-relaxed mb-8">
                Immersive cinematic experiences between sea, movement and visual
                storytelling.
              </p>

              <a
                href="/underwater-experience"
                className="w-fit border border-white/30 backdrop-blur-md px-6 py-3 rounded-full uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-black transition-all duration-500"
              >
                Explore
              </a>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="group relative overflow-hidden rounded-[40px] h-[520px] md:h-[700px]">
            <img
              src="/images/dining/dining-01.jpg"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
              alt="Mediterranean Sunset Dinner"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.25em]">
              Private Dinner
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
              <p className="uppercase tracking-[0.3em] text-sm text-zinc-300 mb-4">
                Sunset Dining
              </p>

              <h3 className="text-4xl md:text-5xl font-light leading-tight mb-6">
                Mediterranean
                <br />
                Sunset Dinner
              </h3>

              <p className="text-zinc-200 leading-relaxed mb-8">
                Private seaside tables, authentic Ligurian cuisine and timeless
                Riviera atmosphere.
              </p>

              <a
                href="/sunset-dinner"
                className="w-fit border border-white/30 backdrop-blur-md px-6 py-3 rounded-full uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-black transition-all duration-500"
              >
                View Experience
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section
        id="manifesto"
        className="py-40 px-6 border-t border-white/10"
      >
        <div className="max-w-5xl mx-auto text-center">
          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-8">
            The Experience
          </p>

          <h2 className="text-5xl md:text-7xl font-light leading-[1.05] mb-12">
            The Italian Riviera
            <br />
            you imagined
            <br />
            still exists.
          </h2>

          <p className="max-w-3xl mx-auto text-zinc-400 text-xl leading-relaxed">
            We curate private Mediterranean experiences designed around
            atmosphere, storytelling, intimacy and authentic human connection.
          </p>
        </div>
      </section>

      {/* SCARCITY */}
      <section className="py-28 px-6 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-6">
            Limited Availability
          </p>

          <h2 className="text-5xl md:text-7xl font-light leading-tight mb-10">
            Small private groups.
            <br />
            Selected experiences only.
          </h2>

          <p className="text-zinc-600 text-lg leading-relaxed">
            Every production is intentionally limited to preserve exclusivity,
            atmosphere and emotional impact.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        id="contact"
        className="py-40 px-6 text-center bg-[#0F1117] border-t border-white/10"
      >
        <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-6">
          Private Access
        </p>

        <h2 className="text-5xl md:text-8xl font-light leading-[0.95] mb-10">
          Plan Your
          <br />
          Mediterranean
          <br />
          Escape
        </h2>

        <p className="max-w-2xl mx-auto text-zinc-400 text-lg leading-relaxed mb-12">
          Access curated Mediterranean experiences designed for selected guests,
          private collaborations and cinematic storytelling productions.
        </p>

        <a
          href="/craft-your-experience"
          className="inline-block bg-white text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500"
        >
          Craft Your Experience
        </a>
      </section>

     
    </main>
  );
}