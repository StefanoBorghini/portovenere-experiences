import type { Metadata } from "next";
import { Suspense } from "react";
import StartClient from "./StartClient";

// =========================================================
// /start — micro-landing per il traffico social (Instagram
// bio in primis). Pagina hub di puro funnel: contenuto sottile,
// in parte duplicato rispetto alla home, senza valore SEO
// proprio — noindex, ma follow cosi' i link in uscita (home,
// configuratore) continuano a passare autorita'.
// =========================================================

export const metadata: Metadata = {
  title: "Portovenere Experiences — Start Here",
  description:
    "Curated places, experiences and local stories. Build your journey around the way you want to travel.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function StartPage() {
  // Suspense richiesto da Next per useSearchParams() dentro
  // StartClient (lettura UTM) — senza, il build fallisce provando
  // a prerenderizzare la pagina staticamente.
  return (
    <Suspense fallback={null}>
      <StartClient />
    </Suspense>
  );
}
