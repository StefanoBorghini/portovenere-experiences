"use client";

import Script from "next/script";
import { GA_MEASUREMENT_ID } from "../../lib/analytics/gtag";

// =========================================================
// Il consenso e il Consent Mode li gestisce interamente
// Iubenda (Cookie Solution + Autoblocking) — questo componente
// si limita a fornire gli script GA4 gia' "taggati" in modo che
// Iubenda sappia bloccarli finche' l'utente non accetta, e
// sbloccarli automaticamente dopo.
//
// type="text/plain" invece di "text/javascript": impedisce al
// browser di eseguire lo script finche' Iubenda non lo riattiva.
// class="_iub_cs_activate" + data-iub-purposes="4": dicono a
// Iubenda "questo script appartiene alla finalita' Misurazione,
// attivalo quando l'utente acconsente a quella categoria".
//
// Il numero "4" per "Misurazione" e' quello di default in
// Iubenda — verificalo nella tua configurazione Cookie Solution,
// se e' diverso aggiornalo qui.
// =========================================================

export default function GoogleAnalytics() {

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        type="text/plain"
        className="_iub_cs_activate"
        data-iub-purposes="4"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />

      <Script
        type="text/plain"
        className="_iub_cs_activate"
        data-iub-purposes="4"
        id="google-analytics-init"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}