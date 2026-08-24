import sharp from "sharp";

// =========================================================
// Satori (il motore di rendering di next/og) non sa decodificare
// WebP — solo PNG/JPEG/SVG. La maggior parte delle foto del sito
// (galleria experience, hero) sono pero' .webp. Questa funzione
// scarica l'immagine, la ri-codifica in PNG con sharp e la incapsula
// come data URI — cosi' Satori la riceve gia' in un formato che sa
// leggere, indipendentemente dal formato originale.
//
// Cache in-memory per URL: la stessa foto puo' ricomparire su piu'
// highlight/proposal nella vita del processo server.
// =========================================================

const cache = new Map<string, string>();

export async function toSatoriImageDataUri(url: string): Promise<string> {

  const cached = cache.get(url);
  if (cached) return cached;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not fetch image for social card export: ${url}`);
  }

  const inputBuffer = Buffer.from(await response.arrayBuffer());
  const pngBuffer = await sharp(inputBuffer).png().toBuffer();
  const dataUri = `data:image/png;base64,${pngBuffer.toString("base64")}`;

  cache.set(url, dataUri);

  return dataUri;
}
