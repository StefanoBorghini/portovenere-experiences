// QR code fisso fornito dal cliente (punta al configuratore) — non
// generato dinamicamente. Un'unica costante, cosi' l'anteprima
// (SocialExperienceCard.tsx) e il render server-side
// (renderSocialCardSatori.tsx) puntano sempre allo stesso file.
export const SOCIAL_CARD_QR_CODE_IMAGE = "/images/social-card/qrcode.png";

// Il logo usato nel resto del sito (public/logo-white.png, 600x600) ha
// un ampio margine trasparente interno non simmetrico (contenuto
// visibile solo in (93,210)-(527,412)), che nella social card faceva
// apparire il segno "PV" spostato a destra rispetto al blocco di testo
// sottostante, allineato invece sullo stesso bordo del contenitore.
// Questa e' una versione ritagliata sul contenuto reale (434x202),
// dedicata solo alla social card, cosi' da non toccare l'asset usato
// altrove nel sito.
export const SOCIAL_CARD_LOGO_IMAGE = "/images/social-card/logo-white.png";
export const SOCIAL_CARD_LOGO_ASPECT_RATIO = 434 / 202;
