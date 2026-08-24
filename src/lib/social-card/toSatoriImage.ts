import decodeWebp, { init as initWebpDecode } from "@jsquash/webp/decode";
import encodePng, { init as initPngEncode } from "@jsquash/png/encode";
import fs from "fs/promises";
import path from "path";

// =========================================================
// Satori (il motore di rendering di next/og) non sa decodificare
// WebP — solo PNG/JPEG/SVG. La maggior parte delle foto del sito
// (galleria experience, hero) sono pero' .webp. Questa funzione
// converte al volo in PNG con @jsquash — WASM puro, NESSUN binario
// nativo — a differenza di sharp, che ha causato un 500 in
// produzione (sospetto: il binario nativo giusto per la piattaforma
// serverless di Vercel non arrivava correttamente nel bundle della
// funzione). Un file WASM e' lo stesso identico bit-per-bit ovunque
// giri Node, niente da compilare per piattaforma.
//
// @jsquash prova di default a caricare i propri .wasm via fetch()
// su un URL file:// costruito da import.meta.url — Node.js non
// supporta fetch() su file:// ("not implemented"). Li leggiamo noi
// da disco e li passiamo direttamente a init(), bypassando quel
// fetch interno del tutto.
// =========================================================

let codecsReady: Promise<void> | null = null;

function ensureCodecsInitialized(): Promise<void> {

  if (!codecsReady) {
    codecsReady = (async () => {

      const webpWasmPath = path.join(
        process.cwd(),
        "node_modules/@jsquash/webp/codec/dec/webp_dec.wasm"
      );

      const pngWasmPath = path.join(
        process.cwd(),
        "node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm"
      );

      const [webpWasmBytes, pngWasmBytes] = await Promise.all([
        fs.readFile(webpWasmPath),
        fs.readFile(pngWasmPath),
      ]);

      const webpWasmModule = await WebAssembly.compile(webpWasmBytes);

      await Promise.all([
        initWebpDecode(webpWasmModule),
        initPngEncode(pngWasmBytes),
      ]);
    })();
  }

  return codecsReady;
}

function isWebp(buffer: Buffer): boolean {
  return (
    buffer.length > 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
}

const cache = new Map<string, string>();

export async function toSatoriImageDataUri(url: string): Promise<string> {

  const cached = cache.get(url);
  if (cached) return cached;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not fetch image for social card export: ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  let dataUri: string;

  if (isWebp(buffer)) {

    await ensureCodecsInitialized();

    const imageData = await decodeWebp(toArrayBuffer(buffer));
    const pngArrayBuffer = await encodePng(imageData);

    dataUri = `data:image/png;base64,${Buffer.from(pngArrayBuffer).toString("base64")}`;

  } else {

    // Gia' PNG/JPEG — Satori le legge direttamente, nessuna
    // conversione necessaria.
    const contentType = response.headers.get("content-type") || "";
    const mime = contentType.startsWith("image/") ? contentType : "image/jpeg";

    dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
  }

  cache.set(url, dataUri);

  return dataUri;
}
