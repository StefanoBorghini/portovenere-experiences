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
const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_PACK_URL ||
  "https://github.com/Sparticuz/chromium/releases/download/v129.0.0/chromium-v129.0.0-pack.tar";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {

  const { slug } = await params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://experiences.portovenere.com";

  let browser;

  try {

  browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 1024 });

    await page.goto(`${siteUrl}/results/proposal-staging/${slug}?pdf=1`, {
      waitUntil: "networkidle0",
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
await page.emulateMediaType("screen");
    // Piccola pausa per lasciare che le transizioni finiscano
    // prima di catturare il PDF.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pdfBuffer = await page.pdf({
      width: "1280px",
      height: `${bodyHeight}px`,
      printBackground: true,
    });

   await browser.close();

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