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
  exportAs: "png" | "pdf";
}

export const SOCIAL_CARD_FORMATS: Record<SocialCardFormatId, SocialCardFormatConfig> = {
  portrait: {
    id: "portrait",
    label: "Instagram 4:5",
    width: 1080,
    height: 1350,
    safeTop: 64,
    safeBottom: 64,
    exportAs: "png",
  },
  story: {
    id: "story",
    label: "Story / Reel 9:16",
    width: 1080,
    height: 1920,
    safeTop: 220,
    safeBottom: 260,
    exportAs: "png",
  },
  a4: {
    id: "a4",
    label: "A4 (PDF)",
    width: 1240,
    height: 1754,
    safeTop: 90,
    safeBottom: 90,
    exportAs: "pdf",
  },
};

export const SOCIAL_CARD_FORMAT_ORDER: SocialCardFormatId[] = ["portrait", "story", "a4"];
