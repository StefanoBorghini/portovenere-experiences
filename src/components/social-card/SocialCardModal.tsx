"use client";

import { useEffect, useRef, useState } from "react";
import { SocialCardData, SocialCardFormatId, SOCIAL_CARD_CTA_PRESETS } from "@/types/socialCard";
import { SOCIAL_CARD_FORMATS, SOCIAL_CARD_FORMAT_ORDER } from "./socialCardFormats";
import SocialExperienceCard from "./SocialExperienceCard";

interface SocialCardModalProps {
  data: SocialCardData;
  slug: string;
  onClose: () => void;
}

// Aspetta che tutte le <img> del nodo abbiano davvero finito di
// caricare — senza questo, html2canvas puo' catturare un frame con
// l'immagine di sfondo ancora bianca/vuota (soprattutto la prima
// volta che il formato viene aperto).
async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
    )
  );
}

export default function SocialCardModal({ data, slug, onClose }: SocialCardModalProps) {

  const [activeFormat, setActiveFormat] = useState<SocialCardFormatId>("portrait");
  const [showPrice, setShowPrice] = useState(data.showPrice);
  const [cta, setCta] = useState<string>(data.cta);
  const [customCta, setCustomCta] = useState("");
  const [isCustomCta, setIsCustomCta] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.3);

  const formatConfig = SOCIAL_CARD_FORMATS[activeFormat];
  const effectiveCta = isCustomCta ? (customCta || SOCIAL_CARD_CTA_PRESETS[0]) : cta;

  // Ricalcola la scala dell'anteprima quando cambia formato o
  // dimensione del contenitore — la card e' SEMPRE renderizzata a
  // dimensione reale, solo visivamente rimpicciolita qui.
  useEffect(() => {
    function updateScale() {
      if (!previewWrapperRef.current) return;
      const availableWidth = previewWrapperRef.current.clientWidth;
      const availableHeight = window.innerHeight * 0.55;
      const scale = Math.min(
        availableWidth / formatConfig.width,
        availableHeight / formatConfig.height,
        1
      );
      setPreviewScale(scale);
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [formatConfig]);

  function handleFormatChange(id: SocialCardFormatId) {
    setActiveFormat(id);
  }

  async function handleDownload() {

    if (!captureRef.current) return;

    setDownloading(true);

    try {

      await waitForImages(captureRef.current);

      const html2canvas = (await import("html2canvas")).default;

      // scale: 1 esplicito — il nodo e' GIA' renderizzato alla
      // dimensione fisica esatta del formato (1080px reali nel DOM,
      // non un elemento piccolo scalato su per la stampa). Chiedere
      // ANCHE uno scale a html2canvas, sommato al devicePixelRatio
      // dello schermo (che html2canvas applica di default se non lo
      // forzi), produce una cattura doppia disallineata — il testo
      // "sdoppiato" visto in preview/export.
      const canvas = await html2canvas(captureRef.current, {
        scale: 1,
        useCORS: true,
        backgroundColor: "#000000",
        width: formatConfig.width,
        height: formatConfig.height,
      });

      if (formatConfig.exportAs === "pdf") {

        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
        pdf.save(`portovenere-experience-${slug}.pdf`);

      } else {

        const link = document.createElement("a");
        link.download = `portovenere-experience-${slug}-${activeFormat}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }

    } catch (err) {
      console.error("social card download failed:", err);
      alert("Could not generate the image — please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}${data.proposalUrl}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(url);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <h2 className="text-white text-lg font-light">Generate Social Card</h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6">

          {/* FORMAT TABS */}
          <div className="flex gap-2 mb-6">
            {SOCIAL_CARD_FORMAT_ORDER.map((id) => {
              const config = SOCIAL_CARD_FORMATS[id];
              return (
                <button
                  key={id}
                  onClick={() => handleFormatChange(id)}
                  className={`px-4 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] transition-all ${
                    activeFormat === id
                      ? "bg-white text-black"
                      : "bg-white/[0.06] text-white/60 hover:text-white"
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* PREVIEW — la card reale rimpicciolita solo visivamente */}
          <div
            ref={previewWrapperRef}
            className="flex items-center justify-center bg-black/40 rounded-2xl mb-6 overflow-hidden"
            style={{ height: formatConfig.height * previewScale + 32 }}
          >
            <div
              style={{
                width: formatConfig.width,
                height: formatConfig.height,
                transform: `scale(${previewScale})`,
              }}
            >
              <SocialExperienceCard
                ref={captureRef}
                data={data}
                format={formatConfig}
                showPrice={showPrice}
                cta={effectiveCta}
              />
            </div>
          </div>

          {/* CONTROLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">
                Price
              </label>
              <button
                onClick={() => setShowPrice((v) => !v)}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                  showPrice
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-white/[0.08] bg-white/[0.02] text-white/50"
                }`}
              >
                {showPrice ? `Showing: From €${Math.round(data.price || 0)}` : "Hidden — \"Private Experience\""}
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">
                Call to action
              </label>
              <select
                value={isCustomCta ? "custom" : cta}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setIsCustomCta(true);
                  } else {
                    setIsCustomCta(false);
                    setCta(e.target.value);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm outline-none"
              >
                {SOCIAL_CARD_CTA_PRESETS.map((preset) => (
                  <option key={preset} value={preset} className="bg-black">
                    {preset}
                  </option>
                ))}
                <option value="custom" className="bg-black">Custom…</option>
              </select>
              {isCustomCta && (
                <input
                  value={customCta}
                  onChange={(e) => setCustomCta(e.target.value)}
                  placeholder="YOUR CUSTOM CTA →"
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm outline-none"
                />
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 min-w-[160px] bg-white text-black px-6 py-4 rounded-xl uppercase tracking-[0.15em] text-xs font-medium hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {downloading ? "Generating…" : `Download ${formatConfig.exportAs.toUpperCase()}`}
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 min-w-[160px] border border-white/20 text-white px-6 py-4 rounded-xl uppercase tracking-[0.15em] text-xs hover:bg-white/5 transition-all"
            >
              {copied ? "Link copied ✓" : "Copy share link"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
