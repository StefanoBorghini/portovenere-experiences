/**
 * Le 4 macro categorie esperienza e i 4 mood sono un vocabolario fisso
 * e piccolo — condiviso tra il wizard (craft-your-experience) e il
 * riepilogo dinamico della proposal (buildProposalSummary), entrambi
 * i quali devono mostrare l'etichetta tradotta invece del valore
 * inglese salvato su formData/lead (che resta l'identificatore
 * interno, usato per il matching in generateProposal ecc.).
 */
export const EXPERIENCE_NAME_KEYS: Record<string, string> = {
  "Sea Escape": "seaEscape",
  "Aerial Escape": "aerialEscape",
  "Gourmet Escape": "gourmetEscape",
  "Wild Escape": "wildEscape",
};

export const MOOD_NAME_KEYS: Record<string, string> = {
  Romantic: "romantic",
  Cinematic: "cinematic",
  Authentic: "authentic",
  Adventure: "adventure",
};
