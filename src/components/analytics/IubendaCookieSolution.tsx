"use client";

import Script from "next/script";

// =========================================================
// EMBED IUBENDA — Privacy Controls and Cookie Solution
// Formato "Unified embedding code": un unico script che carica
// sia la configurazione che il banner/autoblocking, non serve
// più separare due <script> come nelle versioni precedenti di
// Iubenda.
//
// Se in futuro rigeneri il codice dalla dashboard Iubenda (es.
// dopo aver cambiato le impostazioni del banner), sostituisci
// solo il valore di "src" qui sotto con il nuovo URL.
// =========================================================

export default function IubendaCookieSolution() {
  return (
    <script type="text/javascript" src="https://embeds.iubenda.com/widgets/2f0edb25-dae1-49ed-97d1-185474c12421.js"></script>
  );
}