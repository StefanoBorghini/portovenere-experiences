"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DownloadPdfButton() {

  const downloadPdf = async () => {

    const input =
      document.getElementById("proposal-content");

    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
    });

    const imgData =
      canvas.toDataURL("image/png");

    const pdf = new jsPDF(
      "p",
      "mm",
      "a4"
    );

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfHeight =
      (canvas.height * pdfWidth) /
      canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    pdf.save("proposal.pdf");
  };

  return (
    <button
      onClick={downloadPdf}
      className="border border-white/20 text-white px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:bg-white hover:text-black transition-all duration-500"
    >
      Download PDF
    </button>
  );
}