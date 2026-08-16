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
    image: "/images/dining/ristorante/wine.webp",
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
    image: "/images/castle.jpg",
    description: "Local traditions, history and authentic craftsmanship.",
  },
  {
    label: "Wellness Escape",
    dbValue: "wellness_escape",
    i18nKey: "wellnessEscape",
    // TODO: foto reale — placeholder provvisorio (riuso foto sailing)
    image: "/images/wellness.jpg",
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
    image: "/images/relax.png",
    icon: "☾",
  },
  {
    label: "Indulgent",
    i18nKey: "indulgent",
    scoreField: "indulgent_score",
    // TODO: foto reale — placeholder provvisorio (riuso foto romantic)
    image: "/images/indulgent.webp",
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

// =========================================================
// BUDGET TIERS — fonte unica per lo step "budget" del wizard, la
// scheda Filters in admin e il matching in generateProposal.ts.
//
// `key` e' il valore strutturato salvato su lead.budget/leads.budget
// (mai piu' la stringa "€500 - €1000" usata prima: quella resta solo
// come `range`, il testo mostrato nel wizard/nelle email — mai
// confrontata per uguaglianza da nessuna parte).
// `dbField` e' la colonna booleana opt-in su experience_filters
// (stessa convenzione delle 3 gia' esistenti, solo estesa a 4).
// `min`/`max` (in euro, max=Infinity per l'ultima fascia aperta)
// alimentano il bonus di scoring basato sul base_price reale
// dell'esperienza, non solo sul checkbox manuale — vedi
// generateProposal.ts.
// =========================================================

export interface BudgetTierDef {
  key: string;
  range: string;
  dbField: string;
  min: number;
  max: number;
}

export const BUDGET_TIERS: BudgetTierDef[] = [
  {
    key: "200_500",
    range: "€200 - €500",
    dbField: "budget_200_500",
    min: 200,
    max: 500,
  },
  {
    key: "500_1000",
    range: "€500 - €1000",
    dbField: "budget_500_1000",
    min: 500,
    max: 1000,
  },
  {
    key: "1000_3000",
    range: "€1000 - €3000",
    dbField: "budget_1000_3000",
    min: 1000,
    max: 3000,
  },
  {
    key: "3000_plus",
    range: "€3000+",
    dbField: "budget_3000_plus",
    min: 3000,
    max: Infinity,
  },
];

// Lookup key -> testo leggibile, per chi mostra lead.budget cosi'
// com'e' (admin leads, email interne) senza dover reimportare tutto
// BUDGET_TIERS. Fallback sul valore grezzo per lead vecchie salvate
// prima di questa modifica (che hanno gia' un testo leggibile,
// "€500 - €1000" ecc. — restano visualizzabili senza rotture).
export const BUDGET_TIER_LABELS: Record<string, string> = Object.fromEntries(
  BUDGET_TIERS.map((t) => [t.key, t.range])
);

export function formatBudgetLabel(value: string | null | undefined): string {
  if (!value) return "";
  return BUDGET_TIER_LABELS[value] || value;
}

// =========================================================
// ACCESSIBILITY NEEDS — fonte unica per lo step "guests" del wizard
// (raccolta lato cliente), la scheda Filters in admin (dichiarazione
// lato esperienza) e lo scoring in generateProposal.ts.
//
// `key` e' usato sia in lead.accessibility.needs (array di stringhe,
// stessa convenzione di lead.experiences/lead.moods) sia come suffisso
// per risalire al campo esperienza via `dbField`.
// `dbField` e' un booleano NULLABLE su experience_content (nessun
// default): null/undefined = "nessuna informazione dichiarata", non
// "non accessibile" — la differenza richiesta esplicitamente, che
// tiene lo scoring neutro finche' un admin non valorizza il campo.
// =========================================================

export interface AccessibilityNeedDef {
  key: string;
  i18nKey: string;
  dbField: string;
}

export const ACCESSIBILITY_NEEDS: AccessibilityNeedDef[] = [
  {
    key: "mobility_reduced",
    i18nKey: "mobilityReduced",
    dbField: "accessibility_mobility_reduced",
  },
  {
    key: "visual_impairment",
    i18nKey: "visualImpairment",
    dbField: "accessibility_visual_impairment",
  },
  {
    key: "hearing_impairment",
    i18nKey: "hearingImpairment",
    dbField: "accessibility_hearing_impairment",
  },
  {
    key: "cognitive_sensory",
    i18nKey: "cognitiveSensory",
    dbField: "accessibility_cognitive_sensory",
  },
  {
    key: "other",
    i18nKey: "other",
    dbField: "accessibility_other",
  },
];
