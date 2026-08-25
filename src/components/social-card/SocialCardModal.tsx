"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SocialCardData, SocialCardFormatId, SOCIAL_CARD_CTA_PRESETS } from "@/types/socialCard";
import { SOCIAL_CARD_FORMATS, SOCIAL_CARD_FORMAT_ORDER } from "./socialCardFormats";
import SocialExperienceCard from "./SocialExperienceCard";
import SocialExperienceStoryCard from "./SocialExperienceStoryCard";

interface SocialCardModalProps {
  data: SocialCardData;
  slug: string;
  leadId: string;
  leadEmail: string;
  onClose: () => void;
}

export default function SocialCardModal({ data, slug, leadId, leadEmail, onClose }: SocialCardModalProps) {

  const [activeFormat, setActiveFormat] = useState<SocialCardFormatId>("portrait");
  const [showPrice, setShowPrice] = useState(data.showPrice);
  const [cta, setCta] = useState<string>(data.cta);
  const [customCta, setCustomCta] = useState("");
  const [isCustomCta, setIsCustomCta] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Il file scaricato viene generato SEMPRE lato server
  // (/api/admin/leads/[id]/social-card/export, next/og) — mai
  // catturando il DOM nel browser. L'anteprima qui sotto resta un
  // componente React normale (SocialExperienceCard), mai toccato da
  // un motore di cattura: e' solo per farsi un'idea a schermo prima
  // di scaricare, il file vero e proprio e' generato da zero dal
  // server con gli stessi dati.
  async function handleDownload() {

    if (!supabase) {
      alert("Supabase not configured");
      return;
    }

    setDownloading(true);

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const params = new URLSearchParams({
        format: activeFormat,
        showPrice: showPrice ? "1" : "0",
        cta: effectiveCta,
      });

      const response = await fetch(
        `/api/admin/leads/${leadId}/social-card/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || ""}`,
          },
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `portovenere-experience-${slug}-${activeFormat}.png`;
      link.click();

      URL.revokeObjectURL(blobUrl);

    } catch (err) {
      console.error("social card download failed:", err);
      const message = err instanceof Error ? err.message : "Could not generate the file — please try again.";
      alert(message);
    } finally {
      setDownloading(false);
    }
  }

  // Genera lo stesso file di handleDownload (stessa pipeline
  // server-side) e lo allega a un'email inviata all'indirizzo del
  // lead — azione esplicita dell'admin, mai automatica.
  async function handleSendEmail() {

    if (!supabase) {
      alert("Supabase not configured");
      return;
    }

    if (!leadEmail) {
      alert("This lead has no email address on file.");
      return;
    }

    const confirmed = window.confirm(`Send this social card to ${leadEmail}?`);
    if (!confirmed) return;

    setSendingEmail(true);

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`/api/admin/leads/${leadId}/social-card/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          format: activeFormat,
          showPrice,
          cta: effectiveCta,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || `send failed with status ${response.status}`);
      }

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);

    } catch (err) {
      console.error("social card email send failed:", err);
      const message = err instanceof Error ? err.message : "Could not send the email — please try again.";
      alert(message);
    } finally {
      setSendingEmail(false);
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
              {activeFormat === "story" ? (
                <SocialExperienceStoryCard
                  data={data}
                  format={formatConfig}
                  showPrice={showPrice}
                  cta={effectiveCta}
                />
              ) : (
                <SocialExperienceCard
                  data={data}
                  format={formatConfig}
                  showPrice={showPrice}
                  cta={effectiveCta}
                />
              )}
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
              {downloading ? "Generating…" : "Download PNG"}
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail || !leadEmail}
              className="flex-1 min-w-[160px] border border-white/20 text-white px-6 py-4 rounded-xl uppercase tracking-[0.15em] text-xs hover:bg-white/5 transition-all disabled:opacity-50"
            >
              {sendingEmail ? "Sending…" : emailSent ? "Sent ✓" : "Send via Email"}
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
