"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

import {
  getEnhancements,
} from "@/lib/supabase/enhancementRepository";

import { getExperiences } from "@/lib/supabase/experienceRepository";

import EnhancementCard from "./components/EnhancementCard";
import EnhancementAvailabilityCard from "./components/EnhancementAvailabilityCard";
import IncompatibleExperiencesCard from "./components/IncompatibleExperiencesCard";
import SaveBar from "../../experiences/[id]/components/SaveBar";

import {
  updateEnhancement,
  deleteEnhancement,
  getEnhancementAvailabilitySeasons,
  createEnhancementAvailabilitySeason,
  updateEnhancementAvailabilitySeason,
  deleteEnhancementAvailabilitySeason,
  getEnhancementAvailabilityWeekdays,
  createEnhancementAvailabilityWeekday,
  deleteEnhancementAvailabilityWeekday,
  getEnhancementAvailabilityDates,
  createEnhancementAvailabilityDate,
  updateEnhancementAvailabilityDate,
  deleteEnhancementAvailabilityDate,
} from "@/lib/supabase/enhancementRepository";

export default function EnhancementEditor() {

  const params = useParams();
  const router = useRouter();

  const [enhancement,setEnhancement] =
    useState<any>(null);

  const [allExperiences, setAllExperiences] = useState<any[]>([]);

  // =========================================================
  // TRADUCI ORA — sincronizza subito la traduzione italiana per
  // QUESTO enhancement, senza aspettare che compaia per caso in una
  // nuova proposal generata (l'unico momento in cui altrimenti
  // verrebbe ritradotto). Stesso bottone/pattern gia' usato nella
  // scheda esperienza (Header.tsx), idempotente per hash.
  // =========================================================

  const [translateStatus, setTranslateStatus] =
    useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleTranslateNow() {

    if (!supabase || !enhancement) return;

    setTranslateStatus("loading");

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/admin/translate-enhancement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ enhancementId: enhancement.id }),
      });

      const data = await response.json();

      setTranslateStatus(data.success ? "done" : "error");

    } catch (err) {

      console.error("translate-enhancement failed:", err);
      setTranslateStatus("error");
    }

    setTimeout(() => setTranslateStatus("idle"), 3000);
  }

  useEffect(()=>{

    async function load(){

      const data =
        await getEnhancements();

      const found =
        data.find(
          e => e.id == params.id
        );

      setEnhancement(found);

      const experiences = await getExperiences();
      setAllExperiences(experiences);

    }

    load();

  },[params.id]);

  if(!enhancement){

    return (
      <div
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
        "
      >
        Loading...
      </div>
    );

  }

  return(

    <main
      className="
        min-h-screen
        bg-black
        text-white
        px-10
        py-12
      "
    >

      <div
        className="
          max-w-5xl
          mx-auto
        "
      >

        <div
          className="
            flex
            justify-end
            mb-6
          "
        >

          <button

            onClick={handleTranslateNow}

            disabled={translateStatus === "loading"}

            className="
              px-5
              py-3
              rounded-xl
              border
              border-white/10
              hover:bg-white/5
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >

            {translateStatus === "loading"
              ? "Translating…"
              : translateStatus === "done"
              ? "Translated ✓"
              : translateStatus === "error"
              ? "Failed — retry"
              : "Translate now"}

          </button>

        </div>

        <EnhancementCard

          enhancement={enhancement}

          setEnhancement={
            setEnhancement
          }

        />

        <EnhancementAvailabilityCard

          enhancement={enhancement}

          setEnhancement={
            setEnhancement
          }

        />

        <IncompatibleExperiencesCard

          enhancement={enhancement}

          setEnhancement={
            setEnhancement
          }

          experiences={allExperiences}

        />

       <SaveBar

  onSave={async () => {

    // =====================================================
    // AVAILABILITY — stesso pattern a 3 vie (create/update/delete)
    // gia' usato nell'editor esperienza
    // (src/app/admin/experiences/[id]/page.tsx). Weekday rules non
    // hanno update: ogni cambio ricrea la lista da zero in
    // EnhancementAvailabilityCard, quindi qui basta create+delete.
    // =====================================================

    const existingAvailabilitySeasonsInDb = await getEnhancementAvailabilitySeasons();

    const existingAvailabilitySeasonIdsForThisEnhancement = existingAvailabilitySeasonsInDb
      .filter((rule: any) => rule.enhancement_id === enhancement.id)
      .map((rule: any) => rule.id);

    const currentAvailabilitySeasonIds = (enhancement.availability_seasons || []).map(
      (rule: any) => rule.id
    );

    for (const existingId of existingAvailabilitySeasonIdsForThisEnhancement) {
      if (!currentAvailabilitySeasonIds.includes(existingId)) {
        await deleteEnhancementAvailabilitySeason(existingId);
      }
    }

    for (const rule of enhancement.availability_seasons || []) {

      if (rule.isNew) {

        await createEnhancementAvailabilitySeason({
          id: rule.id,
          enhancement_id: enhancement.id,
          status: rule.status,
          start_month: rule.start_month,
          start_day: rule.start_day,
          end_month: rule.end_month,
          end_day: rule.end_day,
          display_order: rule.display_order,
        });

      } else {

        await updateEnhancementAvailabilitySeason(rule.id, {
          status: rule.status,
          start_month: rule.start_month,
          start_day: rule.start_day,
          end_month: rule.end_month,
          end_day: rule.end_day,
          display_order: rule.display_order,
        });

      }
    }

    const existingAvailabilityWeekdaysInDb = await getEnhancementAvailabilityWeekdays();

    const existingAvailabilityWeekdayIdsForThisEnhancement = existingAvailabilityWeekdaysInDb
      .filter((rule: any) => rule.enhancement_id === enhancement.id)
      .map((rule: any) => rule.id);

    const currentAvailabilityWeekdayIds = (enhancement.availability_weekdays || []).map(
      (rule: any) => rule.id
    );

    for (const existingId of existingAvailabilityWeekdayIdsForThisEnhancement) {
      if (!currentAvailabilityWeekdayIds.includes(existingId)) {
        await deleteEnhancementAvailabilityWeekday(existingId);
      }
    }

    for (const rule of enhancement.availability_weekdays || []) {
      if (rule.isNew) {
        await createEnhancementAvailabilityWeekday({
          id: rule.id,
          enhancement_id: enhancement.id,
          status: rule.status,
          weekday: rule.weekday,
        });
      }
    }

    const existingAvailabilityDatesInDb = await getEnhancementAvailabilityDates();

    const existingAvailabilityDateIdsForThisEnhancement = existingAvailabilityDatesInDb
      .filter((rule: any) => rule.enhancement_id === enhancement.id)
      .map((rule: any) => rule.id);

    const currentAvailabilityDateIds = (enhancement.availability_dates || []).map(
      (rule: any) => rule.id
    );

    for (const existingId of existingAvailabilityDateIdsForThisEnhancement) {
      if (!currentAvailabilityDateIds.includes(existingId)) {
        await deleteEnhancementAvailabilityDate(existingId);
      }
    }

    for (const rule of enhancement.availability_dates || []) {

      if (rule.isNew) {

        await createEnhancementAvailabilityDate({
          id: rule.id,
          enhancement_id: enhancement.id,
          date: rule.date,
          status: rule.status,
          source: rule.source,
          note: rule.note,
        });

      } else {

        await updateEnhancementAvailabilityDate(rule.id, {
          date: rule.date,
          status: rule.status,
          source: rule.source,
          note: rule.note,
        });

      }
    }

    const result =
      await updateEnhancement(

        enhancement.id,

        {

          title: enhancement.title,

    description: enhancement.description,

    image: enhancement.image,

    base_price: enhancement.base_price,

    price_type: enhancement.price_type,

    operator_id: enhancement.operator_id,

    requires_specific_date: enhancement.requires_specific_date,

    display_order: enhancement.display_order,

    active: enhancement.active,

    selected_button_text: enhancement.selected_button_text,

    unselected_button_text: enhancement.unselected_button_text,

    incompatible_experiences: enhancement.incompatible_experiences,

        }

      );

    if(result.success){

      alert("Enhancement saved!");

    }

  }}

  onDelete={async()=>{

    const ok = confirm(
      "Delete this enhancement?"
    );

    if(!ok) return;

    const result =
      await deleteEnhancement(
        enhancement.id
      );

    if(result.success){

      router.push(
        "/admin/enhancements"
      );

    }

  }}

/>

      </div>

    </main>

  );

}