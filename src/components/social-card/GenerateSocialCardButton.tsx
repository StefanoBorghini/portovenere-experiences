"use client";

import { useState } from "react";
import { SocialCardData } from "@/types/socialCard";
import { trackSocialCardOpened } from "@/lib/analytics/gtag";
import SocialCardModal from "./SocialCardModal";

interface GenerateSocialCardButtonProps {
  data: SocialCardData;
  slug: string;
}

// Monta SocialCardModal (e quindi SocialExperienceCard, con la sua
// immagine offscreen a piena risoluzione) solo al click — evita di
// tenere in pagina un nodo pesante che nessuno guarda finche' non
// viene richiesto esplicitamente.
export default function GenerateSocialCardButton({
  data,
  slug,
}: GenerateSocialCardButtonProps) {
  const [open, setOpen] = useState(false);

  function handleOpen() {
    setOpen(true);
    trackSocialCardOpened(slug);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-4 rounded-xl uppercase tracking-[0.15em] text-xs hover:bg-white/5 transition-all"
      >
        Generate Social Card
      </button>

      {open && (
        <SocialCardModal
          data={data}
          slug={slug}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
