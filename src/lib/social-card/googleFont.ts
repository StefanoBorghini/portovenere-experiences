// =========================================================
// Carica un peso di Inter da Google Fonts come ArrayBuffer, per
// passarlo a next/og (Satori) — Satori non accetta URL @font-face,
// solo dati binari del font. Il trucco (pattern documentato da
// Vercel): fetch() senza un User-Agent "da browser moderno" fa si'
// che l'API css2 di Google Fonts risponda con TrueType/OpenType
// invece che WOFF2, che Satori sa interpretare.
//
// Cache in-memory a livello di modulo: il font non cambia tra una
// richiesta e l'altra, e l'istanza del server resta viva tra le
// richieste finche' non viene ridistribuita.
// =========================================================

const fontCache = new Map<string, ArrayBuffer>();

export async function loadGoogleFont(
  family: string,
  weight: number
): Promise<ArrayBuffer> {

  const cacheKey = `${family}-${weight}`;
  const cached = fontCache.get(cacheKey);
  if (cached) return cached;

  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@${weight}&display=swap`;

  const css = await (await fetch(cssUrl)).text();

  const match = css.match(
    /src: url\(([^)]+)\) format\('(opentype|truetype)'\)/
  );

  if (!match) {
    throw new Error(`Could not find a TTF/OTF resource for ${family} ${weight}`);
  }

  const response = await fetch(match[1]);

  if (!response.ok) {
    throw new Error(`Could not download font file for ${family} ${weight}`);
  }

  const data = await response.arrayBuffer();

  fontCache.set(cacheKey, data);

  return data;
}
