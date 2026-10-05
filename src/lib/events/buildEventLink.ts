// =========================================================
// buildEventLink — se il link di un evento e' un numero/link
// WhatsApp (wa.me, api.whatsapp.com, web.whatsapp.com) senza un
// messaggio gia' preimpostato, aggiunge un testo di default che
// include il titolo dell'evento e menziona esplicitamente
// portovenere.com, cosi' l'operatore che riceve il messaggio capisce
// subito da dove arriva — senza che l'admin debba costruire a mano
// l'URL con ?text=... codificato ogni volta.
//
// Se l'admin ha gia' messo un suo ?text=..., lo rispettiamo cosi'
// com'e'. Se il link non e' affatto un URL valido o non e' WhatsApp,
// torna invariato.
// =========================================================

export function buildEventLink(link: string, eventTitle: string): string {

  let url: URL;

  try {
    url = new URL(link);
  } catch {
    return link;
  }

  const isWhatsApp =
    url.hostname === "wa.me" ||
    url.hostname === "api.whatsapp.com" ||
    url.hostname === "web.whatsapp.com";

  if (!isWhatsApp) return link;

  if (url.searchParams.has("text")) return link;

  const message = `Hi! I'm interested in "${eventTitle}" — I saw it on portovenere.com`;

  url.searchParams.set("text", message);

  return url.toString();
}
