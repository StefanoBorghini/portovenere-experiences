"use client";

import Script from "next/script";

// =========================================================
// Stesso meccanismo di GoogleAnalytics.tsx/MicrosoftClarity.tsx:
// type="text/plain" + class="_iub_cs_activate" + data-iub-purposes="4"
// — Iubenda blocca l'esecuzione dello script finche' l'utente non
// acconsente alla finalita' "Misurazione", poi lo sblocca
// automaticamente. Nessun <noscript> di fallback: quell'iframe GTM
// standard non e' gestibile da Iubenda (e' HTML puro, senza JS da
// bloccare) e caricherebbe il container anche senza consenso —
// in contrasto con come questo sito tratta tutti gli altri tracker.
// Se serve comunque, va aggiunto a parte e discusso.
//
// GTM_CONTAINER_ID va nelle env vars come NEXT_PUBLIC_GTM_CONTAINER_ID
// (l'ID del container, es. "GTM-XXXXXXX", dalla dashboard Google Tag
// Manager).
// =========================================================

const GTM_CONTAINER_ID =
  process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;

export default function GoogleTagManager() {

  if (!GTM_CONTAINER_ID) return null;

  return (
    <Script
      type="text/plain"
      className="_iub_cs_activate"
      data-iub-purposes="4"
      id="google-tag-manager-init"
      strategy="afterInteractive"
    >
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
      `}
    </Script>
  );
}
