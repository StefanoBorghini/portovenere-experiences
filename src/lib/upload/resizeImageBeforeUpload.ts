// =========================================================
// resizeImageBeforeUpload.ts
//
// Ridimensiona e comprime un'immagine nel browser (Canvas API)
// PRIMA che venga caricata su Supabase Storage — riduce i byte
// effettivamente trasferiti, quindi velocizza l'upload e riduce
// lo spazio occupato sullo storage.
//
// Output sempre in formato WebP.
// =========================================================

interface ResizeOptions {

  // Larghezza massima in px — se l'immagine e' piu' stretta di
  // cosi', non viene allargata, solo eventualmente ricompressa.
  maxWidth?: number;

  // Altezza massima in px — stesso criterio della larghezza.
  maxHeight?: number;

  // Qualita' WebP, da 0 a 1.
  quality?: number;

}

// Preset di default: thumbnail/gallery — immagini mostrate
// piccole (card, gallery grid), possiamo comprimere forte.
const DEFAULT_OPTIONS: Required<ResizeOptions> = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.62,
};

// Preset per immagini mostrate a piena pagina (hero, detail,
// enhancement): dimensioni un po' piu' generose per non essere
// sgranate su schermi grandi, ma qualita' comunque compressa —
// il risparmio vero arriva dal fatto che PRIMA queste immagini
// non passavano da nessuna compressione.
export const HERO_RESIZE_OPTIONS: Required<ResizeOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.68,
};

export async function resizeImageBeforeUpload(
  file: File,
  options: ResizeOptions = {}
): Promise<File> {

  const {
    maxWidth,
    maxHeight,
    quality,
  } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Se non e' un'immagine, non c'e' nulla da ridimensionare —
  // ritorniamo il file cosi' com'e' (la validazione di tipo va
  // fatta comunque a monte, prima di chiamare questa funzione).
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const bitmap =
    await createImageBitmap(file);

  // =====================================================
  // CALCOLO NUOVE DIMENSIONI
  // Mantiene le proporzioni originali, riduce solo se
  // l'immagine supera i limiti massimi.
  // =====================================================

  let targetWidth = bitmap.width;
  let targetHeight = bitmap.height;

  const widthRatio =
    maxWidth / targetWidth;

  const heightRatio =
    maxHeight / targetHeight;

  const scale =
    Math.min(1, widthRatio, heightRatio);

  targetWidth =
    Math.round(targetWidth * scale);

  targetHeight =
    Math.round(targetHeight * scale);

  // =====================================================
  // DISEGNO SU CANVAS
  // =====================================================

  const canvas =
    document.createElement("canvas");

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(
    bitmap,
    0,
    0,
    targetWidth,
    targetHeight
  );

  bitmap.close();

  // =====================================================
  // EXPORT WEBP
  // =====================================================

  const blob = await new Promise<Blob | null>(
    (resolve) => {
      canvas.toBlob(
        resolve,
        "image/webp",
        quality
      );
    }
  );

  // Se la conversione fallisce per qualche motivo (browser
  // molto vecchio senza supporto WebP in canvas.toBlob),
  // torniamo al file originale invece di bloccare l'utente.
  if (!blob) {
    return file;
  }

  // Nome file coerente col nuovo formato — l'estensione
  // originale viene sostituita con .webp.
  const newFileName =
    file.name.replace(
      /\.[^.]+$/,
      ""
    ) + ".webp";

  return new File(
    [blob],
    newFileName,
    { type: "image/webp" }
  );

}