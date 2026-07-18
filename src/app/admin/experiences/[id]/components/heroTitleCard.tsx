"use client";

import { useState } from "react";
import { deleteExperienceHeroTitle } from "@/lib/supabase/experienceRepository";

interface HeroTitlesCardProps {
  experience: any;
  setExperience: (updater: (prev: any) => any) => void;
}

export default function HeroTitlesCard({
  experience,
  setExperience,
}: HeroTitlesCardProps) {

  const heroTitles = experience.hero_titles || [];

  // Stesso principio di togglingIds/duplicatingIds altrove — evita
  // doppi click sul delete mentre la richiesta e' in corso.
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  function updateField(id: string, field: "title" | "active", value: any) {

    setExperience((prev: any) => ({
      ...prev,
      hero_titles: (prev.hero_titles || []).map((heroTitle: any) =>
        heroTitle.id === id
          ? { ...heroTitle, [field]: value }
          : heroTitle
      ),
    }));
  }

  function addHeroTitle() {

    const newHeroTitle = {
      id: `new-hero-title-${Date.now()}`,
      experience_id: experience.id,
      title: "",
      display_order: heroTitles.length,
      active: true,
      isNew: true,
    };

    setExperience((prev: any) => ({
      ...prev,
      hero_titles: [...(prev.hero_titles || []), newHeroTitle],
    }));
  }

  async function removeHeroTitle(heroTitle: any) {

    // Mai salvato su Supabase — basta toglierlo dallo stato locale,
    // stesso principio usato per facts/sections non ancora salvati.
    if (heroTitle.isNew) {

      setExperience((prev: any) => ({
        ...prev,
        hero_titles: (prev.hero_titles || []).filter(
          (h: any) => h.id !== heroTitle.id
        ),
      }));

      return;
    }

    setDeletingIds((prev) => new Set(prev).add(heroTitle.id));

    const result = await deleteExperienceHeroTitle(heroTitle.id);

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(heroTitle.id);
      return next;
    });

    if (!result.success) {
      alert("Could not delete this hero title — please try again.");
      return;
    }

    setExperience((prev: any) => ({
      ...prev,
      hero_titles: (prev.hero_titles || []).filter(
        (h: any) => h.id !== heroTitle.id
      ),
    }));
  }

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "24px",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "#09090b",
      }}
    >

      <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>
        Hero Titles
      </h3>

      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "13px",
          marginBottom: "16px",
        }}
      >
        Titoli mostrati nell'hero della proposal quando questa esperienza
        e' la featured — ne viene scelto uno a caso ad ogni generazione.
        Se non ce n'e' nessuno attivo, si usa il titolo dell'esperienza.
      </p>

      {heroTitles.length === 0 && (
        <p
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          Nessun hero title ancora — verra' usato il titolo dell'esperienza.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        {heroTitles.map((heroTitle: any) => (

          <div
            key={heroTitle.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
            }}
          >

            <input
              value={heroTitle.title}
              onChange={(e) =>
                updateField(heroTitle.id, "title", e.target.value)
              }
              placeholder="e.g. A Private Riviera Escape"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "14px",
              }}
            />

            <button
              onClick={() =>
                updateField(heroTitle.id, "active", !heroTitle.active)
              }
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 500,
                border: heroTitle.active
                  ? "1px solid rgba(52,211,153,0.3)"
                  : "1px solid rgba(248,113,113,0.3)",
                background: heroTitle.active
                  ? "rgba(52,211,153,0.1)"
                  : "rgba(248,113,113,0.1)",
                color: heroTitle.active ? "#34d399" : "#f87171",
                cursor: "pointer",
              }}
            >
              {heroTitle.active ? "Active" : "Inactive"}
            </button>

            <button
              onClick={() => removeHeroTitle(heroTitle)}
              disabled={deletingIds.has(heroTitle.id)}
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "13px",
                background: "none",
                border: "none",
                cursor: "pointer",
                opacity: deletingIds.has(heroTitle.id) ? 0.5 : 1,
              }}
            >
              {deletingIds.has(heroTitle.id) ? "Removing..." : "Remove"}
            </button>

          </div>
        ))}

      </div>

      <button
        onClick={addHeroTitle}
        style={{
          marginTop: "16px",
          padding: "10px 18px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.8)",
          background: "transparent",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        + Add Hero Title
      </button>

    </div>
  );
}