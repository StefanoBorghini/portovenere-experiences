"use client";

import { useState } from "react";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="bg-white text-black overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* VIDEO BACKGROUND */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/Hero/Istantanea.png"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="/videos/Hero/verna.mp4"
            type="video/mp4"
          />
        </video>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/55" />

        {/* NAVBAR */}
        <nav className="absolute top-0 left-0 w-full z-50 px-6 md:px-10 py-6 flex items-center justify-between">
          {/* LOGO */}
          <div className="text-white text-[11px] md:text-xs tracking-[0.25em] uppercase leading-tight">
            Portovenere
            <br />
            Experiences
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex gap-10 text-sm text-zinc-200">
            <a
              href="#experiences"
              className="hover:text-white transition"
            >
              Experiences
            </a>

            <a
              href="#manifesto"
              className="hover:text-white transition"
            >
              Manifesto
            </a>

            <a
              href="#contact"
              className="hover:text-white transition"
            >
              Contact
            </a>
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 z-50"
          >
            <span className="w-6 h-[1px] bg-white"></span>
            <span className="w-6 h-[1px] bg-white"></span>
            <span className="w-6 h-[1px] bg-white"></span>
          </button>
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
            className="text-white text-4xl font-light"
          >
            Experiences
          </a>

          <a
            href="#manifesto"
            onClick={() => setMenuOpen(false)}
            className="text-white text-4xl font-light"
          >
            Manifesto
          </a>

          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="text-white text-4xl font-light"
          >
            Contact
          </a>
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-20 text-center px-6 max-w-5xl pt-24">
          <p className="uppercase tracking-[0.3em] text-zinc-300 text-[11px] md:text-sm mb-6">
            Mediterranean Lifestyle Experiences
          </p>

          <h1 className="text-[56px] leading-[0.9] md:text-8xl font-light text-white mb-8">
            Private
            <br />
            Mediterranean
            <br />
            Experiences
          </h1>

          <p className="max-w-xl mx-auto text-zinc-200 text-lg md:text-xl leading-relaxed">
            A curated collection of cinematic experiences between sailing,
            atmosphere, storytelling and authentic Mediterranean lifestyle.
          </p>

          {/* CTA */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
            <a
              href="/configurator"
              className="bg-white text-black px-8 py-4 rounded-full text-sm uppercase tracking-wide hover:scale-105 transition-all duration-500"
            >
              Craft Your Experience
            </a>

            <a
              href="#experiences"
              className="border border-white text-white px-8 py-4 rounded-full text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-all duration-500"
            >
              Explore Experiences
            </a>
          </div>
        </div>

        {/* SCROLL */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-300 text-[10px] tracking-[0.4em] uppercase">
          Scroll
        </div>
      </section>

      {/* AUTHORITY STRIP */}
      <section className="border-y border-zinc-200 py-6 overflow-hidden bg-white">
        <div className="flex gap-20 whitespace-nowrap text-zinc-500 uppercase tracking-[0.3em] text-sm justify-center">
          <span>Private Productions</span>
          <span>Mediterranean Storytelling</span>
          <span>Luxury Experiences</span>
          <span>Selected Collaborations</span>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section
        id="experiences"
        className="py-24 md:py-32 px-6 max-w-7xl mx-auto"
      >
        <div className="mb-16 md:mb-20 text-center">
          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-4">
            Experiences
          </p>

          <h2 className="text-4xl md:text-7xl font-light leading-tight">
            Curated
            <br />
            Mediterranean Moments
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* CARD 1 */}
          <div className="group relative overflow-hidden rounded-[40px] h-[520px] md:h-[650px]">
            <img
              src="/images/sailing/sailing-01.jpg"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              alt="Private Sailing Experience"
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10 text-white">
              <p className="uppercase tracking-[0.3em] text-xs text-zinc-300 mb-4">
                Sailing Experience
              </p>

              <h3 className="text-3xl md:text-4xl font-light mb-6 leading-tight">
                Private Sailing
                <br />
                Experience
              </h3>

              <p className="text-zinc-200 leading-relaxed mb-8">
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
          <div className="group relative overflow-hidden rounded-[40px] h-[520px] md:h-[650px]">
            <img
              src="/images/underwater/underwater-01.jpg"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              alt="Underwater Storytelling"
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10 text-white">
              <p className="uppercase tracking-[0.3em] text-xs text-zinc-300 mb-4">
                Underwater Storytelling
              </p>

              <h3 className="text-3xl md:text-4xl font-light mb-6 leading-tight">
                Mermaid
                <br />
                Visual Experience
              </h3>

              <p className="text-zinc-200 leading-relaxed mb-8">
                Immersive visual experiences between sea, silence, movement and
                cinematic underwater storytelling.
              </p>

              <a
                href="/underwater-experience"
                className="w-fit border border-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-500"
              >
                Explore
              </a>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="group relative overflow-hidden rounded-[40px] h-[520px] md:h-[650px]">
            <img
              src="/images/dining/dining-01.jpg"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
              alt="Mediterranean Sunset Dinner"
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10 text-white">
              <p className="uppercase tracking-[0.3em] text-xs text-zinc-300 mb-4">
                Sunset Dinner
              </p>

              <h3 className="text-3xl md:text-4xl font-light mb-6 leading-tight">
                Mediterranean
                <br />
                Sunset Dinner
              </h3>

              <p className="text-zinc-200 leading-relaxed mb-8">
                Private tables, authentic Ligurian cuisine and unforgettable
                atmosphere by the sea.
              </p>

              <a
                href="/sunset-dinner"
                className="w-fit border border-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-500"
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
        className="py-28 md:py-40 px-6 bg-black text-white"
      >
        <div className="max-w-5xl mx-auto text-center">
          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-10">
            Manifesto
          </p>

          <h2 className="text-4xl md:text-7xl font-light leading-[1.1] mb-16">
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

          <p className="max-w-3xl mx-auto text-zinc-400 text-lg md:text-xl leading-relaxed">
            Every experience is curated to feel cinematic, intimate and
            emotionally memorable.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        id="contact"
        className="py-28 md:py-40 px-6 text-center border-t border-zinc-200 bg-white"
      >
        <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-6">
          Private Access
        </p>

        <h2 className="text-4xl md:text-7xl font-light mb-10">
          Start Your
          <br />
          Mediterranean Journey
        </h2>

        <p className="max-w-2xl mx-auto text-zinc-600 text-lg leading-relaxed mb-12">
          Access curated Mediterranean experiences designed for selected guests,
          private collaborations and cinematic storytelling productions.
        </p>

        <a
          href="/configurator"
          className="inline-block bg-black text-white px-10 py-5 rounded-full hover:scale-105 transition-all duration-500"
        >
          Craft Your Experience
        </a>
      </section>
    </main>
  );
}