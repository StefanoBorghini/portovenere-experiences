"use client";

import { useState } from "react";

interface ShareButtonProps {
  slug: string;
}

export default function ShareButton({ slug }: ShareButtonProps) {

  const [copied, setCopied] = useState(false);

  async function handleShare() {

    const url = `${window.location.origin}/results/proposal/${slug}`;

    // Su mobile: apre il menu di condivisione nativo (WhatsApp, Messaggi,
    // Email, ecc.) — l'utente sceglie lui dove mandarlo.
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Your Riviera Experience Proposal",
          text: "Here's your curated private Riviera experience.",
          url,
        });
      } catch {
        // L'utente ha chiuso il pannello di condivisione: nessun errore da mostrare.
      }
      return;
    }

    // Su desktop (dove l'API di condivisione nativa spesso non esiste):
    // copiamo semplicemente il link negli appunti.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback estremo se anche gli appunti non sono disponibili.
      alert(url);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="bg-white text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-[1.02] transition-all duration-500"
    >
      {copied ? "Link copied!" : "Share Proposal"}
    </button>
  );
}