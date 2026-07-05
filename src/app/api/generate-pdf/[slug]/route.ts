import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

// Serve il runtime Node (non Edge) perche' Puppeteer/Chromium
// non funzionano nell'Edge runtime.
export const runtime = "nodejs";

// Sul piano Hobby di Vercel questo valore viene comunque limitato
// a 10s dalla piattaforma, indipendentemente da quello che scriviamo
// qui — impostarlo piu' alto non costa nulla e prepara il terreno
// se in futuro passi a Pro (60s+).
export const maxDuration = 60;

// URL del pacchetto Chromium compresso, da un CDN esterno (gratis,
// niente upgrade di piano). Deve corrispondere alla versione di
// @sparticuz/chromium-min installata: controlla la pagina release
// https://github.com/Sparticuz/chromium/releases e aggiorna sia
// package.json che questa variabile d'ambiente in modo coerente.
// Se hai caricato il file su Vercel Blob, questo valore viene letto
// dalla variabile d'ambiente CHROMIUM_PACK_URL e questo fallback
// GitHub non viene nemmeno usato.
const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_PACK_URL ||
  "https://github.com/Sparticuz/chromium/releases/download/v129.0.0/chromium-v129.0.0-pack.tar";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {

  const { slug } = await params;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

  let browser;

  try {

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 1024 });

    // IMPORTANTE: Puppeteer usa di default la modalita' "print" per
    // page.pdf(). Se nel progetto esiste ancora del CSS @media print
    // pensato per il vecchio window.print() (es. "nascondi tutto tranne
    // un'area specifica"), quella modalita' rischia di nascondere il
    // contenuto reale e produrre un PDF bianco. Qui forziamo la modalita'
    // "screen": catturiamo la pagina esattamente come la vedi nel browser.
    await page.emulateMediaType("screen");

    await page.goto(`${siteUrl}/results/proposal-staging/${slug}?pdf=1`, {
      // "load" aspetta che la pagina e le sue risorse iniziali (incluse
      // le immagini) siano caricate — a differenza di "networkidle0",
      // non aspetta che si fermi QUALSIASI traffico di rete di sottofondo
      // (analytics, font esterni, countdown, ecc.), che e' la causa
      // principale della lentezza.
      waitUntil: "load",
      timeout: 45000,
    });

    // Misuriamo l'altezza reale della pagina...
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    // ...poi ridimensioniamo il viewport a tutta l'altezza: cosi'
    // gli elementi con animazione "whileInView" (framer-motion)
    // risultano tutti dentro il viewport e le loro animazioni
    // scattano, invece di restare bloccate nello stato iniziale
    // perche' "non ancora scrollate in vista".
    await page.setViewport({ width: 1280, height: bodyHeight });

    // Alcuni componenti (probabilmente quelli con next/image, es. la
    // Featured Experience e le card di Included Experiences) usano il
    // lazy loading nativo del browser (loading="lazy"). In modalita'
    // headless quel trigger a volte non scatta in tempo. Qui forziamo
    // tutte le immagini lazy a diventare "eager": partono a caricare
    // immediatamente, invece di aspettare un evento che potrebbe non
    // arrivare mai in questo contesto.
    await page.evaluate(() => {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        (img as HTMLImageElement).loading = "eager";
      });
    });

    // Attesa MIRATA sul vero caricamento delle immagini (risolve i
    // blocchi neri): invece di indovinare un tempo fisso, controlliamo
    // ogni <img> nella pagina e aspettiamo solo quelle non ancora
    // completate, con un tetto massimo di 8s per non bloccare all'infinito
    // se una singola immagine e' lenta o irraggiungibile.
    await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("img"));

      return Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();

          return new Promise((resolve) => {
            const timer = setTimeout(resolve, 8000);
            img.addEventListener("load", () => {
              clearTimeout(timer);
              resolve(undefined);
            });
            img.addEventListener("error", () => {
              clearTimeout(timer);
              resolve(undefined);
            });
          });
        })
      );
    });

    // Piccola pausa residua per lasciare che le transizioni CSS/framer-motion
    // finiscano visivamente dopo che le immagini sono pronte.
    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdfBuffer = await page.pdf({
      width: "1280px",
      height: `${bodyHeight}px`,
      printBackground: true,
    });

    await browser.close();

    // Conversione a ArrayBuffer puro: NextResponse non accetta
    // direttamente il tipo Buffer di Node in modo tipizzato.
    // .slice() estrae solo i byte reali del PDF (Node a volte alloca
    // un ArrayBuffer sottostante piu' grande del necessario).
    const pdfArrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    );

    return new NextResponse(pdfArrayBuffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proposal-${slug}.pdf"`,
      },
    });

  } catch (err) {

    console.error("generate-pdf error:", err);

    if (browser) {
      await browser.close();
    }

    return NextResponse.json(
      { success: false, error: "PDF generation failed" },
      { status: 500 }
    );
  }
}