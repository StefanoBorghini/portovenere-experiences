"use client";

import Turnstile from "react-turnstile";
import { useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

export default function CraftYourExperience() {

  const router = useRouter();

  // =======================================================
  // WIZARD NAVIGATION STATE
  // =======================================================

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectionWarning, setSelectionWarning] = useState("");

  const totalSteps = STEP_IDS.length;
  const stepId = STEP_IDS[currentStep];

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

  const CustomDateInput = forwardRef<HTMLButtonElement, any>(
    ({ value, onClick, placeholder, className }, ref) => (
      <button
        type="button"
        onClick={onClick}
        ref={ref}
        className={className}
      >
        {value || placeholder}
      </button>
    )
  );
  CustomDateInput.displayName = "CustomDateInput";

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
          return (childrenCount ?? 0) >= 2;
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

  const currentStepValid = isStepValid(stepId);

  // =======================================================
  // NAVIGATION
  // =======================================================

  function goNext() {

    if (stepId === "terms") {
      handleSubmit();
      return;
    }

    if (!currentStepValid) return;

    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function goBack() {
    if (currentStep === 0) return;
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function handleDragEnd(_event: any, info: PanInfo) {

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
            <div className="flex items-center justify-between mb-6">
              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm">
                {formData.experiences.length}/3 selected
              </p>
            </div>

            <div className="grid gap-4">
              {["Sea Escape", "Aerial Escape", "Gourmet Escape", "Wild Escape"].map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleMultiSelect("experiences", item, 3)}
                    className={`border rounded-2xl px-6 py-6 text-center transition-all duration-500 ease-out ${
                      formData.experiences.includes(item)
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/5 hover:border-white/40"
                    }`}
                  >
                    {item}
                  </button>
                )
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
            <div className="flex items-center justify-between mb-6">
              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm">
                {formData.moods.length}/3 selected
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["Romantic", "Cinematic", "Authentic", "Adventure"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => handleMultiSelect("moods", item, 3)}
                  className={`border rounded-2xl px-6 py-10 text-center transition-all duration-500 ease-out ${
                    formData.moods.includes(item)
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                  }`}
                >
                  {item}
                </button>
              ))}
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
                  className={`border rounded-2xl px-6 py-6 text-center transition-all duration-500 ease-out ${
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
                className={`rounded-2xl border px-6 py-6 text-center transition-all duration-500 ease-out ${
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
                showMoreGuests ? "max-h-48 opacity-100 mt-6" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-zinc-500 mb-3">Exact number of guests</p>
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
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-5 outline-none transition-all duration-500 focus:border-white/40"
              />
            </div>
          </div>
        );

      case "children":
        return (
          <div>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1].map((item) => (
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
                  className={`border rounded-2xl px-6 py-6 transition-all duration-500 ease-out ${
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
                className={`border rounded-2xl px-6 py-6 transition-all duration-500 ease-out ${
                  showMoreChildren
                    ? "bg-white text-black border-white"
                    : "bg-white/5 border-white/10 hover:border-white/40"
                }`}
              >
                2+
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-out ${
                showMoreChildren ? "max-h-48 opacity-100 mt-6" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-zinc-500 mb-3">How many children?</p>
              <input
                type="number"
                min={2}
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
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-5 outline-none transition-all duration-500 focus:border-white/40"
              />
            </div>
          </div>
        );

      case "dates":
        return (
          <div className="space-y-8">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-zinc-500">Start Date</p>
              <DatePicker
                customInput={
                  <CustomDateInput className="w-full rounded-2xl px-6 py-6 text-left text-lg bg-white/5 border border-white/10 text-white outline-none transition backdrop-blur-md hover:border-white/30" />
                }
                shouldCloseOnSelect={true}
                selected={formData.startDate ? new Date(formData.startDate) : null}
                onChange={(date: Date | null) => {
                  setFormData({
                    ...formData,
                    startDate: date ? date.toISOString().split("T")[0] : "",
                  });
                }}
                minDate={minimumBookingDate}
                placeholderText="Select start date"
                dateFormat="MMMM d, yyyy"
                calendarClassName="custom-calendar"
                wrapperClassName="w-full"
              />
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm text-zinc-500">End Date</p>
              <DatePicker
                customInput={
                  <CustomDateInput className="w-full rounded-2xl px-6 py-6 text-left text-lg bg-white/5 border border-white/10 text-white outline-none transition backdrop-blur-md hover:border-white/30" />
                }
                shouldCloseOnSelect={true}
                selected={formData.endDate ? new Date(formData.endDate) : null}
                onChange={(date: Date | null) => {
                  setFormData({
                    ...formData,
                    endDate: date ? date.toISOString().split("T")[0] : "",
                  });
                }}
                minDate={
                  formData.startDate ? new Date(formData.startDate) : minimumBookingDate
                }
                placeholderText="Select end date"
                dateFormat="MMMM d, yyyy"
                calendarClassName="custom-calendar"
                wrapperClassName="w-full"
              />
            </div>
          </div>
        );

      case "budget":
        return (
          <div className="grid gap-4">
            {["€500 - €1000", "€1000 - €3000", "€3000+"].map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => handleSelect("budget", item)}
                className={`border rounded-2xl px-6 py-8 text-center text-lg transition-all duration-500 ease-out ${
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
          <div className="space-y-8">
            <div>
              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-4">
                Your Name
              </p>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-2xl px-6 py-5 text-white placeholder:text-zinc-500 outline-none border border-white/10 bg-white/5 focus:border-white/40 transition"
              />
            </div>

            <div>
              <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-4">
                Email Address
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-2xl px-6 py-5 text-white placeholder:text-zinc-500 outline-none border border-white/10 bg-white/5 focus:border-white/40 transition"
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
          <div className="space-y-8">
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
  // RENDER
  // =======================================================

  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <main className="min-h-screen bg-[#0C0C0C] text-white flex flex-col">

      {/* HEADER: back + progress + counter */}
      <div className="px-6 pt-8 pb-4 max-w-xl w-full mx-auto">

        <div className="flex items-center gap-4 mb-6">

          <button
            type="button"
            onClick={goBack}
            disabled={currentStep === 0}
            className={`text-2xl transition-opacity ${
              currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-70 hover:opacity-100"
            }`}
          >
            ←
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
          {STEP_LABELS[stepId].label}
        </p>

        <h1 className="text-3xl md:text-4xl font-light leading-tight">
          {STEP_LABELS[stepId].title}
        </h1>

      </div>

      {/* STEP CONTENT */}
      <div className="flex-1 px-6 max-w-xl w-full mx-auto overflow-hidden">

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            className="py-4"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* FOOTER: next / submit */}
      <div className="px-6 py-8 max-w-xl w-full mx-auto">

        <button
          type="button"
          onClick={goNext}
          disabled={!currentStepValid}
          className={`w-full rounded-full py-5 uppercase tracking-[0.25em] text-xs transition-all duration-500 ${
            currentStepValid
              ? "bg-white text-black hover:scale-[1.02]"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          {stepId === "terms" ? "Generate Private Proposal" : "Next"}
        </button>

      </div>

    </main>
  );
}
