"use client";

// Standalone prototype: Character -> Mood -> Moment -> Reveal.
// Local mock data only, nothing written to Supabase or wired into the
// real booking configurator (src/app/craft-your-experience) — this is
// here purely to demo the flow and the weighted scoring before deciding
// whether to fold it into production.

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Heart, Crown, Leaf } from "lucide-react";

type Character = "wanderer" | "romantic" | "connoisseur" | "free_spirit";
type Mood = "escape" | "connection" | "unforgettable" | "indulgence";
type Moment = "leave_harbour" | "stay_hidden" | "chase_sunset" | "discover_unexpected";

type Experience = {
  id: string;
  title: string;
  description: string;
  image: string;
  characterTags: Character[];
  moodTags: Mood[];
  momentTags: Moment[];
  priceTier: 1 | 2 | 3; // internal only, never shown to the user
};

const CHARACTER_OPTIONS: {
  value: Character;
  emoji: string;
  label: string;
  description: string;
  icon: typeof Compass;
}[] = [
  {
    value: "wanderer",
    emoji: "🧭",
    label: "The Wanderer",
    description: "Always chasing the next horizon.",
    icon: Compass,
  },
  {
    value: "romantic",
    emoji: "🎭",
    label: "The Romantic",
    description: "Every moment deserves its own story.",
    icon: Heart,
  },
  {
    value: "connoisseur",
    emoji: "👑",
    label: "The Connoisseur",
    description: "You know good taste when you feel it.",
    icon: Crown,
  },
  {
    value: "free_spirit",
    emoji: "🌿",
    label: "The Free Spirit",
    description: "Rules are optional out here.",
    icon: Leaf,
  },
];

const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: "escape", emoji: "🌊", label: "Escape" },
  { value: "connection", emoji: "❤️", label: "Connection" },
  { value: "unforgettable", emoji: "🎬", label: "Unforgettable" },
  { value: "indulgence", emoji: "🍷", label: "Indulgence" },
];

const MOMENT_OPTIONS: { value: Moment; emoji: string; label: string }[] = [
  { value: "leave_harbour", emoji: "⛵", label: "Leave the harbour" },
  { value: "stay_hidden", emoji: "🥂", label: "Stay hidden" },
  { value: "chase_sunset", emoji: "🌅", label: "Chase the sunset" },
  { value: "discover_unexpected", emoji: "🌿", label: "Discover something unexpected" },
];

const EXPERIENCES: Experience[] = [
  {
    id: "sunset-sailing-escape",
    title: "Sunset Sailing Escape",
    description: "Leave the harbour behind and chase the light along the Riviera coast.",
    image: "/images/sailing/dino/cinematic.webp",
    characterTags: ["wanderer", "free_spirit"],
    moodTags: ["escape", "unforgettable"],
    momentTags: ["leave_harbour", "chase_sunset"],
    priceTier: 2,
  },
  {
    id: "private-sunset-cruise",
    title: "Private Sunset Cruise for Two",
    description: "A quiet deck, the coast turning gold, and nowhere else to be.",
    image: "/images/sailing/dino/romantic.webp",
    characterTags: ["romantic"],
    moodTags: ["connection"],
    momentTags: ["chase_sunset"],
    priceTier: 2,
  },
  {
    id: "hidden-chefs-table",
    title: "Chef's Table on a Hidden Terrace",
    description: "A tasting menu built around you, tucked away from every crowd.",
    image: "/images/dining/ristorante/romantic.jpg",
    characterTags: ["connoisseur"],
    moodTags: ["indulgence"],
    momentTags: ["stay_hidden"],
    priceTier: 3,
  },
  {
    id: "yacht-day-private-chef",
    title: "Yacht Day with a Private Chef",
    description: "Open water, a menu made to order, and the whole gulf to yourselves.",
    image: "/images/yachts/aphrodite/hero.webp",
    characterTags: ["connoisseur", "romantic"],
    moodTags: ["indulgence", "connection"],
    momentTags: ["leave_harbour"],
    priceTier: 3,
  },
  {
    id: "wild-coast-trekking",
    title: "Wild Coast Trekking & Swim",
    description: "Off the map trails to coves most people never find.",
    image: "/images/wild/trekking/adventure.jpg",
    characterTags: ["free_spirit", "wanderer"],
    moodTags: ["escape"],
    momentTags: ["discover_unexpected"],
    priceTier: 1,
  },
  {
    id: "horseback-golden-hour",
    title: "Horseback at Golden Hour",
    description: "Ride the coastal trails as the light turns everything amber.",
    image: "/images/wild/horses/default.webp",
    characterTags: ["free_spirit"],
    moodTags: ["unforgettable"],
    momentTags: ["chase_sunset"],
    priceTier: 2,
  },
  {
    id: "paramotor-flight",
    title: "Paramotor Flight over the Gulf",
    description: "See Portovenere the way birds do, once in a lifetime.",
    image: "/images/flying/para.webp",
    characterTags: ["wanderer"],
    moodTags: ["unforgettable"],
    momentTags: ["discover_unexpected"],
    priceTier: 3,
  },
  {
    id: "wine-cellar-tasting",
    title: "Private Wine Cellar Tasting",
    description: "Rare local labels, poured by hand, away from every tourist trail.",
    image: "/images/dining/wine.jpg",
    characterTags: ["connoisseur"],
    moodTags: ["indulgence"],
    momentTags: ["stay_hidden"],
    priceTier: 2,
  },
];

// Character carries more weight than mood/moment: it steers the price
// tier, mood/moment refine the pick inside that tier.
function matchExperience(character: Character, mood: Mood, moment: Moment): Experience {
  const scored = EXPERIENCES.map((exp) => ({
    exp,
    score:
      (exp.characterTags.includes(character) ? 3 : 0) +
      (exp.moodTags.includes(mood) ? 2 : 0) +
      (exp.momentTags.includes(moment) ? 2 : 0),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0].exp;
}

const QUIZ_STEPS = ["character", "mood", "moment"] as const;
type QuizStep = typeof QUIZ_STEPS[number];

export default function CharacterQuizPrototype() {
  const [stepIndex, setStepIndex] = useState(0);
  const [character, setCharacter] = useState<Character | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [moment, setMoment] = useState<Moment | null>(null);
  const [revealed, setRevealed] = useState(false);

  const stepId: QuizStep = QUIZ_STEPS[stepIndex];

  const currentValue =
    stepId === "character" ? character : stepId === "mood" ? mood : moment;

  const result = useMemo(() => {
    if (!character || !mood || !moment) return null;
    return matchExperience(character, mood, moment);
  }, [character, mood, moment]);

  const characterLabel = CHARACTER_OPTIONS.find((c) => c.value === character)?.label;

  function selectValue(value: Character | Mood | Moment) {
    if (stepId === "character") setCharacter(value as Character);
    if (stepId === "mood") setMood(value as Mood);
    if (stepId === "moment") setMoment(value as Moment);
  }

  function goNext() {
    if (!currentValue) return;

    if (stepIndex < QUIZ_STEPS.length - 1) {
      setStepIndex((s) => s + 1);
      return;
    }

    setRevealed(true);
  }

  function goBack() {
    if (revealed) {
      setRevealed(false);
      return;
    }
    setStepIndex((s) => Math.max(0, s - 1));
  }

  function startOver() {
    setStepIndex(0);
    setCharacter(null);
    setMood(null);
    setMoment(null);
    setRevealed(false);
  }

  if (revealed && result) {
    return (
      <main className="min-h-dvh w-full bg-[#0C0C0C] text-white flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md mx-auto text-center">
          <p className="uppercase tracking-[0.35em] text-[#d6c6a5] text-xs mb-4">
            Your Portovenere Experience
          </p>

          <h1 className="text-2xl md:text-3xl font-light leading-tight mb-8">
            Curated for {characterLabel} in you.
          </h1>

          <div className="relative rounded-2xl overflow-hidden h-64 border border-white/10 mb-6">
            <Image
              src={result.image}
              alt={result.title}
              fill
              sizes="400px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 text-left">
              <p className="text-white text-lg font-light">{result.title}</p>
            </div>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed mb-10">
            {result.description}
          </p>

          <div className="flex flex-col gap-3">
            <a
              href="/craft-your-experience"
              className="w-full rounded-full py-4 uppercase tracking-[0.25em] text-xs bg-[#d6c6a5] text-black hover:scale-[1.02] transition-all duration-500"
            >
              Build my experience
            </a>
            <button
              type="button"
              onClick={startOver}
              className="w-full rounded-full py-4 uppercase tracking-[0.25em] text-xs border border-white/20 text-white/70 hover:border-white/40 hover:text-white transition-all duration-500"
            >
              Start over
            </button>
          </div>
        </div>
      </main>
    );
  }

  const stepConfig = {
    character: {
      title: "Who are you today?",
      label: "Step 1",
      options: CHARACTER_OPTIONS.map((c) => ({
        value: c.value,
        emoji: c.emoji,
        label: c.label,
        description: c.description,
      })),
    },
    mood: {
      title: "What are you looking for?",
      label: "Step 2",
      options: MOOD_OPTIONS,
    },
    moment: {
      title: "Would you rather...",
      label: "Step 3",
      options: MOMENT_OPTIONS,
    },
  }[stepId];

  const progressPercent = ((stepIndex + 1) / QUIZ_STEPS.length) * 100;

  return (
    <main className="min-h-dvh w-full bg-[#0C0C0C] text-white flex flex-col">
      <div className="px-6 pt-8 pb-4 max-w-xl w-full mx-auto shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="text-2xl opacity-70 hover:opacity-100 disabled:opacity-20 transition-opacity"
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
            {stepIndex + 1} / {QUIZ_STEPS.length}
          </p>
        </div>

        <p className="uppercase tracking-[0.3em] text-zinc-500 text-xs mb-2">
          {stepConfig.label}
        </p>
        <h1 className="text-2xl md:text-4xl font-light leading-tight">
          {stepConfig.title}
        </h1>
      </div>

      <div className="flex-1 px-6 pb-10 max-w-xl w-full mx-auto flex flex-col justify-between gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepId}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-3"
          >
            {stepConfig.options.map((option) => {
              const isSelected = currentValue === option.value;

              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => selectValue(option.value)}
                  className={`rounded-2xl border px-4 py-6 text-center transition-all duration-500 ease-out ${
                    isSelected
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                  }`}
                >
                  <span className="block text-2xl mb-2">{option.emoji}</span>
                  <span className="block text-sm font-medium">{option.label}</span>
                  {"description" in option && option.description && (
                    <span
                      className={`block text-[11px] mt-1.5 leading-snug ${
                        isSelected ? "text-black/60" : "text-zinc-500"
                      }`}
                    >
                      {option.description}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={goNext}
          disabled={!currentValue}
          className={`w-full rounded-full py-4 uppercase tracking-[0.25em] text-xs transition-all duration-500 ${
            currentValue
              ? "bg-white text-black hover:scale-[1.02]"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          {stepIndex === QUIZ_STEPS.length - 1 ? "Reveal my experience" : "Next"}
        </button>
      </div>
    </main>
  );
}
