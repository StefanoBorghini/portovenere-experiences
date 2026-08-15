"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import {
  trackStartPageView,
  trackClickCreateExperience,
  trackClickExplorePortovenere,
  trackClickCuratedExperiences,
  trackClickStayEatDiscover,
  trackClickWorkWithUs,
} from "@/lib/analytics/gtag";

// =========================================================
// DESTINAZIONI — un solo punto dove aggiornare i link quando
// nasceranno pagine dedicate (esperienze pubbliche, vetrina
// locale). STAY_EAT_DISCOVER resta un placeholder (WhatsApp)
// finche' quella vetrina non esiste — nessun URL e' stato
// inventato. WORK_WITH_US_URL punta a /become-a-partner, la
// pagina B2B reale.
// =========================================================

const CONFIGURATOR_URL = "/craft-your-experience";
const EXPLORE_PORTOVENERE_URL = "https://www.portovenere.com";
const CURATED_EXPERIENCES_URL = "https://www.portovenere.com/plan-your-stay/";

const STAY_EAT_DISCOVER_URL =
  "https://wa.me/+393487140722";

const WORK_WITH_US_URL = "/become-a-partner";

// Nessun handle Instagram presente nel progetto oggi — lasciare
// vuoto nasconde l'icona automaticamente (vedi JSX in fondo).
const INSTAGRAM_URL = "";

const PRIVACY_URL = "https://www.iubenda.com/privacy-policy/15645850";
const COOKIE_POLICY_URL =
  "https://www.iubenda.com/privacy-policy/15645850/cookie-policy";

// Stessi 5 parametri UTM standard — letti dalla querystring di
// ingresso e ripassati intatti al configuratore, cosi' GA4 puo'
// attribuire la sessione (bio Instagram, Stories, Reel, Ads...)
// anche dopo il passaggio da /start.
const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export default function StartClient() {
  const t = useTranslations("start");
  const reduceMotion = useReducedMotion();

  // =======================================================
  // UTM PASSTHROUGH — useSearchParams (non window.location) cosi'
  // il valore e' identico tra render server e client, senza bisogno
  // di un effect/setState che rischierebbe un mismatch di idratazione.
  // =======================================================

  const incomingParams = useSearchParams();

  const utmQueryString = useMemo(() => {
    const forwarded = new URLSearchParams();

    UTM_PARAMS.forEach((key) => {
      const value = incomingParams.get(key);
      if (value) forwarded.set(key, value);
    });

    return forwarded.toString();
  }, [incomingParams]);

  useEffect(() => {
    trackStartPageView();
  }, []);

  const configuratorHref = utmQueryString
    ? `${CONFIGURATOR_URL}?${utmQueryString}`
    : CONFIGURATOR_URL;

  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10%" },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <main className="min-h-dvh bg-[#0C0C0C] text-[#EDEBE7] flex flex-col">
      {/* GRAIN — stessa texture leggera gia' usata in home */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.15] mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* HEADER — solo logo, minimo ingombro verticale */}
      <header className="relative z-10 flex justify-center pt-6 pb-2 px-6">
        <Link href="/" aria-label="Portovenere Experiences — home">
          <img
            src="/logo-white.png"
            alt="Portovenere Experiences"
            className="h-8 w-auto opacity-90"
          />
        </Link>
      </header>

      {/* HERO — compatta, CTA sempre above-the-fold su mobile */}
      <section className="relative z-10 flex-1 flex flex-col justify-center px-6 pt-8 pb-10 text-center">
        <div className="max-w-md mx-auto w-full">
          <p className="uppercase tracking-[0.35em] text-zinc-500 text-[10px] mb-4">
            {t("hero.eyebrow")}
          </p>

          <h1 className="text-[32px] leading-[1.05] sm:text-[40px] font-light tracking-tight mb-4">
            {t("hero.title")}
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            {t("hero.subtitle")}
          </p>

          {/* CTA PRIMARIA — dominante, unica in questo colore/peso */}
          <Link
            href={configuratorHref}
            onClick={() =>
              trackClickCreateExperience({
                linkPosition: 1,
                linkDestination: configuratorHref,
              })
            }
            className="
              block w-full sm:w-auto sm:inline-block
              bg-[#EDEBE7] text-black
              px-10 py-4
              rounded-full
              uppercase tracking-[0.2em] text-[13px]
              hover:scale-[1.03] active:scale-[0.98]
              transition-transform duration-300
              shadow-[0_0_40px_-8px_rgba(237,235,231,0.35)]
            "
          >
            {t("hero.cta")}
          </Link>

          <p className="text-zinc-500 text-xs leading-relaxed mt-4">
            {t("hero.ctaSubtext")}
          </p>
        </div>
      </section>

      {/* SECONDARY LINKS — percorsi di esplorazione, editoriali */}
      <motion.section
        {...fadeUp}
        className="relative z-10 px-6 pb-10"
        aria-label="Explore Portovenere"
      >
        <div className="max-w-md mx-auto w-full flex flex-col gap-3">
          <LinkCard
            eyebrow={t("links.explore.eyebrow")}
            description={t("links.explore.description")}
            href={EXPLORE_PORTOVENERE_URL}
            external={false}
            onSelect={() =>
              trackClickExplorePortovenere({
                linkPosition: 2,
                linkDestination: EXPLORE_PORTOVENERE_URL,
              })
            }
          />

          <LinkCard
            eyebrow={t("links.curated.eyebrow")}
            description={t("links.curated.description")}
            href={CURATED_EXPERIENCES_URL}
            external={false}
            onSelect={() =>
              trackClickCuratedExperiences({
                linkPosition: 3,
                linkDestination: CURATED_EXPERIENCES_URL,
              })
            }
          />

          <LinkCard
            eyebrow={t("links.concierge.eyebrow")}
            description={t("links.concierge.description")}
            href={STAY_EAT_DISCOVER_URL}
            external
            onSelect={() =>
              trackClickStayEatDiscover({
                linkPosition: 4,
                linkDestination: STAY_EAT_DISCOVER_URL,
              })
            }
          />
        </div>
      </motion.section>

      {/* MANIFESTO — una riga, nessuna spiegazione necessaria */}
      <motion.section
        {...fadeUp}
        className="relative z-10 border-t border-[#EDEBE7]/10 px-6 py-8 text-center"
      >
        <p className="uppercase tracking-[0.3em] text-zinc-600 text-[10px] leading-relaxed max-w-xs mx-auto">
          {t("manifesto")}
        </p>
      </motion.section>

      {/* B2B — presente ma volutamente defilato */}
      <section className="relative z-10 px-6 pb-8 text-center">
        <Link
          href={WORK_WITH_US_URL}
          onClick={() =>
            trackClickWorkWithUs({
              linkPosition: 5,
              linkDestination: WORK_WITH_US_URL,
            })
          }
          className="inline-block text-zinc-500 hover:text-zinc-300 transition-colors duration-300 text-[11px] uppercase tracking-[0.25em]"
        >
          {t("workWithUs.label")}
        </Link>
        <p className="text-zinc-700 text-[10px] leading-relaxed mt-2 max-w-xs mx-auto">
          {t("workWithUs.description")}
        </p>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#EDEBE7]/10 px-6 py-8">
        <div className="max-w-md mx-auto flex flex-col items-center gap-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">
            Portovenere.com
            <br />
            <span className="text-zinc-600">{t("footer.tagline")}</span>
          </p>

          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            <a
              href={PRIVACY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors duration-300"
            >
              {t("footer.privacy")}
            </a>
            <a
              href={COOKIE_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors duration-300"
            >
              {t("footer.cookies")}
            </a>
            <a
              href={STAY_EAT_DISCOVER_URL}
              className="hover:text-zinc-400 transition-colors duration-300"
            >
              {t("footer.contact")}
            </a>
          </div>

          {INSTAGRAM_URL && (
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Portovenere Experiences on Instagram"
              className="text-zinc-600 hover:text-zinc-400 transition-colors duration-300 mt-1"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
          )}
        </div>
      </footer>
    </main>
  );
}

// =========================================================
// LinkCard — card editoriale compatta, riusata per i 3 percorsi
// secondari. Non e' un pulsante Linktree: nessuno sfondo pieno,
// solo un bordo sottile e un layout a due righe (eyebrow +
// microcopy) con freccia, coerente con lo stile "ghost button"
// gia' usato nel resto del sito (border-white/20).
// =========================================================

function LinkCard({
  eyebrow,
  description,
  href,
  external,
  onSelect,
}: {
  eyebrow: string;
  description: string;
  href: string;
  external: boolean;
  onSelect: () => void;
}) {
  const className =
    "group flex items-center justify-between gap-4 border border-[#EDEBE7]/12 rounded-2xl px-5 py-4 text-left hover:border-[#EDEBE7]/30 hover:bg-[#EDEBE7]/[0.03] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#EDEBE7]/60 focus-visible:outline-offset-2";

  const content = (
    <>
      <span>
        <span className="block uppercase tracking-[0.2em] text-[12px] text-[#EDEBE7]">
          {eyebrow}
        </span>
        <span className="block text-zinc-500 text-[12px] leading-snug mt-1">
          {description}
        </span>
      </span>

      <span
        aria-hidden="true"
        className="shrink-0 text-zinc-500 group-hover:text-[#EDEBE7] group-hover:translate-x-0.5 transition-all duration-300"
      >
        &rarr;
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} onClick={onSelect} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onSelect} className={className}>
      {content}
    </Link>
  );
}