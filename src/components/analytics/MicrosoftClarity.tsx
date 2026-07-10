"use client";

import Script from "next/script";

// =========================================================
// Stesso meccanismo di GoogleAnalytics.tsx: type="text/plain"
// + class="_iub_cs_activate" + data-iub-purposes="4" —
// Iubenda blocca l'esecuzione dello script finche' l'utente
// non acconsente alla finalita' "Misurazione", poi lo sblocca
// automaticamente.
//
// CLARITY_PROJECT_ID va nelle env vars come
// NEXT_PUBLIC_CLARITY_PROJECT_ID (id del progetto, visibile
// nella dashboard Clarity dopo aver creato il progetto).
// =========================================================

const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default function MicrosoftClarity() {

  if (!CLARITY_PROJECT_ID) return null;

  return (
    <Script
      type="text/plain"
      className="_iub_cs_activate"
      data-iub-purposes="4"
      id="microsoft-clarity-init"
      strategy="afterInteractive"
    >
      {`
        (function(c,l,a,r,i,t,y){
          c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
          t = l.createElement(r);
          t.async = 1;
          t.src = "https://www.clarity.ms/tag/" + i;
          y = l.getElementsByTagName(r)[0];
          y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}