import { SocialCardFormatId } from "@/types/socialCard";

// =========================================================
// Dimensioni reali in pixel — usate sia dall'anteprima a schermo
// (SocialExperienceCard, scalata via CSS solo per il display) sia
// dal render server-side che genera il file scaricato
// (renderSocialCardSatori.tsx), cosi' sono garantite identiche.
//
// "safeTop"/"safeBottom" — margine di sicurezza dai bordi per non
// far finire testo sotto la UI di Instagram (icone, username, ecc.),
// piu' ampio per le Stories che per il feed.
// =========================================================

export interface SocialCardFormatConfig {
  id: SocialCardFormatId;
  label: string;
  width: number;
  height: number;
  safeTop: number;
  safeBottom: number;
}

export const SOCIAL_CARD_FORMATS: Record<SocialCardFormatId, SocialCardFormatConfig> = {
  portrait: {
    id: "portrait",
    label: "Instagram 1:1",
    width: 1800,
    height: 1800,
    // Margine di sicurezza scalato proporzionalmente rispetto al
    // vecchio 64/1080 (5.93% della larghezza) — stesso rapporto
    // visivo di prima, solo su una tela piu' grande.
    safeTop: 107,
    safeBottom: 107,
  },
  story: {
    id: "story",
    label: "Story / Reel 9:16",
    width: 1080,
    height: 1920,
    safeTop: 220,
    safeBottom: 260,
  },
};

export const SOCIAL_CARD_FORMAT_ORDER: SocialCardFormatId[] = ["portrait", "story"];
