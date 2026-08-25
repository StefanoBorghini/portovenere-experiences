import { SocialCardData } from "@/types/socialCard";
import { SocialCardFormatConfig } from "@/components/social-card/socialCardFormats";
import { proposalConfig } from "@/config/proposalConfig";
import { toSatoriImageDataUri } from "./toSatoriImage";
import { SOCIAL_CARD_QR_CODE_IMAGE, SOCIAL_CARD_LOGO_IMAGE, SOCIAL_CARD_LOGO_ASPECT_RATIO } from "./qrCodeImage";

// =========================================================
// buildSocialStoryElement — composizione AUTONOMA per il formato
// Story/Reel (9:16), non una versione rimpicciolita di
// renderSocialCardSatori.tsx (quello resta invariato, usato per il
// Feed). Stessa identita' visiva (fotografia piena pagina, gradiente
// scuro in basso, stesso logo/branding, stessa striscia miniature,
// stesso QR) ma MENO contenuto e MOLTO piu' grande: niente paragrafo
// descrittivo — solo titolo, meta, highlight in elenco con le
// rispettive foto, prezzo/CTA. La Story va letta in un colpo
// d'occhio sullo schermo di un telefono, non studiata come il Post.
// =========================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

export async function buildSocialStoryElement(
  data: SocialCardData,
  format: SocialCardFormatConfig,
  showPrice: boolean,
  cta: string
) {

  const thumbnails = data.highlights.filter((h) => h.image);

  const [primaryImage, logoUrl, qrCode, thumbnailImages] = await Promise.all([
    toSatoriImageDataUri(toAbsoluteUrl(data.images[0] || "/images/default-hero.webp")),
    toSatoriImageDataUri(toAbsoluteUrl(SOCIAL_CARD_LOGO_IMAGE)),
    toSatoriImageDataUri(toAbsoluteUrl(SOCIAL_CARD_QR_CODE_IMAGE)),
    Promise.all(thumbnails.map((h) => toSatoriImageDataUri(toAbsoluteUrl(h.image!)))),
  ]);

  const metaLine = [data.duration, data.travelers, data.dates]
    .filter(Boolean)
    .join("   ·   ");

  // Stessa logica di sicurezza margini di renderSocialCardSatori.tsx
  // — la Story ha safeTop/safeBottom molto piu' larghi del Feed pur
  // condividendo la stessa format.width, quindi il testo va
  // dimensionato sullo spazio REALMENTE disponibile.
  const contentWidth = format.width - format.safeTop * 2;

  // Dimensione miniature — stessa logica del Post: mai piu' larghe
  // dello spazio realmente disponibile, a prescindere dal numero.
  const thumbGap = contentWidth * 0.02;
  const maxThumbSize = contentWidth * 0.2;
  const thumbSize = thumbnails.length > 0
    ? Math.min(maxThumbSize, (contentWidth - thumbGap * (thumbnails.length - 1)) / thumbnails.length)
    : 0;

  return (
    <div
      style={{
        width: format.width,
        height: format.height,
        display: "flex",
        position: "relative",
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily: "Inter",
      }}
    >
      {/* BACKGROUND IMAGE */}
      <img
        src={primaryImage}
        width={format.width}
        height={format.height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: format.width,
          height: format.height,
          objectFit: "cover",
        }}
      />

      {/* GRADIENT — leggero in alto, marcato in basso. Stesso
          trattamento del Feed. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: format.width,
          height: format.height,
          display: "flex",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,1) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: format.height * 0.38,
          left: 0,
          width: format.width,
          height: format.height * 0.62,
          display: "flex",
          background:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* TOP — logo + etichetta brand, stessa dimensione del Feed */}
      <div
        style={{
          position: "absolute",
          top: format.safeTop,
          left: format.safeTop,
          right: format.safeTop,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <img
          src={logoUrl}
          width={format.width * 0.055 * SOCIAL_CARD_LOGO_ASPECT_RATIO}
          height={format.width * 0.055}
          style={{ objectFit: "contain" }}
        />
        <span
          style={{
            display: "flex",
            textTransform: "uppercase",
            fontSize: contentWidth * 0.018,
            lineHeight: 1,
            letterSpacing: contentWidth * 0.018 * 0.3,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {proposalConfig.brand.name}
        </span>
      </div>

      {/* BOTTOM — blocco editoriale essenziale: titolo dominante,
          meta, highlight in elenco, prezzo/CTA. Niente miniature,
          niente paragrafo descrittivo. */}
      <div
        style={{
          position: "absolute",
          bottom: format.safeBottom,
          left: format.safeTop,
          right: format.safeTop,
          display: "flex",
          flexDirection: "column",
        }}
      >

        {data.mood && (
          <span
            style={{
              display: "flex",
              textTransform: "uppercase",
              fontSize: contentWidth * 0.022,
              letterSpacing: contentWidth * 0.022 * 0.3,
              color: "#d6c6a5",
              marginBottom: 20,
            }}
          >
            {data.mood}
          </span>
        )}

        <div
          style={{
            display: "flex",
            fontSize: contentWidth * 0.155,
            lineHeight: 0.98,
            fontWeight: 300,
            letterSpacing: -(contentWidth * 0.155 * 0.01),
            marginBottom: 28,
          }}
        >
          {data.title}
        </div>

        <span
          style={{
            display: "flex",
            textTransform: "uppercase",
            fontSize: contentWidth * 0.03,
            letterSpacing: contentWidth * 0.03 * 0.12,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 40,
          }}
        >
          {metaLine}
        </span>

        {data.highlights.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 36 }}>
            {data.highlights.map((highlight) => (
              <span
                key={highlight.title}
                style={{
                  display: "flex",
                  textTransform: "uppercase",
                  fontWeight: 300,
                  fontSize: contentWidth * 0.037,
                  letterSpacing: contentWidth * 0.037 * 0.06,
                  lineHeight: 1.85,
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {highlight.title}
              </span>
            ))}
          </div>
        )}

        {thumbnails.length > 0 && (
          <div style={{ display: "flex", gap: thumbGap, marginBottom: 44 }}>
            {thumbnails.map((highlight, index) => (
              <div
                key={highlight.title}
                style={{
                  display: "flex",
                  width: thumbSize,
                  height: thumbSize,
                  border: "1px solid rgba(255,255,255,0.3)",
                  overflow: "hidden",
                }}
              >
                <img
                  src={thumbnailImages[index]}
                  width={thumbSize}
                  height={thumbSize}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        )}

        {showPrice && data.price ? (
          <span
            style={{
              display: "flex",
              textTransform: "uppercase",
              fontSize: contentWidth * 0.028,
              letterSpacing: contentWidth * 0.028 * 0.2,
              color: "#ffffff",
              marginBottom: 24,
            }}
          >
            {`From €${Math.round(data.price).toLocaleString("en-US")}`}
          </span>
        ) : (
          <span
            style={{
              display: "flex",
              textTransform: "uppercase",
              fontSize: contentWidth * 0.024,
              letterSpacing: contentWidth * 0.024 * 0.25,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 24,
            }}
          >
            Private Experience
          </span>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.18)",
            paddingTop: 28,
          }}
        >
          <span
            style={{
              display: "flex",
              textTransform: "uppercase",
              fontWeight: 500,
              fontSize: contentWidth * 0.036,
              letterSpacing: contentWidth * 0.036 * 0.1,
              maxWidth: contentWidth * 0.62,
            }}
          >
            {cta}
          </span>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: format.width * 0.008,
            }}
          >
            <img
              src={qrCode}
              width={format.width * 0.1}
              height={format.width * 0.1}
            />
            <span
              style={{
                display: "flex",
                fontSize: contentWidth * 0.013,
                letterSpacing: contentWidth * 0.013 * 0.08,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              portovenere.com
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
