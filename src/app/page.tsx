"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  trackScrollDepth,
  trackHeroViewed,
  trackHeroVisible5s,
  trackCtaViewed,
  trackCtaClicked,
} from "@/lib/analytics/gtag";

export default function HomePage() {

  const t = useTranslations("landing");

  // =======================================================
  // SCROLL DEPTH — soglie 25/50/75/100%, ognuna sparata una
  // sola volta per sessione di navigazione sulla pagina.
  // =======================================================

  const firedThresholdsRef = useRef<Set<25 | 50 | 75 | 100>>(new Set());

  useEffect(() => {

    function handleScroll() {

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) return;

      const percentScrolled =
        (window.scrollY / scrollableHeight) * 100;

      ([25, 50, 75, 100] as const).forEach((threshold) => {

        if (
          percentScrolled >= threshold &&
          !firedThresholdsRef.current.has(threshold)
        ) {
          firedThresholdsRef.current.add(threshold);
          trackScrollDepth("landing", threshold);
        }

      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };

  }, []);

  // =======================================================
  // HERO — vista (IntersectionObserver) + vista per 5s+
  // continuativi (timer che si azzera se l'hero esce dal
  // viewport prima dei 5 secondi).
  // =======================================================

  const heroRef = useRef<HTMLElement | null>(null);
  const heroViewedFiredRef = useRef(false);
  const hero5sFiredRef = useRef(false);
  const hero5sTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {

    const node = heroRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting) {

          if (!heroViewedFiredRef.current) {
            heroViewedFiredRef.current = true;
            trackHeroViewed();
          }

          if (!hero5sFiredRef.current && !hero5sTimeoutRef.current) {
            hero5sTimeoutRef.current = setTimeout(() => {
              hero5sFiredRef.current = true;
              trackHeroVisible5s();
            }, 5000);
          }

        } else {

          // Esce dal viewport prima dei 5s continuativi — annulliamo
          // il timer, non vogliamo contare visite spezzettate.
          if (hero5sTimeoutRef.current) {
            clearTimeout(hero5sTimeoutRef.current);
            hero5sTimeoutRef.current = null;
          }

        }

      },
      { threshold: 0.5 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (hero5sTimeoutRef.current) {
        clearTimeout(hero5sTimeoutRef.current);
      }
    };

  }, []);

  // =======================================================
  // CTA FINALE — vista (la piu' significativa: chi arriva
  // fin qui ha letto tutta la pagina). Le altre CTA vengono
  // tracciate solo al click, per non generare rumore su
  // pulsanti quasi sempre visibili al caricamento.
  // =======================================================

  const finalCtaRef = useRef<HTMLElement | null>(null);
  const finalCtaViewedFiredRef = useRef(false);

  useEffect(() => {

    const node = finalCtaRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting && !finalCtaViewedFiredRef.current) {
          finalCtaViewedFiredRef.current = true;
          trackCtaViewed("final_cta");
        }

      },
      { threshold: 0.5 }
    );

    observer.observe(node);

    return () => observer.disconnect();

  }, []);

  return (
    <>
      <main className="bg-[#0C0C0C] text-[#EDEBE7] overflow-hidden">
        {/* HERO */}
        <section
          ref={heroRef}
          className="relative min-h-dvh overflow-hidden pb-24 md:pb-0"
        >
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
              src="/videos/Hero/hero-mobile-def.mp4"
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
          <div className="absolute inset-0 bg-black/40" />
          {/* GRAIN */}
          <div className="absolute inset-0 opacity-20 mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-10" />

          {/* NAVBAR — statica, in cima all'hero, non segue lo scroll.
              Logo e padding ridotti solo su mobile per lasciare piu'
              spazio verticale al contenuto sotto — invariati da md in su. */}
          <nav className="relative z-50">
            <div className="max-w-7xl mx-auto flex justify-center py-4 md:py-8">

              <a
                href="/"
                className="block"
              >
                <img
                  src="/logo-white.png"
                  alt="Portovenere Experiences"
                  className="w-auto h-12 md:h-24"
                />
              </a>

            </div>
          </nav>


          {/* HERO CONTENT — su mobile: meno padding-top, titolo piu'
              piccolo, margini ridotti tra gli elementi, cosi' che
              entrambi i bottoni CTA restino visibili senza scroll.
              Tutte le classi md: sono rimaste identiche a prima. */}
          <div className="relative z-20 min-h-dvh flex items-center justify-center px-6 text-center">
            <div className="max-w-6xl pt-16 md:pt-32">
              <p className="uppercase tracking-[0.3em] md:tracking-[0.45em] text-zinc-300 text-[10px] md:text-sm mb-4 md:mb-8">
                {t("hero.eyebrow")}
              </p>

              <h1 className="text-[40px] leading-[0.95] md:text-[140px] md:leading-[0.9] font-light tracking-tight mb-5 md:mb-10">
               {t("hero.title")}
              </h1>

              <p className="max-w-2xl mx-auto text-zinc-200 text-sm md:text-2xl leading-relaxed">
                {t("hero.subtitle")}
              </p>

              {/* CTA */}
              <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-5 mt-6 md:mt-12">
                <a
                  href="/craft-your-experience"
                  onClick={() => trackCtaClicked("hero")}
                  className="bg-[#EDEBE7] text-black px-8 py-3.5 md:px-10 md:py-5 rounded-full uppercase tracking-[0.2em] md:tracking-[0.25em] text-[11px] md:text-xs hover:scale-105 transition-all duration-500"
                >
                  {t("hero.ctaPrimary")}
                </a>

                <a
                  href="#how-it-works"
                  className="border border-[#EDEBE7]/30 backdrop-blur-md px-8 py-3.5 md:px-10 md:py-5 rounded-full uppercase tracking-[0.2em] md:tracking-[0.25em] text-[11px] md:text-xs hover:bg-[#EDEBE7] hover:text-black transition-all duration-500"
                >
                  {t("hero.ctaSecondary")}
                </a>
              </div>

              {/* TRUST STRIP */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-10 mt-6 md:mt-14 text-[9px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-300">
                <span>{t("hero.trustLimited")}</span>
                <span>{t("hero.trustPrivateAccess")}</span>
                <span>{t("hero.trustCollaborations")}</span>
                <span>{t("hero.trustStorytelling")}</span>
              </div>
            </div>
          </div>


        </section>

        {/* AUTHORITY */}
        <section className="border-y border-[#EDEBE7]/10 py-6 bg-black">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-10 uppercase tracking-[0.35em] text-[10px] md:text-xs text-zinc-500 px-6 text-center">
            <span>{t("authority.item1")}</span>
            <span>{t("authority.item2")}</span>
            <span>{t("authority.item3")}</span>
            <span>{t("authority.item4")}</span>
            <span>{t("authority.item5")}</span>
          </div>
        </section>

        {/* EXPERIENCES */}
        <section
          id="how-it-works"
          className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32"
        >
          <div className="text-center mb-16 md:mb-24 px-6 md:px-0">
            <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-5">
              {t("howItWorks.eyebrow")}
            </p>

            <h2 className="text-5xl md:text-8xl font-light leading-[0.95]">
              {t("howItWorks.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* CARD 1 */}
            <div className="group relative overflow-hidden rounded-[40px] h-[520px] md:h-[700px]">
              <img
                src="/step-one.jpg"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
                alt="Private Sailing Experience"
              />

              <div className="absolute inset-0 bg-black/45" />

              <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 z-20 bg-[#EDEBE7]/10 backdrop-blur-xl border border-[#EDEBE7]/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.25em]">
                {t("howItWorks.step1.badge")}
              </div>

              <div className="relative z-10 h-full flex flex-col justify-end items-center text-center md:items-start md:text-left p-8 md:p-10">
                <p className="uppercase tracking-[0.3em] text-sm text-zinc-300 mb-4">
                  {t("howItWorks.step1.eyebrow")}
                </p>

                <h3 className="text-4xl md:text-5xl font-light leading-tight mb-6">
                  {t("howItWorks.step1.title")}
                </h3>

                <p className="text-zinc-200 leading-relaxed mb-8">
                  {t("howItWorks.step1.description")}
                </p>

                <a
                  href="/craft-your-experience"
                  onClick={() => trackCtaClicked("how_it_works_step_1")}
                  className="bg-[#EDEBE7] text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500"
                >
                  {t("howItWorks.step1.cta")}
                </a>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="group relative overflow-hidden rounded-[40px] h-[520px] md:h-[700px]">
              <img
                src="/step-two.jpg"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
                alt="Underwater Storytelling"
              />

              <div className="absolute inset-0 bg-black/45" />

              <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 z-20 bg-[#EDEBE7]/10 backdrop-blur-xl border border-[#EDEBE7]/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.25em]">
                {t("howItWorks.step2.badge")}
              </div>

              <div className="relative z-10 h-full flex flex-col justify-end items-center text-center md:items-start md:text-left p-8 md:p-10">
                <p className="uppercase tracking-[0.3em] text-sm text-zinc-300 mb-4">
                  {t("howItWorks.step2.eyebrow")}
                </p>

                <h3 className="text-4xl md:text-5xl font-light leading-tight mb-6">
                  {t("howItWorks.step2.title")}
                </h3>

                <p className="text-zinc-200 leading-relaxed mb-8">
                  {t("howItWorks.step2.description")}
                </p>

                <a
                  href="/craft-your-experience"
                  onClick={() => trackCtaClicked("how_it_works_step_2")}
                  className="bg-[#EDEBE7] text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500"
                >
                  {t("howItWorks.step2.cta")}
                </a>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="group relative overflow-hidden rounded-[40px] h-[520px] md:h-[700px]">
              <img
                src="/step-three.jpg"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
                alt="Mediterranean Sunset Dinner"
              />

              <div className="absolute inset-0 bg-black/45" />

              <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 z-20 bg-[#EDEBE7]/10 backdrop-blur-xl border border-[#EDEBE7]/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.25em]">
                {t("howItWorks.step3.badge")}
              </div>

              <div className="relative z-10 h-full flex flex-col justify-end items-center text-center md:items-start md:text-left p-8 md:p-10">
                <p className="uppercase tracking-[0.3em] text-sm text-zinc-300 mb-4">
                  {t("howItWorks.step3.eyebrow")}
                </p>

                <h3 className="text-4xl md:text-5xl font-light leading-tight mb-6">
                  {t("howItWorks.step3.title")}
                </h3>

                <p className="text-zinc-200 leading-relaxed mb-8">
                  {t("howItWorks.step3.description")}
                </p>

                <a
                  href="/craft-your-experience"
                  onClick={() => trackCtaClicked("how_it_works_step_3")}
                  className="bg-[#EDEBE7] text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500"
                >
                  {t("howItWorks.step3.cta")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* MANIFESTO */}
        <section
          id="manifesto"
          className="py-40 px-6 border-t border-[#EDEBE7]/10"
        >
          <div className="max-w-5xl mx-auto text-center">
            <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-8">
              {t("manifesto.eyebrow")}
            </p>

            <h2 className="text-5xl md:text-7xl font-light leading-[1.05] mb-12">
              {t("manifesto.title")}
            </h2>

            <p className="max-w-3xl mx-auto text-zinc-400 text-xl leading-relaxed">
              {t("manifesto.description")}
            </p>
          </div>
        </section>

        {/* SCARCITY */}
        <section className="py-28 px-6 bg-[#E3D5B8] text-black">
          <div className="max-w-4xl mx-auto text-center">
            <p className="uppercase tracking-[0.4em] text-black/50 text-sm mb-6">
              {t("scarcity.eyebrow")}
            </p>

            <h2 className="text-5xl md:text-7xl font-light leading-tight mb-10">
              {t("scarcity.title")}
            </h2>

            <p className="text-black/65 text-lg leading-relaxed">
              {t("scarcity.description")}
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          ref={finalCtaRef}
          id="contact"
          className="py-40 px-6 text-center bg-[#0C0C0C] border-t border-[#EDEBE7]/10"
        >
          <p className="uppercase tracking-[0.4em] text-zinc-500 text-sm mb-6">
            {t("finalCta.eyebrow")}
          </p>

          <h2 className="text-5xl md:text-8xl font-light leading-[0.95] mb-10">
            {t("finalCta.title")}
          </h2>

          <p className="max-w-2xl mx-auto text-zinc-400 text-lg leading-relaxed mb-12">
            {t("finalCta.description")}
          </p>

          <a
            href="/craft-your-experience"
            onClick={() => trackCtaClicked("final_cta")}
            className="inline-block bg-[#EDEBE7] text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500"
          >
            {t("finalCta.cta")}
          </a>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#EDEBE7]/10 py-16 px-6 bg-[#0C0C0C]">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">

            <img
              src="/logo-white.png"
              alt="Portovenere Experiences"
              className="h-9 w-auto opacity-60"
            />

            <div className="flex flex-wrap justify-center gap-8 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
              <a href="/craft-your-experience" className="hover:text-white transition-colors duration-300">
                {t("footer.craftLink")}
              </a>
              <a
                href="https://www.portovenere.com/terms-conditions/"
                target="_blank"
                className="hover:text-white transition-colors duration-300"
              >
                {t("footer.terms")}
              </a>

              <a href="https://www.iubenda.com/privacy-policy/15645850" className="hover:text-white transition-colors duration-300" target="_blank">
                {t("footer.privacy")}
              </a>

            </div>

            <p className="text-zinc-700 text-[10px] uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} Portovenere Experiences
            </p>

            <p className="text-zinc-700 text-[10px] uppercase tracking-[0.3em]">
              {t("footer.poweredBy")}
            </p>

          </div>
        </footer>

      </main>
    </>
  );
}