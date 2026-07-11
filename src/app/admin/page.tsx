"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { getExperiences } from "@/lib/supabase/experienceRepository";
import { getEnhancements } from "@/lib/supabase/enhancementRepository";
import { getLeads } from "@/lib/supabase/leadRepository";

// =========================================================
// SECTION CARDS — stessa fonte unica di NAV_ITEMS in
// AdminSidebar.tsx concettualmente, ma qui serve anche la
// descrizione breve, quindi tenute separate per semplicita'.
// =========================================================

interface SectionCard {
  href: string;
  label: string;
  description: string;
  count: number | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [experiencesCount, setExperiencesCount] = useState(0);
  const [enhancementsCount, setEnhancementsCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  useEffect(() => {
    async function load() {
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/admin/login";
        return;
      }

      const [experiences, enhancements, leads] = await Promise.all([
        getExperiences(),
        getEnhancements(),
        getLeads(),
      ]);

      setExperiencesCount(experiences.length);
      setEnhancementsCount(enhancements.length);
      setLeadsCount(leads.length);
      setNewLeadsCount(
        leads.filter((lead: any) => (lead.status || "new") === "new").length
      );

      setLoading(false);
    }

    load();
  }, []);

  const cards: SectionCard[] = [
    {
      href: "/admin/experiences",
      label: "Experiences",
      description: "Manage experiences, galleries and proposal engine data.",
      count: experiencesCount,
    },
    {
      href: "/admin/enhancements",
      label: "Enhancements",
      description: "Manage optional add-ons shown on proposal pages.",
      count: enhancementsCount,
    },
    {
      href: "/admin/leads",
      label: "Leads",
      description: "Requests submitted through the configurator.",
      count: leadsCount,
    },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-8">Loading...</main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-3">
          Dashboard
        </h1>
        <p className="text-white/40 max-w-2xl">
          Everything running behind Portovenere Experiences, in one place.
        </p>
      </div>

      {/* HIGHLIGHT — se ci sono nuovi lead da lavorare, lo si vede
          subito senza dover entrare in Leads e filtrare a mano. */}
      {newLeadsCount > 0 && (
        <button
          onClick={() => router.push("/admin/leads")}
          className="w-full text-left mb-8 rounded-2xl border border-blue-400/20 bg-blue-400/[0.06] px-6 py-5 hover:bg-blue-400/[0.1] transition-all"
        >
          <span className="text-blue-400 font-medium">
            {newLeadsCount} new {newLeadsCount === 1 ? "lead" : "leads"}
          </span>
          <span className="text-white/50"> waiting to be reviewed →</span>
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-white/20 transition-all flex flex-col justify-between min-h-[160px]"
          >
            <div>
              <h2 className="text-xl font-medium mb-2">{card.label}</h2>
              <p className="text-white/40 text-sm">{card.description}</p>
            </div>

            <div className="flex items-end justify-between mt-6">
              <span className="text-3xl font-light">
                {card.count ?? "—"}
              </span>
              <span className="text-white/40 text-sm">→</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}