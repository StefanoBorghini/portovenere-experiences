"use client";

import Script from "next/script";

// =========================================================
// EMBED IUBENDA COOKIE SOLUTION — DA COMPLETARE
//
// Incolla qui sotto lo script che Iubenda ti da' nella sezione
// "Privacy Controls and Cookie Solution" → Embed. Di solito ha
// questa forma:
//
//   var _iub = _iub || [];
//   _iub.csConfiguration = {
//     "lang": "en",
//     "siteId": XXXXXX,
//     "cookiePolicyId": YYYYYY,
//     "banner": { ... }
//   };
//
// seguito da un secondo <script> che carica il loader vero e
// proprio da cdn.iubenda.com. Vanno inseriti entrambi qui dentro,
// in questo ordine (configurazione prima, loader dopo).
// =========================================================

export default function IubendaCookieSolution() {
  return (
    <>
      {/* PASSO 1 — Incolla qui lo script _iub.csConfiguration */}
      <Script id="iubenda-cs-configuration" strategy="afterInteractive">
        {`
          // var _iub = _iub || [];
          // _iub.csConfiguration = { ... };
        `}
      </Script>

      {/* PASSO 2 — Incolla qui il loader (di solito un src verso cdn.iubenda.com) */}
      <Script
        id="iubenda-cs-loader"
        src="" // <-- incolla qui l'URL del loader Iubenda
        strategy="afterInteractive"
      />
    </>
  );
}