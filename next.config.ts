import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // sharp (usato in src/lib/social-card/toSatoriImage.ts per convertire
  // le foto WebP in PNG per Satori) usa binari nativi specifici della
  // piattaforma — senza questa riga il bundler serverless di Vercel puo'
  // provare a impacchettarlo come JS puro e romperlo a runtime (500 in
  // produzione, funziona invece in locale dove i binari sono gia'
  // installati per la piattaforma corrente).
  serverExternalPackages: ["sharp"],
};

export default withNextIntl(nextConfig);