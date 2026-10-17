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

  // Etichetta baked nell'immagine finale — di default la prima di
  // ctaPresets sotto, gia' tradotta; l'admin puo' cambiarla dal
  // modale (altro preset o testo libero, in qualsiasi lingua).
  cta: string;

  // Opzioni del dropdown CTA nel modale admin, gia' tradotte lato
  // server nello stesso locale di tutto il resto — vedi
  // SOCIAL_CARD_CTA_PRESET_IDS/buildSocialCardData.ts. Mai una
  // stringa fissa in inglese: il testo finisce dentro l'immagine
  // mostrata al lead, deve essere nella SUA lingua.
  ctaPresets: { id: SocialCardCtaPresetId; label: string }[];

  ctaUrl: string;

  proposalUrl: string;
}

export type SocialCardFormatId = "portrait" | "story";

// ID stabili (mai il testo stesso) per le 4 opzioni di CTA — il testo
// mostrato/baked arriva da t(`socialCard.cta.${id}`), vedi
// buildSocialCardData.ts e site_copy_socialcard_cta.sql.
export const SOCIAL_CARD_CTA_PRESET_IDS = [
  "buildYourOwn",
  "discoverExperience",
  "createEscape",
  "startExperience",
] as const;

export type SocialCardCtaPresetId = (typeof SOCIAL_CARD_CTA_PRESET_IDS)[number];
