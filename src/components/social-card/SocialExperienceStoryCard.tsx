"use client";

import { SocialCardData } from "@/types/socialCard";
import { SocialCardFormatConfig } from "./socialCardFormats";
import { proposalConfig } from "@/config/proposalConfig";
import { SOCIAL_CARD_QR_CODE_IMAGE } from "@/lib/social-card/qrCodeImage";

// =========================================================
// SocialExperienceStoryCard — anteprima interattiva per il formato
// Story/Reel (9:16). Composizione AUTONOMA, non una versione
// rimpicciolita di SocialExperienceCard.tsx (quello resta invariato,
// usato per Feed/A4) — stessa identita' visiva (fotografia piena
// pagina, gradiente scuro, stesso logo/branding, stesso QR) ma MENO
// contenuto e MOLTO piu' grande: niente striscia miniature, niente
// paragrafo descrittivo. La Story va letta in un colpo d'occhio su
// telefono, non studiata come il Post. Stesse proporzioni usate nel
// render server-side (renderSocialStorySatori.tsx), cosi' anteprima
// ed export finale restano identici.
// =========================================================

interface SocialExperienceStoryCardProps {
  data: SocialCardData;
  format: SocialCardFormatConfig;
  showPrice: boolean;
  cta: string;
}

export default function SocialExperienceStoryCard({ data, format, showPrice, cta }: SocialExperienceStoryCardProps) {

  const primaryImage = data.images[0] || "/images/default-hero.webp";

  const contentWidth = format.width - format.safeTop * 2;

  const metaLine = [data.duration, data.travelers, data.dates]
    .filter(Boolean)
    .join("   ·   ");

  return (
    <div
      style={{ width: format.width, height: format.height }}
      className="relative overflow-hidden bg-black text-white"
    >
      {/* BACKGROUND IMAGE */}
      <img
        src={primaryImage}
        alt={data.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* GRADIENT — stesso trattamento del Feed, colori in rgba()
          esplicito (mai classi Tailwind con opacita': vedi
          SocialExperienceCard.tsx per il perche'). */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,1) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          height: "62%",
          top: "38%",
          background:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* TOP — logo + etichetta brand, stessa dimensione del Feed */}
      <div
        className="absolute inset-x-0 flex items-center gap-3"
        style={{ top: format.safeTop, left: format.safeTop, right: format.safeTop }}
      >
        <img
          src={proposalConfig.brand.logo}
          alt={proposalConfig.brand.name}
          style={{ height: format.width * 0.055 }}
          className="object-contain opacity-95"
        />
        <span
          className="uppercase"
          style={{ fontSize: contentWidth * 0.018, letterSpacing: "0.3em", color: "rgba(255,255,255,0.75)" }}
        >
          {proposalConfig.brand.name}
        </span>
      </div>

      {/* BOTTOM — blocco editoriale essenziale: titolo dominante,
          meta, highlight in elenco, prezzo/CTA. Niente miniature,
          niente paragrafo descrittivo. */}
      <div
        className="absolute inset-x-0 flex flex-col"
        style={{ bottom: format.safeBottom, left: format.safeTop, right: format.safeTop }}
      >

        {data.mood && (
          <span
            className="uppercase"
            style={{ fontSize: contentWidth * 0.022, letterSpacing: "0.3em", color: "#d6c6a5", marginBottom: 20 }}
          >
            {data.mood}
          </span>
        )}

        <h1
          className="font-light leading-[0.98] tracking-tight"
          style={{ fontSize: contentWidth * 0.155, marginBottom: 28 }}
        >
          {data.title}
        </h1>

        <p
          className="uppercase"
          style={{ fontSize: contentWidth * 0.03, letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", marginBottom: 40 }}
        >
          {metaLine}
        </p>

        {data.highlights.length > 0 && (
          <ul style={{ fontSize: contentWidth * 0.037, marginBottom: 44 }}>
            {data.highlights.map((highlight) => (
              <li
                key={highlight.title}
                className="uppercase font-light"
                style={{ letterSpacing: "0.06em", lineHeight: 1.85, color: "rgba(255,255,255,0.92)" }}
              >
                {highlight.title}
              </li>
            ))}
          </ul>
        )}

        {showPrice && data.price ? (
          <p
            className="uppercase text-white"
            style={{ fontSize: contentWidth * 0.028, letterSpacing: "0.2em", marginBottom: 24 }}
          >
            From €{Math.round(data.price).toLocaleString("en-US")}
          </p>
        ) : (
          <p
            className="uppercase"
            style={{ fontSize: contentWidth * 0.024, letterSpacing: "0.25em", color: "rgba(255,255,255,0.5)", marginBottom: 24 }}
          >
            Private Experience
          </p>
        )}

        <div
          className="flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 28 }}
        >
          <span
            className="uppercase font-medium"
            style={{ fontSize: contentWidth * 0.036, letterSpacing: "0.1em", maxWidth: "62%" }}
          >
            {cta}
          </span>

          <div className="flex flex-col items-center flex-none" style={{ gap: format.width * 0.008 }}>
            <img
              src={SOCIAL_CARD_QR_CODE_IMAGE}
              alt="Scan to build your own experience"
              style={{ width: format.width * 0.1, height: format.width * 0.1 }}
            />
            <span
              style={{ fontSize: contentWidth * 0.013, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}
            >
              portovenere.com
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
