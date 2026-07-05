"use client";

import Turnstile from "react-turnstile";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

import { supabase } from "@/lib/supabase";

// =========================================================
// STEP DEFINITIONS
// =========================================================

const STEP_IDS = [
  "experiences",
  "moods",
  "guests",
  "children",
  "dates",
  "budget",
  "contact",
  "terms",
] as const;

type StepId = typeof STEP_IDS[number];

const STEP_LABELS: Record<StepId, { label: string; title: string }> = {
  experiences: {
    label: "Select up to 3 Experiences",
    title: "What kind of experience are you dreaming of?",
  },
  moods: {
    label: "Select up to 3 Atmospheres",
    title: "Choose the vibe that inspires you.",
  },
  guests: {
    label: "Number of Guests",
    title: "How many people will join you?",
  },
  children: {
    label: "Children (0–12) years",
    title: "Will children be part of the experience?",
  },
  dates: {
    label: "Travel Dates",
    title: "When are you planning to travel?",
  },
  budget: {
    label: "Estimated Investment",
    title: "What is your preferred budget range?",
  },
  contact: {
    label: "Your Details",
    title: "How can we reach you?",
  },
  terms: {
    label: "Confirmation",
    title: "One last step before we craft your proposal.",
  },
};

// =========================================================
// SLIDE ANIMATION VARIANTS
// =========================================================

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const TERMS_URL = "https://www.portovenere.com/terms-conditions/";

// currentStep === INTRO_STEP significa "schermata di benvenuto",
// non fa parte del conteggio degli step del wizard.
const INTRO_STEP = -1;

// =========================================================
// IMMAGINI E TESTI — hardcoded per ora, come richiesto.
// Quando arriverà il CMS, questi tre oggetti diventeranno
// la fonte dinamica (stessa struttura, dati da Supabase invece
// che da qui) — il resto del codice non cambia.
//
// IMPORTANTE: questi sono path placeholder. Vanno sostituiti
// con le immagini reali, salvate in:
//   /public/images/experiences/sea-escape.jpg
//   /public/images/experiences/aerial-escape.jpg
//   /public/images/experiences/gourmet-escape.jpg
//   /public/images/experiences/wild-escape.jpg
//   /public/images/moods/romantic.jpg
//   /public/images/moods/cinematic.jpg
//   /public/images/moods/authentic.jpg
//   /public/images/moods/adventure.jpg
//   /public/images/budget/sailing.jpg
//   /public/images/budget/yacht.jpg
//   /public/images/budget/villa.jpg
// =========================================================

const EXPERIENCE_DETAILS: Record<string, { image: string; description: string }> = {
  "Sea Escape": {
    image: "/images/experiences/sea-escape.jpg",
    description: "Private sailing and sunset cruises along the Riviera coast.",
  },
  "Aerial Escape": {
    image: "/images/experiences/aerial-escape.jpg",
    description: "See the coast from above with unforgettable views.",
  },
  "Gourmet Escape": {
    image: "/images/experiences/gourmet-escape.jpg",
    description: "Savor exceptional flavors in unique locations.",
  },
  "Wild Escape": {
    image: "/images/experiences/wild-escape.jpg",
    description: "Reconnect with nature and hidden places.",
  },
};

const MOOD_IMAGES: Record<string, string> = {
  Romantic: "/images/moods/romantic.jpg",
  Cinematic: "/images/moods/cinematic.jpg",
  Authentic: "/images/moods/authentic.jpg",
  Adventure: "/images/moods/adventure.jpg",
};

// =========================================================
// ICONE — SVG minimali scritte a mano, per non introdurre
// una nuova dipendenza (es. lucide-react) senza saperla già
// installata nel progetto.
// =========================================================

function MoodIcon({ id }: { id: string }) {

  const common = "w-5 h-5 stroke-white fill-none";

  switch (id) {

    case "Romantic":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth={1.5}>
          <path
            d="M12 20s-7-4.5-9.3-9A5 5 0 0112 6a5 5 0 019.3 5c-2.3 4.5-9.3 9-9.3 9z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "Cinematic":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth={1.5}>
          <rect x="3" y="7" width="18" height="13" rx="1.5" />
          <path
            d="M3 7l3-4h4l-3 4M11 7l3-4h4l-3 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "Authentic":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth={1.5}>
          <path
            d="M4 10l8-6 8 6M5 10v9M9 10v9M15 10v9M19 10v9M3 21h18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "Adventure":
      return (
        <svg viewBox="0 0 24 24" className={common} strokeWidth={1.5}>
          <path
            d="M3 19l6-10 4 6 2-3 6 7H3z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    default:
      return null;
  }
}

export default function CraftYourExperience() {

  const router = useRouter();

  // =======================================================
  // WIZARD NAVIGATION STATE
  // =======================================================

  const [currentStep, setCurrentStep] = useState<number>(INTRO_STEP);
  const [direction, setDirection] = useState(0);
  const [selectionWarning, setSelectionWarning] = useState("");

  const totalSteps = STEP_IDS.length;
  const isIntro = currentStep === INTRO_STEP;
  const stepId = !isIntro ? STEP_IDS[currentStep] : null;

  // =======================================================
  // FORM STATE
  // =======================================================

  const [captchaToken, setCaptchaToken] = useState("");

  const [guestCount, setGuestCount] = useState<number | null>(null);
  const [showMoreGuests, setShowMoreGuests] = useState(false);

  const [childrenCount, setChildrenCount] = useState<number | null>(0);
  const [showMoreChildren, setShowMoreChildren] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",

    experiences: [] as string[],
    moods: [] as string[],

    guests: "",
    budget: "",
    children: 0,

    startDate: "",
    endDate: "",

    travelingWithChildren: false,

    termsAccepted: false,
  });

  const minimumBookingDate = new Date();
  minimumBookingDate.setDate(minimumBookingDate.getDate() + 14);

  // =======================================================
  // INLINE CALENDAR — drag-to-select date range
  // =======================================================

  function toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const minBookingIso = toISODate(minimumBookingDate);
  const todayIso = toISODate(new Date());

  const [viewYear, setViewYear] = useState(minimumBookingDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(minimumBookingDate.getMonth());

  const [isDragging, setIsDragging] = useState(false);
  const [dragAnchorIso, setDragAnchorIso] = useState<string | null>(null);

  // Il rilascio del dito può avvenire fuori dalla griglia (es. l'utente
  // scivola leggermente oltre il bordo): un listener globale garantisce
  // che il drag si chiuda comunque.
  useEffect(() => {
    function handlePointerUp() {
      setIsDragging(false);
    }
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  function buildCalendarCells(year: number, month: number) {

    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { date: Date; outside: boolean }[] = [];

    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        outside: true,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), outside: false });
    }

    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      cells.push({ date: next, outside: true });
    }

    return cells;
  }

  function startDateDrag(iso: string) {

    if (iso < minBookingIso) return;

    setIsDragging(true);
    setDragAnchorIso(iso);

    setFormData((prev) => ({
      ...prev,
      startDate: iso,
      endDate: iso,
    }));
  }

  function extendDateDrag(iso: string) {

    if (!isDragging || !dragAnchorIso) return;
    if (iso < minBookingIso) return;

    const [start, end] =
      iso < dragAnchorIso ? [iso, dragAnchorIso] : [dragAnchorIso, iso];

    setFormData((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
    }));
  }

  function handleCalendarPointerMove(e: React.PointerEvent) {

    if (!isDragging) return;

    const target = document.elementFromPoint(
      e.clientX,
      e.clientY
    ) as HTMLElement | null;

    const iso = target?.closest("[data-iso]")?.getAttribute("data-iso");

    if (iso) extendDateDrag(iso);
  }

  function goPrevMonth() {

    const isAtMinMonth =
      viewYear === minimumBookingDate.getFullYear() &&
      viewMonth === minimumBookingDate.getMonth();

    if (isAtMinMonth) return;

    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function goNextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  function formatDisplayDate(iso: string) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const incompatibleExperiences: Record<string, string[]> = {
    "Sea Escape": ["Aerial Escape"],
    "Aerial Escape": ["Sea Escape"],
  };

  // =======================================================
  // SELECT HANDLERS
  // =======================================================

  const handleSelect = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMultiSelect = (
    field: "experiences" | "moods",
    value: string,
    max: number
  ) => {

    setSelectionWarning("");

    setFormData((prev) => {

      const currentValues = prev[field];
      const alreadySelected = currentValues.includes(value);

      if (field === "experiences" && !alreadySelected) {

        const hasConflict = currentValues.some(
          (selected) => incompatibleExperiences[selected]?.includes(value)
        );

        if (hasConflict) {
          setSelectionWarning("These experiences cannot be combined");
          return prev;
        }
      }

      if (alreadySelected) {
        return {
          ...prev,
          [field]: currentValues.filter((item) => item !== value),
        };
      }

      if (currentValues.length >= max) {
        setSelectionWarning(
          field === "experiences"
            ? "Maximum 3 experiences allowed"
            : "Maximum 3 atmospheres selections allowed"
        );
        return prev;
      }

      return {
        ...prev,
        [field]: [...currentValues, value],
      };
    });
  };

  // =======================================================
  // PER-STEP VALIDATION
  // =======================================================

  function isStepValid(step: StepId): boolean {

    switch (step) {

      case "experiences":
        return formData.experiences.length > 0;

      case "moods":
        return formData.moods.length > 0;

      case "guests":
        return formData.guests !== "";

      case "children":
        if (showMoreChildren) {
          return (childrenCount ?? 0) >= 3;
        }
        return true;

      case "dates":
        return formData.startDate !== "" && formData.endDate !== "";

      case "budget":
        return formData.budget !== "";

      case "contact":
        return (
          formData.name.trim() !== "" &&
          /\S+@\S+\.\S+/.test(formData.email)
        );

      case "terms":
        return formData.termsAccepted && captchaToken !== "";

      default:
        return true;
    }
  }

  const currentStepValid = isIntro ? true : isStepValid(stepId as StepId);

  // =======================================================
  // NAVIGATION
  // =======================================================

  function startWizard() {
    setDirection(1);
    setCurrentStep(0);
  }

  function goNext() {

    if (isIntro) {
      startWizard();
      return;
    }

    if (stepId === "terms") {
      handleSubmit();
      return;
    }

    if (!currentStepValid) return;

    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function goBack() {

    if (isIntro) return;

    setDirection(-1);

    // Da step 0 si torna alla schermata di benvenuto
    setCurrentStep((s) => Math.max(s - 1, INTRO_STEP));
  }

  function handleDragEnd(_event: any, info: PanInfo) {

    if (isIntro) return;

    const swipeThreshold = 80;

    if (info.offset.x < -swipeThreshold) {
      goNext();
    } else if (info.offset.x > swipeThreshold) {
      goBack();
    }
  }

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = async () => {

    if (!isStepValid("terms")) return;

    try {

      if (!supabase) {
        console.error("Supabase not configured");
        return;
      }

      const verifyResponse = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        setCaptchaToken("");
        alert("Captcha verification failed");
        return;
      }

      // SAVE LEAD

      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            experiences: formData.experiences,
            moods: formData.moods,
            guests: formData.guests,
            budget: formData.budget,
            start_date: formData.startDate,
            end_date: formData.endDate,
            traveling_with_children: formData.travelingWithChildren,
            children: formData.children,
          },
        ])
        .select()
        .single();

      if (leadError || !leadData) {
        console.error("Lead error:", JSON.stringify(leadError, null, 2));
        return;
      }

      // SLUG

      const primaryExperience = formData.experiences[0]
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const safeName = formData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const slug = `${safeName}-${primaryExperience}`;

      // SAVE PROPOSAL

      const { data: proposalData, error: proposalError } = await supabase
        .from("Proposal")
        .insert([
          {
            lead_id: leadData.id,
            slug,
            expires_at: new Date(
              Date.now() + 48 * 60 * 60 * 1000
            ).toISOString(),
            proposal_data: {
              name: formData.name,
              email: formData.email,
              experiences: formData.experiences,
              moods: formData.moods,
              guests: formData.guests,
              children: formData.children,
              budget: formData.budget,
              start_date: formData.startDate,
              end_date: formData.endDate,
              traveling_with_children: formData.travelingWithChildren,
            },
            total_price: 0,
          },
        ])
        .select()
        .single();

      if (proposalError || !proposalData) {
        console.error("Proposal error:", JSON.stringify(proposalError, null, 2));
        return;
      }

      router.push(`/results/proposal-staging/${proposalData.slug}`);

    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // =======================================================
  // STEP CONTENT
  // =======================================================

  function renderStep() {

    switch (stepId) {

      case "experiences":
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm">
                {formData.experiences.length}/3 selected
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["Sea Escape", "Aerial Escape", "Gourmet Escape", "Wild Escape"].map(
                (item) => {

                  const details = EXPERIENCE_DETAILS[item];
                  const isSelected = formData.experiences.includes(item);

                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleMultiSelect("experiences", item, 3)}
                      className={`relative rounded-2xl overflow-hidden h-32 border transition-all duration-500 ${
                        isSelected ? "border-white" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${details.image})` }}
                      />

                      <div className="absolute inset-0 bg-black/40" />

                      {/* SELECTION RING */}
                      <div
                        className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-[#d6c6a5] bg-[#d6c6a5]" : "border-white/60"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>

                      {/* LABEL — centrata, nessuna icona, come le Atmospheres */}
                      <div className="absolute inset-0 flex items-center justify-center px-3">
                        <p className="text-white text-sm font-medium text-center">
                          {item}
                        </p>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {selectionWarning && (
              <p className="text-amber-400 text-sm mt-4">{selectionWarning}</p>
            )}
          </div>
        );

      case "moods":
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm">
                {formData.moods.length}/3 selected
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["Romantic", "Cinematic", "Authentic", "Adventure"].map((item) => {

                const isSelected = formData.moods.includes(item);

                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleMultiSelect("moods", item, 3)}
                    className={`relative rounded-2xl overflow-hidden h-32 border transition-all duration-500 ${
                      isSelected ? "border-white" : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${MOOD_IMAGES[item]})` }}
                    />

                    <div className="absolute inset-0 bg-black/40" />

                    <div
                      className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-[#d6c6a5] bg-[#d6c6a5]" : "border-white/60"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-black" />
                      )}
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <MoodIcon id={item} />
                      <p className="text-white text-sm font-medium">{item}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectionWarning && (
              <p className="text-amber-400 text-sm mt-4">{selectionWarning}</p>
            )}
          </div>
        );

      case "guests":
        return (
          <div>
            <div className="grid grid-cols-2 gap-4">
              {[2, 3, 4, 5, 6, 7, 8].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    setGuestCount(item);
                    setShowMoreGuests(false);
                    setFormData({ ...formData, guests: String(item) });
                  }}
                  className={`border rounded-2xl px-4 py-5 text-center transition-all duration-500 ease-out ${
                    guestCount === item
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                  }`}
                >
                  {item}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setGuestCount(null);
                  setShowMoreGuests(true);
                  setFormData({ ...formData, guests: "" });
                }}
                className={`rounded-2xl border px-4 py-5 text-center transition-all duration-500 ease-out ${
                  showMoreGuests
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 hover:border-white/40"
                }`}
              >
                9+
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-out ${
                showMoreGuests ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-zinc-500 mb-2 text-sm">Exact number of guests</p>
              <input
                type="number"
                min={9}
                max={40}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter exact number"
                value={guestCount || ""}
                onChange={(e) => {
                  setGuestCount(Number(e.target.value));
                  setFormData({ ...formData, guests: e.target.value });
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 outline-none transition-all duration-500 focus:border-white/40"
              />
            </div>
          </div>
        );

      case "children":
        return (
          <div>
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    setChildrenCount(item);
                    setShowMoreChildren(false);
                    setFormData({
                      ...formData,
                      children: item,
                      travelingWithChildren: item > 0,
                    });
                  }}
                  className={`w-full border rounded-2xl px-6 py-5 text-center transition-all duration-500 ease-out ${
                    childrenCount === item
                      ? "bg-white text-black border-white"
                      : "bg-white/5 border-white/10 hover:border-white/40"
                  }`}
                >
                  {item}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setChildrenCount(null);
                  setShowMoreChildren(true);
                }}
                className={`w-full border rounded-2xl px-6 py-5 text-center transition-all duration-500 ease-out ${
                  showMoreChildren
                    ? "bg-white text-black border-white"
                    : "bg-white/5 border-white/10 hover:border-white/40"
                }`}
              >
                3+
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-out ${
                showMoreChildren ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-zinc-500 mb-2 text-sm">How many children?</p>
              <input
                type="number"
                min={3}
                max={20}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="How many children?"
                value={childrenCount || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setChildrenCount(value);
                  setFormData({
                    ...formData,
                    children: value,
                    travelingWithChildren: value > 0,
                  });
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 outline-none transition-all duration-500 focus:border-white/40"
              />
            </div>
          </div>
        );

      case "dates": {

        const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
          "en-US",
          { month: "long", year: "numeric" }
        );

        const cells = buildCalendarCells(viewYear, viewMonth);
        const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

        const isPrevDisabled =
          viewYear === minimumBookingDate.getFullYear() &&
          viewMonth === minimumBookingDate.getMonth();

        return (
          <div>

            {/* CHECK-IN / CHECK-OUT SUMMARY */}
            <div className="flex justify-between mb-3">
              <div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-0.5">
                  Check-in
                </p>
                <p className="text-white text-sm">
                  {formData.startDate
                    ? formatDisplayDate(formData.startDate)
                    : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-0.5">
                  Check-out
                </p>
                <p className="text-white text-sm">
                  {formData.endDate
                    ? formatDisplayDate(formData.endDate)
                    : "—"}
                </p>
              </div>
            </div>

            {/* MONTH NAVIGATION */}
            <div className="flex items-center justify-between mb-2">

              <button
                type="button"
                onClick={goPrevMonth}
                disabled={isPrevDisabled}
                className="px-3 py-0.5 text-base disabled:opacity-20 opacity-70 hover:opacity-100 transition-opacity"
              >
                &#8249;
              </button>

              <p className="uppercase tracking-[0.2em] text-xs text-zinc-400">
                {monthLabel}
              </p>

              <button
                type="button"
                onClick={goNextMonth}
                className="px-3 py-0.5 text-base opacity-70 hover:opacity-100 transition-opacity"
              >
                &#8250;
              </button>

            </div>

            {/* WEEKDAY HEADER */}
            <div className="grid grid-cols-7 mb-0.5">
              {weekdayLabels.map((label, index) => (
                <div
                  key={index}
                  className="h-5 flex items-center justify-center text-[10px] text-zinc-500"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* CALENDAR GRID — tap-and-drag per selezionare l'intervallo */}
            <div
              className="grid grid-cols-7 select-none"
              style={{ touchAction: "none" }}
              onPointerMove={handleCalendarPointerMove}
            >
              {cells.map((cell) => {

                const iso = toISODate(cell.date);
                const disabled = iso < minBookingIso;
                const isStart = iso === formData.startDate;
                const isEnd = iso === formData.endDate;
                const inRange =
                  formData.startDate !== "" &&
                  formData.endDate !== "" &&
                  iso > formData.startDate &&
                  iso < formData.endDate;
                const isToday = iso === todayIso;

                return (
                  <div
                    key={iso}
                    data-iso={iso}
                    onPointerDown={() => {
                      if (!disabled) startDateDrag(iso);
                    }}
                    className={`
                      h-9 flex items-center justify-center relative
                      ${inRange ? "bg-[#d6c6a5]/20" : ""}
                      ${isStart && !isEnd ? "rounded-l-full" : ""}
                      ${isEnd && !isStart ? "rounded-r-full" : ""}
                    `}
                  >
                    <span
                      className={`
                        w-7 h-7 flex items-center justify-center rounded-full text-xs transition-colors
                        ${disabled ? "text-white/15" : cell.outside ? "text-white/25" : "text-white"}
                        ${isStart || isEnd ? "bg-[#d6c6a5] text-black font-medium" : ""}
                        ${isToday && !isStart && !isEnd ? "ring-1 ring-white/30" : ""}
                      `}
                    >
                      {cell.date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-zinc-500 text-[11px] mt-2 text-center">
              Tap a date, or drag across dates to select a range.
            </p>

          </div>
        );
      }

      case "budget":
        return (
          <div className="grid gap-4">
            {["€500 - €1000", "€1000 - €3000", "€3000+"].map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => handleSelect("budget", item)}
                className={`border rounded-2xl px-6 py-6 text-center text-lg transition-all duration-500 ease-out ${
                  formData.budget === item
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 hover:border-white/40"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div>
              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-3">
                Your Name
              </p>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-2xl px-6 py-4 text-white placeholder:text-zinc-500 outline-none border border-white/10 bg-white/5 focus:border-white/40 transition"
              />
            </div>

            <div>
              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-3">
                Email Address
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-2xl px-6 py-4 text-white placeholder:text-zinc-500 outline-none border border-white/10 bg-white/5 focus:border-white/40 transition"
              />
            </div>
          </div>
        );

      case "terms": {

        const termsAnchorProps = {
          href: TERMS_URL,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "underline",
        };

        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) =>
                  setFormData({ ...formData, termsAccepted: e.target.checked })
                }
                className="mt-1 h-5 w-5 accent-black cursor-pointer shrink-0"
              />
              <p className="text-sm text-zinc-400 leading-relaxed">
                I accept the{" "}
                <a {...termsAnchorProps}>Terms &amp; Conditions</a>{" "}
                and understand that reservation deposits may be required to
                secure curated experiences.
              </p>
            </div>

            <div>
              <Turnstile
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onVerify={(token) => setCaptchaToken(token)}
              />
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  }

  // =======================================================
  // INTRO SCREEN
  // =======================================================

  if (isIntro) {

    return (
      <main
        className="
          h-dvh
          w-full
          bg-[#0C0C0C]
          text-white
          relative
          overflow-hidden
        "
        style={{
          backgroundImage: "url('/hero-config.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        {/* OVERLAY — se l'immagine non è ancora impostata resta semplicemente nero */}
        <div className="absolute inset-0 bg-black/60" />

        {/*
          BLOCCO CENTRALE — logo, testo e bottone centrati come un unico blocco.
          max-w-xl + mx-auto impediscono che il contenuto si stiri edge-to-edge
          su schermi larghi; le classi md: scalano tipografia e spaziature
          per una resa desktop proporzionata, non solo un "mobile ingrandito".
        */}
        <div
          className="
            relative
            z-10
            h-full
            w-full
            flex
            flex-col
            items-center
            justify-center
            text-center
            px-8
          "
        >

          <div className="w-full max-w-xl mx-auto flex flex-col items-center">

            <img
              src="/logo-white.png"
              alt="Portovenere Experiences"
              className="h-14 md:h-20 mb-8 md:mb-10 opacity-90"
            />

            <p className="uppercase tracking-[0.35em] text-[#d6c6a5] text-xs md:text-sm mb-6 md:mb-8">
              Private Experience Curation
            </p>

            <h1 className="text-4xl md:text-6xl font-light leading-[1.1] mb-6 md:mb-8 max-w-sm md:max-w-lg">
              Craft Your Mediterranean Escape
            </h1>

            <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-10 md:mb-12 max-w-sm md:max-w-md">
              Answer a few questions to receive a curated proposal tailored to
              your ideal Riviera experience.
            </p>

            <button
              type="button"
              onClick={startWizard}
              className="
                w-full
                max-w-sm
                md:max-w-xs
                rounded-full
                py-5
                uppercase
                tracking-[0.25em]
                text-xs
                bg-[#d6c6a5]
                text-black
                hover:scale-[1.02]
                transition-all
                duration-500
              "
            >
              Get Started
            </button>

          </div>

        </div>

      </main>
    );
  }

  // =======================================================
  // WIZARD RENDER
  // =======================================================

  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <main className="h-dvh overflow-hidden bg-[#0C0C0C] text-white flex flex-col">

      {/* HEADER: back + progress + counter — compatto, altezza fissa */}
      <div className="px-6 pt-6 pb-3 max-w-xl w-full mx-auto shrink-0">

        <div className="flex items-center gap-4 mb-4">

          <button
            type="button"
            onClick={goBack}
            className="text-2xl opacity-70 hover:opacity-100 transition-opacity"
          >
            &#8592;
          </button>

          <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d6c6a5] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-zinc-500 tabular-nums">
            {currentStep + 1} / {totalSteps}
          </p>

        </div>

        <p className="uppercase tracking-[0.3em] text-zinc-500 text-xs mb-2">
          {STEP_LABELS[stepId as StepId].label}
        </p>

        <h1 className="text-2xl md:text-4xl font-light leading-tight">
          {STEP_LABELS[stepId as StepId].title}
        </h1>

      </div>

      {/*
        CONTENUTO + PULSANTI insieme, centrati come blocco unico
        nello spazio restante. Questo è il punto chiave: su step corti
        (experiences, moods, guests, budget) i pulsanti Next/Back
        restano incollati subito sotto la griglia invece di finire
        in fondo allo schermo. Su step più alti (dates, terms con
        captcha) min-h-0 + overflow-y-auto permette uno scroll interno
        di fallback senza rompere il layout.
      */}
      <div
        className="
          flex-1
          min-h-0
          flex
          flex-col
          justify-between
          gap-6
          overflow-y-auto
          pt-4
          pb-6
          px-6
          max-w-xl
          w-full
          mx-auto
        "
      >

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag={stepId !== "dates" ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 shrink-0">

          <button
            type="button"
            onClick={goBack}
            className="
              w-1/3
              rounded-full
              py-5
              uppercase
              tracking-[0.25em]
              text-xs
              border
              border-white/20
              text-white/70
              hover:border-white/40
              hover:text-white
              transition-all
              duration-500
            "
          >
            Back
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!currentStepValid}
            className={`
              w-2/3
              rounded-full
              py-5
              uppercase
              tracking-[0.25em]
              text-xs
              transition-all
              duration-500
              ${
                currentStepValid
                  ? "bg-white text-black hover:scale-[1.02]"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }
            `}
          >
            {stepId === "terms" ? "Generate Private Proposal" : "Next"}
          </button>

        </div>

      </div>

    </main>
  );
}