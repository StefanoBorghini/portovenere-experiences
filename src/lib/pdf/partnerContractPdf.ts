import { jsPDF } from "jspdf";
import { PARTNER_CONTRACT_TITLE, PARTNER_CONTRACT_CLAUSES } from "./partnerContractTerms";

// =========================================================
// Genera il PDF del contratto compilato con i dati reali della
// candidatura — jsPDF gira anche lato server (nessun DOM/canvas
// richiesto per testo/tabelle), quindi questo modulo e' import-
// abile sia da una API route Next.js sia, in futuro, da uno script.
//
// Il testo delle clausole vive in partnerContractTerms.ts — questo
// file si occupa solo di impaginazione, non del contenuto legale.
// =========================================================

export interface PartnerContractData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  category: string;
  vatNumber?: string;
  planLabel: string;
  planPrice?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Portovenere Experience — pagina ${i} di ${pageCount}`,
      MARGIN,
      PAGE_HEIGHT - 10
    );
  }
}

export function generatePartnerContractPdf(data: PartnerContractData): Buffer {

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  // ---- Titolo ----
  doc.setFontSize(16);
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.text(PARTNER_CONTRACT_TITLE, MARGIN, y);
  y += 12;

  // ---- Dati attivita' / abbonamento, come tabella semplice ----
  const rows: [string, string][] = [
    ["Ragione sociale", data.companyName],
    ["Referente", data.contactName],
    ["Email", data.email],
    ["Telefono", data.phone || "—"],
    ["Partita IVA / C.F.", data.vatNumber || "—"],
    ["Categoria", data.category],
    ["Piano", data.planLabel],
    ["Corrispettivo", data.planPrice || "—"],
    ["Inizio abbonamento", data.subscriptionStart || "—"],
    ["Fine abbonamento", data.subscriptionEnd || "—"],
  ];

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), MARGIN + 55, y);
    y += 7;
  });

  y += 6;
  doc.setDrawColor(200);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;

  // ---- Clausole — testo lungo, con a-capo automatico e nuove
  // pagine quando serve (splitTextToSize + controllo manuale di y) ----
  doc.setFontSize(11);

  PARTNER_CONTRACT_CLAUSES.forEach((clause) => {

    const lines = doc.splitTextToSize(clause, CONTENT_WIDTH);
    const blockHeight = lines.length * 6 + 6;

    if (y + blockHeight > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }

    doc.setFont("helvetica", "normal");
    doc.text(lines, MARGIN, y);
    y += blockHeight;
  });

  // ---- Accettazione ----
  if (y + 20 > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    y = MARGIN;
  }

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    doc.splitTextToSize(
      "Il presente contratto si considera accettato dall'attivita' partner al momento del pagamento dell'abbonamento indicato sopra.",
      CONTENT_WIDTH
    ),
    MARGIN,
    y
  );

  addFooter(doc);

  return Buffer.from(doc.output("arraybuffer"));
}
