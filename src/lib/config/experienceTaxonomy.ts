// =========================================================
// FONTE UNICA DI VERITA' — categorie e mood delle Experience.
//
// Prima di questo file esistevano liste hardcoded duplicate in almeno
// 6 punti (wizard pubblico, dropdown categoria admin, slider mood
// admin, scoring, compatibilita' narrativa, modulo operatori
// /submit-experience). Ogni consumer deve importare CATEGORIES/MOODS
// da qui — mai ridichiarare i valori altrove.
//
// CONVENZIONE DEGLI IDENTIFICATORI (invariata rispetto a prima —
// nessuna migrazione dati necessaria):
//   - `label` (Title Case inglese, es. "Wine Escape"/"Relax") e'
//     l'identificatore INTERNO usato in lead.experiences/lead.moods,
//     nel matching di generateProposal.ts e nel wizard — esattamente
//     come oggi per le 4+4 categorie/mood gia' esistenti.
//   - `dbValue` (snake_case, es. "wine_escape") e' il valore salvato
//     su experience_content.category — colonna text libera, nessun
//     CHECK/enum da aggiornare.
//   - `scoreField` (es. "relax_score") e' la colonna su
//     experience_scoring che porta il punteggio 1-10 di quel mood,
//     stessa convenzione delle 4 colonne gia' esistenti.
//   - `i18nKey` e' la chiave sotto configurator.experienceNames.*/
//     configurator.moodNames.* nel sistema site_copy (vedi
//     src/lib/translations/siteCopy.ts) — NON src/messages/en.json,
//     che e' solo il seed storico e non viene letto a runtime.
//
// CATEGORIE: Aerial Escape rimossa dal sistema pubblico (nessuna
// experience esistente con category="aerial_escape" viene toccata nel
// database — semplicemente non e' piu' selezionabile da nessuna parte,
// quindi non puo' piu' comparire ne' pesare nello scoring: vedi
// getVisibleCategoryValues() in experienceRepository.ts e
// matchesCategory in generateProposal.ts).
//
// MOOD: Romantic/Cinematic/Authentic/Adventure erano gia' gli unici 4
// mood live nel sistema (verificato: "Serene"/"Elevated" non esistono
// da nessuna parte nel codice) — qui si aggiungono solo Relax e
// Indulgent.
//
// IMMAGINI: Wine/Cultural/Wellness Escape e Relax/Indulgent non hanno
// ancora foto reali nel progetto — i path sotto sono placeholder
// temporanei (riuso di foto esistenti concettualmente vicine) da
// sostituire quando le foto vere saranno disponibili, cambiando solo
// il valore qui.
// =========================================================

export interface CategoryDef {
  label: string;
  dbValue: string;
  i18nKey: string;
  image: string;
  description: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    label: "Sea Escape",
    dbValue: "sea_escape",
    i18nKey: "seaEscape",
    image: "/images/sailing/dino/cinematic.webp",
    description: "Private sailing and sunset cruises along the Riviera coast.",
  },
  {
    label: "Gourmet Escape",
    dbValue: "gourmet_escape",
    i18nKey: "gourmetEscape",
    image: "/images/dining/ristorante/romantic.jpg",
    description: "Savor exceptional flavors in unique locations.",
  },
  {
    label: "Wine Escape",
    dbValue: "wine_escape",
    i18nKey: "wineEscape",
    // TODO: foto reale — placeholder provvisorio (riuso foto dining)
    image: "/images/dining/ristorante/romantic.jpg",
    description: "Discover exceptional wines with the people who make them.",
  },
  {
    label: "Wild Escape",
    dbValue: "wild_escape",
    i18nKey: "wildEscape",
    image: "/images/wild/underwater/mermaiding/cinematic.jpg",
    description: "Reconnect with nature and hidden places.",
  },
  {
    label: "Cultural Escape",
    dbValue: "cultural_escape",
    i18nKey: "culturalEscape",
    // TODO: foto reale — placeholder provvisorio (riuso foto wild)
    image: "/images/wild/underwater/mermaiding/cinematic.jpg",
    description: "Local traditions, history and authentic craftsmanship.",
  },
  {
    label: "Wellness Escape",
    dbValue: "wellness_escape",
    i18nKey: "wellnessEscape",
    // TODO: foto reale — placeholder provvisorio (riuso foto sailing)
    image: "/images/sailing/dino/cinematic.webp",
    description: "Slow down and take care of yourself, Riviera style.",
  },
];

export interface MoodDef {
  label: string;
  i18nKey: string;
  scoreField: string;
  image: string;
  icon: string;
}

export const MOODS: MoodDef[] = [
  {
    label: "Romantic",
    i18nKey: "romantic",
    scoreField: "romantic_score",
    image: "/images/romantic.jpg",
    icon: "♥",
  },
  {
    label: "Cinematic",
    i18nKey: "cinematic",
    scoreField: "cinematic_score",
    image: "/images/cinematic.jpg",
    icon: "🎬",
  },
  {
    label: "Authentic",
    i18nKey: "authentic",
    scoreField: "authentic_score",
    image: "/images/authentic.jpg",
    icon: "✦",
  },
  {
    label: "Adventure",
    i18nKey: "adventure",
    scoreField: "adventure_score",
    image: "/images/adventure.jpg",
    icon: "▲",
  },
  {
    label: "Relax",
    i18nKey: "relax",
    scoreField: "relax_score",
    // TODO: foto reale — placeholder provvisorio (riuso foto authentic)
    image: "/images/authentic.jpg",
    icon: "☾",
  },
  {
    label: "Indulgent",
    i18nKey: "indulgent",
    scoreField: "indulgent_score",
    // TODO: foto reale — placeholder provvisorio (riuso foto romantic)
    image: "/images/romantic.jpg",
    icon: "✧",
  },
];

// Lookup rapidi, usati da chi ha gia' solo la label (es.
// buildProposalSummary.ts) e deve risalire alla chiave i18n.
export const EXPERIENCE_NAME_KEYS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.label, c.i18nKey])
);

export const MOOD_NAME_KEYS: Record<string, string> = Object.fromEntries(
  MOODS.map((m) => [m.label, m.i18nKey])
);
