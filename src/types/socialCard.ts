// =========================================================
// SOCIAL EXPERIENCE CARD — tipi
// =========================================================
// Dataset intermedio derivato dalla stessa proposal gia' generata da
// generateProposal()/buildRendererData() (vedi
// src/lib/social-card/buildSocialCardData.ts). Nessun dato nuovo:
// solo un reshaping editoriale sintetico di quello che esiste gia'.
// =========================================================

// Un'esperienza mostrata nella card — titolo + la SUA foto
// rappresentativa (non una foto generica pescata a caso), cosi' la
// striscia di miniature prova visivamente cosa contiene il pacchetto.
export interface SocialCardHighlight {
  title: string;
  image?: string;
}

export interface SocialCardData {

  title: string;

  destination: string;

  duration: string;

  travelers: string;

  dates?: string;

  mood?: string;

  // Tutte le esperienze realmente presenti in questa proposal (2, 3
  // o 4 a seconda del caso) — la featured sempre prima. Ognuna con
  // la propria foto, per la striscia di miniature sotto la lista.
  highlights: SocialCardHighlight[];

  // Frase editoriale breve (da dynamicIntroParagraph, gia' curato).
  description: string;

  // Candidati immagine in ordine di preferenza — il renderer usa il
  // primo, gli altri restano come fallback se il primo non carica.
  images: string[];

  price?: number;

  showPrice: boolean;

  // Etichette gia' tradotte lato server (stesso locale di
  // title/mood/highlights) — i renderer (React preview + satori) le
  // usano cosi' come sono, senza dover sapere nulla di i18n.
  fromLabel: string;

  privateExperienceLabel: string;

  cta: string;

  ctaUrl: string;

  proposalUrl: string;
}

export type SocialCardFormatId = "portrait" | "story";

export const SOCIAL_CARD_CTA_PRESETS = [
  "BUILD YOUR OWN EXPERIENCE →",
  "DISCOVER THIS EXPERIENCE →",
  "CREATE YOUR ITALIAN ESCAPE →",
  "START YOUR EXPERIENCE →",
] as const;
