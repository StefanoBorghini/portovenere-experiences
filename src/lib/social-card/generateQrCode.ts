import QRCode from "qrcode";

// =========================================================
// QR code per la Social Experience Card — porta al configuratore
// (data.ctaUrl), per chi vede la card stampata o su Instagram senza
// poter cliccare un link. qrcode e' puro JS (nessun binario nativo,
// nessuna dipendenza da canvas DOM in Node): stessa funzione usata
// sia nell'anteprima React (client) sia nel render Satori (server),
// nessuna doppia implementazione.
// =========================================================

export async function generateQrCodeDataUri(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    margin: 0,
    width: 240,
    color: {
      dark: "#000000ff",
      light: "#ffffffff",
    },
  });
}
