import { SocialCardData } from "@/types/socialCard";
import { SocialCardFormatConfig } from "@/components/social-card/socialCardFormats";
import { proposalConfig } from "@/config/proposalConfig";
import { toSatoriImageDataUri } from "./toSatoriImage";
import { SOCIAL_CARD_QR_CODE_IMAGE } from "./qrCodeImage";

// =========================================================
// buildSocialCardElement — la STESSA composizione visiva di
// SocialExperienceCard.tsx (usata per l'anteprima interattiva a
// schermo), riscritta nel sottoinsieme di CSS che Satori/next-og
// capisce: solo flexbox esplicito (niente block-layout implicito
// per contenitori con piu' figli), niente Tailwind, colori sempre
// in rgba() esplicito. Nessun hook/ref: e' una funzione pura
// chiamata una sola volta, lato server, dentro
// /api/admin/leads/[id]/social-card/export.
//
// Il preview interattivo nel modale resta SocialExperienceCard.tsx
// (React normale, mai toccato da html2canvas ora) — questa funzione
// serve solo a produrre il file scaricato, in modo identico a
// prescindere da browser/dispositivo di chi clicca "Download".
// =========================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

export async function buildSocialCardElement(
  data: SocialCardData,
  format: SocialCardFormatConfig,
  showPrice: boolean,
  cta: string
) {

  const thumbnails = data.highlights.filter((h) => h.image);

  // Satori non decodifica WebP (la maggior parte delle foto del
  // sito lo sono) — ogni immagine passa da toSatoriImageDataUri, che
  // la ri-scarica e ri-codifica in PNG. Tutte insieme, non in serie,
  // per non sommare le latenze di rete una dopo l'altra.
  const [primaryImage, logoUrl, thumbnailImages, qrCode] = await Promise.all([
    toSatoriImageDataUri(toAbsoluteUrl(data.images[0] || "/images/default-hero.webp")),
    toSatoriImageDataUri(toAbsoluteUrl(proposalConfig.brand.logo)),
    Promise.all(
      thumbnails.map((h) => toSatoriImageDataUri(toAbsoluteUrl(h.image!)))
    ),
    toSatoriImageDataUri(toAbsoluteUrl(SOCIAL_CARD_QR_CODE_IMAGE)),
  ]);

  const metaLine = [data.duration, data.travelers, data.dates]
    .filter(Boolean)
    .join("   ·   ");

  // Le Story hanno margini di sicurezza molto piu' larghi delle Feed
  // (per non finire sotto l'interfaccia di Instagram), pur avendo la
  // stessa format.width — dimensionare il testo sulla larghezza
  // REALMENTE disponibile (non su tutta format.width) evita che un
  // titolo che sta comodo in Feed vada in overflow o si spezzi a
  // meta' parola in Story.
  const contentWidth = format.width - format.safeTop * 2;

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

      {/* GRADIENT — leggero in alto, marcato in basso per la
          leggibilita' del blocco testo. */}
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

      {/* TOP — logo + etichetta brand */}
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
          width={format.width * 0.055 * 3.4}
          height={format.width * 0.055}
          style={{ objectFit: "contain" }}
        />
        <span
          style={{
            display: "flex",
            textTransform: "uppercase",
            fontSize: contentWidth * 0.018,
            letterSpacing: contentWidth * 0.018 * 0.3,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {proposalConfig.brand.name}
        </span>
      </div>

      {/* BOTTOM — blocco editoriale */}
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
              fontSize: contentWidth * 0.013,
              letterSpacing: contentWidth * 0.013 * 0.3,
              color: "#d6c6a5",
              marginBottom: 12,
            }}
          >
            {data.mood}
          </span>
        )}

        <div
          style={{
            display: "flex",
            fontSize: contentWidth * 0.082,
            lineHeight: 0.95,
            fontWeight: 300,
            letterSpacing: -(contentWidth * 0.082 * 0.01),
            marginBottom: 16,
          }}
        >
          {data.title}
        </div>

        <span
          style={{
            display: "flex",
            textTransform: "uppercase",
            fontSize: contentWidth * 0.017,
            letterSpacing: contentWidth * 0.017 * 0.15,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 24,
          }}
        >
          {metaLine}
        </span>

        {data.highlights.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
            {data.highlights.map((highlight) => (
              <span
                key={highlight.title}
                style={{
                  display: "flex",
                  textTransform: "uppercase",
                  fontWeight: 300,
                  fontSize: contentWidth * 0.02,
                  letterSpacing: contentWidth * 0.02 * 0.08,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {highlight.title}
              </span>
            ))}
          </div>
        )}

        {thumbnails.length > 0 && (
          <div style={{ display: "flex", gap: format.width * 0.015, marginBottom: 24 }}>
            {thumbnails.map((highlight, index) => (
              <div
                key={highlight.title}
                style={{
                  display: "flex",
                  width: format.width * 0.15,
                  height: format.width * 0.15,
                  border: "1px solid rgba(255,255,255,0.3)",
                  overflow: "hidden",
                }}
              >
                <img
                  src={thumbnailImages[index]}
                  width={format.width * 0.15}
                  height={format.width * 0.15}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        )}

        {data.description && (
          <span
            style={{
              display: "flex",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: contentWidth * 0.019,
              lineHeight: 1.6,
              maxWidth: contentWidth * 0.88,
              color: "rgba(255,255,255,0.65)",
              marginBottom: 32,
            }}
          >
            {data.description}
          </span>
        )}

        {showPrice && data.price ? (
          <span
            style={{
              display: "flex",
              textTransform: "uppercase",
              fontSize: contentWidth * 0.016,
              letterSpacing: contentWidth * 0.016 * 0.2,
              color: "#ffffff",
              marginBottom: 16,
            }}
          >
            {`From €${Math.round(data.price).toLocaleString("en-US")}`}
          </span>
        ) : (
          <span
            style={{
              display: "flex",
              textTransform: "uppercase",
              fontSize: contentWidth * 0.014,
              letterSpacing: contentWidth * 0.014 * 0.25,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 16,
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
            paddingTop: 20,
          }}
        >
          <span
            style={{
              display: "flex",
              textTransform: "uppercase",
              fontWeight: 500,
              fontSize: contentWidth * 0.021,
              letterSpacing: contentWidth * 0.021 * 0.12,
              maxWidth: contentWidth * 0.55,
            }}
          >
            {cta}
          </span>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: format.width * 0.006,
            }}
          >
            <img
              src={qrCode}
              width={format.width * 0.09}
              height={format.width * 0.09}
            />
            <span
              style={{
                display: "flex",
                fontSize: contentWidth * 0.011,
                letterSpacing: contentWidth * 0.011 * 0.08,
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
