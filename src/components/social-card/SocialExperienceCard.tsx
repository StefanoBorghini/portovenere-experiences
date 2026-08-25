"use client";

import { SocialCardData } from "@/types/socialCard";
import { SocialCardFormatConfig } from "./socialCardFormats";
import { proposalConfig } from "@/config/proposalConfig";
import { SOCIAL_CARD_QR_CODE_IMAGE, SOCIAL_CARD_LOGO_IMAGE } from "@/lib/social-card/qrCodeImage";

// =========================================================
// SocialExperienceCard — anteprima interattiva a schermo dentro
// SocialCardModal (React normale, mai catturata da un motore
// screenshot: il file scaricato viene generato da zero lato server,
// vedi /api/admin/leads/[id]/social-card/export +
// renderSocialCardSatori.tsx). Serve solo a farsi un'idea prima di
// scaricare — stessa composizione visiva del file finale.
//
// Composizione: fotografia a piena pagina, blocco editoriale ancorato
// in basso su un gradiente scuro (stessa lingua visiva di
// ProposalHero.tsx — overlay nero + grana), logo/etichetta in alto.
// Nessun impaginato "a griglia rigida": la quantita' di spazio dato
// al testo si adatta al contenuto reale (titolo lungo/corto, numero
// di highlight variabile, descrizione presente o assente), non un
// template fisso.
// =========================================================

interface SocialExperienceCardProps {
  data: SocialCardData;
  format: SocialCardFormatConfig;
  showPrice: boolean;
  cta: string;
}

export default function SocialExperienceCard({ data, format, showPrice, cta }: SocialExperienceCardProps) {

    const primaryImage = data.images[0] || "/images/default-hero.webp";

    // Le Story hanno margini di sicurezza molto piu' larghi delle
    // Feed (per non finire sotto l'interfaccia di Instagram), pur
    // avendo la stessa format.width — dimensionare il testo sulla
    // larghezza REALMENTE disponibile (non su tutta format.width)
    // evita che un titolo che sta comodo in Feed vada in overflow o
    // si spezzi a meta' parola in Story.
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

        {/* GRADIENT — leggero in alto (lascia respirare la foto),
            marcato in basso per la leggibilita' del blocco testo.
            Colori in rgba() esplicito, MAI classi Tailwind con
            opacita' (from-black/35, via-black/10...): Tailwind v4 le
            compila con color-mix()/oklab(), che html2canvas non sa
            interpretare — il download falliva in silenzio con
            "unsupported color function oklab". Stesso motivo per
            ogni testo qui sotto (text-white/NN -> style color rgba). */}
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

        {/* TOP — logo + etichetta brand. Dimensione pensata per
            restare leggibile a schermo intero su Instagram (non solo
            in anteprima grande), non solo come firma discreta. */}
        <div
          className="absolute inset-x-0 flex items-center gap-3"
          style={{ top: format.safeTop, left: format.safeTop, right: format.safeTop }}
        >
          <img
            src={SOCIAL_CARD_LOGO_IMAGE}
            alt={proposalConfig.brand.name}
            style={{ height: format.width * 0.055 }}
            className="object-contain opacity-95"
          />
          <span
            className="uppercase"
            style={{ fontSize: contentWidth * 0.018, lineHeight: 1, letterSpacing: "0.3em", color: "rgba(255,255,255,0.75)" }}
          >
            {proposalConfig.brand.name}
          </span>
        </div>

        {/* BOTTOM — blocco editoriale */}
        <div
          className="absolute inset-x-0 flex flex-col"
          style={{ bottom: format.safeBottom, left: format.safeTop, right: format.safeTop }}
        >

          {data.mood && (
            <span
              className="uppercase text-[#d6c6a5] mb-3"
              style={{ fontSize: contentWidth * 0.013, letterSpacing: "0.3em" }}
            >
              {data.mood}
            </span>
          )}

          <h1
            className="font-light leading-[0.95] tracking-tight mb-4"
            style={{ fontSize: contentWidth * 0.082 }}
          >
            {data.title}
          </h1>

          <p
            className="uppercase mb-6"
            style={{ fontSize: contentWidth * 0.017, letterSpacing: "0.15em", color: "rgba(255,255,255,0.7)" }}
          >
            {metaLine}
          </p>

          {data.highlights.length > 0 && (
            <ul className="mb-4" style={{ fontSize: contentWidth * 0.02 }}>
              {data.highlights.map((highlight) => (
                <li
                  key={highlight.title}
                  className="uppercase font-light"
                  style={{ letterSpacing: "0.08em", lineHeight: 1.7, color: "rgba(255,255,255,0.9)" }}
                >
                  {highlight.title}
                </li>
              ))}
            </ul>
          )}

          {/* STRISCIA MINIATURE — una foto per esperienza coinvolta
              (featured + incluse, TUTTE, non un sottoinsieme fisso),
              prova visiva di cosa contiene il pacchetto oltre alla
              sola foto principale di sfondo. Dimensione calcolata sul
              numero effettivo: con 2 esperienze le miniature sono
              piu' grandi, con 4 si stringono — mai piu' larghe dello
              spazio realmente disponibile (contentWidth), a
              differenza di una dimensione fissa che in Story, con
              margini piu' larghi, avrebbe potuto uscire dal bordo. */}
          {data.highlights.some((h) => h.image) && (() => {
            const thumbCount = data.highlights.filter((h) => h.image).length;
            const thumbGap = contentWidth * 0.02;
            const maxThumbSize = contentWidth * 0.2;
            const thumbSize = Math.min(
              maxThumbSize,
              (contentWidth - thumbGap * (thumbCount - 1)) / thumbCount
            );

            return (
            <div className="flex mb-6" style={{ gap: thumbGap }}>
              {data.highlights
                .filter((h) => h.image)
                .map((highlight) => (
                  <div
                    key={highlight.title}
                    style={{
                      width: thumbSize,
                      height: thumbSize,
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                    className="relative overflow-hidden flex-none"
                  >
                    <img
                      src={highlight.image}
                      alt={highlight.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
            );
          })()}

          {data.description && (
            <p
              className="italic font-light mb-8"
              style={{ fontSize: contentWidth * 0.019, lineHeight: 1.6, maxWidth: "88%", color: "rgba(255,255,255,0.65)" }}
            >
              {data.description}
            </p>
          )}

          {showPrice && data.price ? (
            <p
              className="uppercase text-white mb-4"
              style={{ fontSize: contentWidth * 0.016, letterSpacing: "0.2em" }}
            >
              From €{Math.round(data.price).toLocaleString("en-US")}
            </p>
          ) : (
            <p
              className="uppercase mb-4"
              style={{ fontSize: contentWidth * 0.014, letterSpacing: "0.25em", color: "rgba(255,255,255,0.5)" }}
            >
              Private Experience
            </p>
          )}

          <div
            className="flex items-center justify-between pt-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}
          >
            <span
              className="uppercase font-medium"
              style={{ fontSize: contentWidth * 0.021, letterSpacing: "0.12em", maxWidth: "70%" }}
            >
              {cta}
            </span>

            <div className="flex flex-col items-center flex-none" style={{ gap: format.width * 0.006 }}>
              <img
                src={SOCIAL_CARD_QR_CODE_IMAGE}
                alt="Scan to build your own experience"
                style={{ width: format.width * 0.09, height: format.width * 0.09 }}
              />
              <span
                style={{ fontSize: contentWidth * 0.011, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}
              >
                portovenere.com
              </span>
            </div>
          </div>

        </div>
      </div>
    );
}
