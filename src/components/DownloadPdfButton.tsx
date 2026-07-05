"use client";

import { useState } from "react";

interface DownloadPdfButtonProps {
  slug: string;
}

export default function DownloadPdfButton({ slug }: DownloadPdfButtonProps) {

  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {

    setIsGenerating(true);

    try {

      const response = await fetch(`/api/generate-pdf/${slug}`);

      if (!response.ok) {
        alert("PDF generation failed — please try again.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `proposal-${slug}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF download failed:", err);
      alert("PDF generation failed — please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="border border-white/20 text-white px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:bg-white hover:text-black transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? "Generating..." : "Download PDF"}
    </button>
  );
}