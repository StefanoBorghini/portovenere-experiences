import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // src/lib/social-card/toSatoriImage.ts (conversione WebP -> PNG
  // per Satori) legge questi file .wasm da disco a runtime tramite
  // un percorso costruito dinamicamente (process.cwd() + path.join),
  // non un import statico — il tracer di Vercel potrebbe non
  // accorgersene e lasciarli fuori dal bundle della funzione
  // serverless (funzionerebbe in locale, dove i file sono gia' su
  // disco, ma darebbe 500 in produzione). Inclusione esplicita,
  // cosi' non dipende dal riuscire a essere "scoperti".
  outputFileTracingIncludes: {
    "/api/admin/leads/[id]/social-card/export": [
      "./node_modules/@jsquash/webp/codec/dec/webp_dec.wasm",
      "./node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm",
    ],
  },
};

export default withNextIntl(nextConfig);