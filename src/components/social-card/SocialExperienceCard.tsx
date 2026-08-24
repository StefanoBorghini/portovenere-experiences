import { forwardRef } from "react";
import { SocialCardData } from "@/types/socialCard";
import { SocialCardFormatConfig } from "./socialCardFormats";
import { proposalConfig } from "@/config/proposalConfig";

// =========================================================
// SocialExperienceCard — il renderer visivo puro. Sempre montato
// alla dimensione reale in pixel del formato (mai scalato via CSS
// per il layout: lo scale eventuale per l'anteprima a schermo lo
// applica il chiamante con un transform sul contenitore esterno),
// cosi' html2canvas cattura gia' alla risoluzione corretta.
//
// Composizione: fotografia a piena pagina, blocco editoriale ancorato
// in basso su un gradiente scuro (stessa lingua visiva di
// ProposalHero.tsx — overlay nero + grana), logo/etichetta in alto.
// Nessun impaginato "a griglia rigida": la quantita' di spazio dato
// al testo si adatta al contenuto reale (titolo lungo/corto, 1-3
// highlight, descrizione presente o assente), non un template fisso.
// =========================================================

interface SocialExperienceCardProps {
  data: SocialCardData;
  format: SocialCardFormatConfig;
  showPrice: boolean;
  cta: string;
}

// Le foto delle experience arrivano da Supabase Storage (dominio
// esterno) e sono gia' visualizzate altrove nella pagina SENZA
// crossOrigin. Se questo <img crossOrigin="anonymous"> punta allo
// stesso URL, il browser puo' servirla dalla cache non-CORS gia'
// presente — il canvas risulta "tainted" e l'export fallisce in
// silenzio. Un suffisso fisso nella query string forza una richiesta
// di rete separata, fatta stavolta in modalita' CORS.
function withCorsCacheBust(url: string): string {
  if (!url || url.startsWith("/")) return url; // asset locali, stesso dominio: nessun problema CORS
  return url.includes("?") ? `${url}&social-card=1` : `${url}?social-card=1`;
}

const SocialExperienceCard = forwardRef<HTMLDivElement, SocialExperienceCardProps>(
  ({ data, format, showPrice, cta }, ref) => {

    const primaryImage = withCorsCacheBust(data.images[0] || "/images/default-hero.webp");

    const metaLine = [data.duration, data.travelers, data.dates]
      .filter(Boolean)
      .join("   ·   ");

    return (
      <div
        ref={ref}
        style={{ width: format.width, height: format.height }}
        className="relative overflow-hidden bg-black text-white"
      >
        {/* BACKGROUND IMAGE */}
        <img
          src={primaryImage}
          alt={data.title}
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
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

        {/* TOP — logo + etichetta brand, stesso linguaggio di ProposalHero */}
        <div
          className="absolute inset-x-0 flex items-center gap-3"
          style={{ top: format.safeTop, left: format.safeTop, right: format.safeTop }}
        >
          <img
            src={proposalConfig.brand.logo}
            alt={proposalConfig.brand.name}
            style={{ height: format.width * 0.032 }}
            className="object-contain opacity-95"
          />
          <span
            className="uppercase"
            style={{ fontSize: format.width * 0.011, letterSpacing: "0.35em", color: "rgba(255,255,255,0.6)" }}
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
              style={{ fontSize: format.width * 0.013, letterSpacing: "0.3em" }}
            >
              {data.mood}
            </span>
          )}

          <h1
            className="font-light leading-[0.95] tracking-tight mb-4"
            style={{ fontSize: format.width * 0.082 }}
          >
            {data.title}
          </h1>

          <p
            className="uppercase mb-6"
            style={{ fontSize: format.width * 0.017, letterSpacing: "0.15em", color: "rgba(255,255,255,0.7)" }}
          >
            {metaLine}
          </p>

          {data.highlights.length > 0 && (
            <ul className="mb-4" style={{ fontSize: format.width * 0.02 }}>
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
              (featured + incluse), prova visiva di cosa contiene il
              pacchetto oltre alla sola foto principale di sfondo. */}
          {data.highlights.some((h) => h.image) && (
            <div className="flex mb-6" style={{ gap: format.width * 0.015 }}>
              {data.highlights
                .filter((h) => h.image)
                .map((highlight) => (
                  <div
                    key={highlight.title}
                    style={{
                      width: format.width * 0.15,
                      height: format.width * 0.15,
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                    className="relative overflow-hidden flex-none"
                  >
                    <img
                      src={withCorsCacheBust(highlight.image!)}
                      alt={highlight.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                ))}
            </div>
          )}

          {data.description && (
            <p
              className="italic font-light mb-8"
              style={{ fontSize: format.width * 0.019, lineHeight: 1.6, maxWidth: "88%", color: "rgba(255,255,255,0.65)" }}
            >
              {data.description}
            </p>
          )}

          {showPrice && data.price ? (
            <p
              className="uppercase text-white mb-4"
              style={{ fontSize: format.width * 0.016, letterSpacing: "0.2em" }}
            >
              From €{Math.round(data.price).toLocaleString("en-US")}
            </p>
          ) : (
            <p
              className="uppercase mb-4"
              style={{ fontSize: format.width * 0.014, letterSpacing: "0.25em", color: "rgba(255,255,255,0.5)" }}
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
              style={{ fontSize: format.width * 0.021, letterSpacing: "0.12em" }}
            >
              {cta}
            </span>
            <span
              style={{ fontSize: format.width * 0.013, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}
            >
              portovenere.com
            </span>
          </div>

        </div>
      </div>
    );
  }
);

SocialExperienceCard.displayName = "SocialExperienceCard";

export default SocialExperienceCard;
