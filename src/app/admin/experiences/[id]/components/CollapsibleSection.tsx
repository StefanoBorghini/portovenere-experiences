"use client";

import { useState } from "react";

interface CollapsibleSectionProps {

  title: string;

  // Aperta di default al primo caricamento della pagina. Lo stato
  // vive solo qui (dentro il toggle), non nell'oggetto experience —
  // aprire/chiudere una sezione non tocca i dati e non serve
  // salvarlo da nessuna parte.
  defaultOpen?: boolean;

  children: React.ReactNode;
}

// =========================================================
// COLLAPSIBLE SECTION
// Wrapper generico usato in page.tsx per rendere ogni card
// dell'editor esperienza apri/chiudi come un accordion, SENZA
// dover toccare il contenuto interno di ogni singola card (che
// resta identico, col suo titolo e stile di sempre). Quando la
// sezione è chiusa, mostra solo questa barra sottile col titolo;
// quando è aperta, sotto compare la card intera così com'è.
// =========================================================

export default function CollapsibleSection({

  title,

  defaultOpen = false,

  children,

}: CollapsibleSectionProps) {

  const [open, setOpen] = useState(defaultOpen);

  return (

    <div className="mt-8">

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          w-full
          flex
          items-center
          justify-between
          rounded-2xl
          border
          border-white/10
          bg-white/5
          px-6
          py-4
          text-left
          hover:border-white/20
          transition-colors
        "
      >

        <span
          className="
            text-sm
            uppercase
            tracking-[0.2em]
            text-white/50
          "
        >
          {title}
        </span>

        <span
          className="
            text-white/50
            text-xl
            leading-none
            select-none
          "
        >
          {open ? "−" : "+"}
        </span>

      </button>

      {open && (
        <div>
          {children}
        </div>
      )}

    </div>
  );
}