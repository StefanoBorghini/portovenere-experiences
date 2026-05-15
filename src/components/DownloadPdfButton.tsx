"use client";

export default function DownloadPdfButton() {

  const handlePrint = () => {

    window.print();

  };

  return (
    <button
      onClick={handlePrint}
      className="border border-white/20 text-white px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:bg-white hover:text-black transition-all duration-500"
    >
      Download PDF
    </button>
  );
}