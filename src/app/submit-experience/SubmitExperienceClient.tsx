"use client";

import { useEffect, useState } from "react";
import Turnstile from "react-turnstile";
import { motion, AnimatePresence } from "framer-motion";
import {
  trackExperienceSubmissionPageView,
  trackExperienceSubmissionStepEntered,
  trackExperienceSubmissionStepBack,
  trackExperienceSubmissionTypeSelected,
  trackExperienceSubmissionSubmitted,
  trackExperienceSubmissionError,
} from "@/lib/analytics/gtag";
import { LANGUAGE_OPTIONS } from "@/lib/config/languageOptions";

// =========================================================
// Wizard step-by-step per operatori che propongono UNA singola
// esperienza (diverso da /become-a-partner, che riguarda l'intera
// attivita'). Stesso identico impianto/stile di
// src/app/become-a-partner/BecomePartnerClient.tsx — stato per step,
// validazione per-step, transizione slide, schema dichiarativo per i
// campi che cambiano in base alla categoria scelta. Nessun
// salvataggio su database: solo un'email a Stefano (vedi
// /api/experience-submission) — nessuna lista da rivedere in admin,
// per scelta esplicita. Pagina solo in italiano, testo hardcoded qui
// direttamente, stesso trattamento del wizard partner.
// =========================================================

const STEP_IDS = [
  "type",
  "business",
  "experience",
  "details",
  "logistics",
  "photos",
  "message",
] as const;
type StepId = (typeof STEP_IDS)[number];

const STEP_TITLES: Record<StepId, string> = {
  type: "Che tipo di esperienza proponi?",
  business: "Chi sei?",
  experience: "Raccontaci l'esperienza",
  details: "Qualche dettaglio in più",
  logistics: "Prezzo e organizzazione",
  photos: "Foto",
  message: "C'è altro che dovremmo sapere?",
};

// Stessi 6 valori usati ovunque nel sito (vedi
// src/lib/config/experienceTaxonomy.ts, unica fonte di verità) — così
// la categoria scelta qui combacia 1:1 col dropdown che Stefano userà
// in admin per inserire l'esperienza vera. Aerial Escape rimossa dal
// sistema pubblico — non più selezionabile qui.
type Category =
  | "sea_escape"
  | "gourmet_escape"
  | "wine_escape"
  | "wild_escape"
  | "cultural_escape"
  | "wellness_escape";

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "sea_escape", label: "Sea Escape (mare, barca...)" },
  { value: "gourmet_escape", label: "Gourmet Escape (cibo...)" },
  { value: "wine_escape", label: "Wine Escape (vino, cantine...)" },
  { value: "wild_escape", label: "Wild Escape (natura, trekking...)" },
  { value: "cultural_escape", label: "Cultural Escape (arte, tradizioni, storia...)" },
  { value: "wellness_escape", label: "Wellness Escape (relax, benessere...)" },
];

interface DetailField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "yesno";
  options?: string[];
  // Solo per "multiselect": se presente, selezionarlo deseleziona tutte
  // le altre opzioni (e viceversa) — usato da "Nessuna" in Gourmet
  // Escape, opzionale/inerte per ogni altro campo multiselect.
  exclusiveValue?: string;
}

const DETAIL_FIELDS: Record<Category, DetailField[]> = {
  sea_escape: [
    { key: "boatType", label: "Tipo ed eventuale capienza dell'imbarcazione", type: "text" },
    { key: "departurePoint", label: "Punto di partenza", type: "text" },
    { key: "safetyEquipment", label: "Dotazioni di sicurezza / licenza", type: "text" },
    { key: "weatherDependent", label: "L'esperienza dipende dal meteo?", type: "yesno" },
    { key: "language", label: "Lingue disponibili", type: "multiselect", options: LANGUAGE_OPTIONS },
  ],
  gourmet_escape: [
    {
      key: "experienceType",
      label: "Tipo di esperienza",
      type: "select",
      options: ["Degustazione", "Corso di cucina", "Cena privata", "Tour gastronomico", "Altro"],
    },
    {
      key: "dietaryOptions",
      label: "Opzioni alimentari disponibili",
      type: "multiselect",
      options: ["Vegetariano", "Vegano", "Senza glutine", "Nessuna"],
      exclusiveValue: "Nessuna",
    },
    { key: "groupSize", label: "Dimensione tipica del gruppo", type: "text" },
    { key: "language", label: "Lingue disponibili", type: "multiselect", options: LANGUAGE_OPTIONS },
  ],
  wine_escape: [
    {
      key: "experienceType",
      label: "Tipo di esperienza",
      type: "select",
      options: ["Degustazione in cantina", "Tour tra i vigneti", "Abbinamento cibo-vino", "Altro"],
    },
    { key: "wineriesInvolved", label: "Cantina/e coinvolta/e", type: "text" },
    { key: "groupSize", label: "Dimensione tipica del gruppo", type: "text" },
    { key: "language", label: "Lingue disponibili", type: "multiselect", options: LANGUAGE_OPTIONS },
  ],
  wild_escape: [
    {
      key: "activityType",
      label: "Tipo di attività",
      type: "select",
      options: ["Trekking", "Kayak", "Bici", "Altro"],
    },
    {
      key: "difficultyLevel",
      label: "Livello di difficoltà",
      type: "select",
      options: ["Facile", "Medio", "Impegnativo"],
    },
    { key: "equipmentProvided", label: "Attrezzatura fornita?", type: "yesno" },
    { key: "language", label: "Lingue disponibili", type: "multiselect", options: LANGUAGE_OPTIONS },
  ],
  cultural_escape: [
    {
      key: "experienceType",
      label: "Tipo di esperienza",
      type: "select",
      options: ["Visita guidata", "Laboratorio artigianale", "Evento/tradizione locale", "Altro"],
    },
    { key: "language", label: "Lingue disponibili", type: "multiselect", options: LANGUAGE_OPTIONS },
    { key: "groupSize", label: "Dimensione tipica del gruppo", type: "text" },
  ],
  wellness_escape: [
    {
      key: "experienceType",
      label: "Tipo di esperienza",
      type: "select",
      options: ["Massaggio/trattamento", "Yoga/meditazione", "Percorso spa", "Altro"],
    },
    { key: "location", label: "Dove si svolge (interno/esterno)", type: "text" },
    { key: "equipmentProvided", label: "Attrezzatura/materiali forniti?", type: "yesno" },
    { key: "language", label: "Lingue disponibili", type: "multiselect", options: LANGUAGE_OPTIONS },
  ],
};

const PRICE_TYPE_OPTIONS = ["Fisso", "A persona"];
const PHOTO_DELIVERY_OPTIONS = ["Email", "WhatsApp", "Drive/Dropbox", "Non ho ancora le foto"];

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

const inputClass =
  "w-full rounded-2xl px-6 py-3.5 text-white placeholder:text-zinc-500 outline-none border border-white/10 bg-white/5 focus:border-white/40 transition";

// "details" mescola stringhe (input di testo), array (multiselect) e
// booleani (yesno) nello stesso oggetto — stessi helper di
// BecomePartnerClient.tsx per restringere il tipo esatto atteso da
// ciascun campo.
type DetailValue = string | string[] | boolean;

function getString(obj: Record<string, DetailValue>, key: string): string {
  const value = obj[key];
  return typeof value === "string" ? value : "";
}

function getArray(obj: Record<string, DetailValue>, key: string): string[] {
  const value = obj[key];
  return Array.isArray(value) ? value : [];
}

function getBoolean(obj: Record<string, DetailValue>, key: string): boolean | undefined {
  const value = obj[key];
  return typeof value === "boolean" ? value : undefined;
}

export default function SubmitExperienceClient() {

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const [category, setCategory] = useState<Category | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [experienceTitle, setExperienceTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");

  const [details, setDetails] = useState<Record<string, DetailValue>>({});

  const [basePrice, setBasePrice] = useState("");
  const [priceType, setPriceType] = useState("");
  const [duration, setDuration] = useState("");
  const [minParticipants, setMinParticipants] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");

  const [photoDelivery, setPhotoDelivery] = useState("");
  const [photoLink, setPhotoLink] = useState("");

  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const stepId: StepId = STEP_IDS[currentStep];
  const totalSteps = STEP_IDS.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    trackExperienceSubmissionPageView();
  }, []);

  useEffect(() => {
    trackExperienceSubmissionStepEntered(stepId, currentStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  function setDetailField(key: string, value: DetailValue) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDetailMulti(key: string, value: string, exclusiveValue?: string) {
    const current: string[] = getArray(details, key);
    let next: string[];

    if (exclusiveValue && value === exclusiveValue) {
      next = current.includes(value) ? [] : [exclusiveValue];
    } else {
      const withoutExclusive = exclusiveValue ? current.filter((v) => v !== exclusiveValue) : current;
      next = withoutExclusive.includes(value)
        ? withoutExclusive.filter((v) => v !== value)
        : [...withoutExclusive, value];
    }

    setDetailField(key, next);
  }

  function isStepValid(step: StepId): boolean {
    switch (step) {
      case "type":
        return category !== null;
      case "business":
        return (
          !!businessName.trim() &&
          !!contactName.trim() &&
          /\S+@\S+\.\S+/.test(email)
        );
      case "experience":
        return !!experienceTitle.trim() && !!fullDescription.trim();
      case "details": {
        if (!category) return false;
        return DETAIL_FIELDS[category].every((f) => {
          const value = details[f.key];
          if (f.type === "multiselect") return Array.isArray(value) && value.length > 0;
          if (f.type === "yesno") return typeof value === "boolean";
          return !!value && String(value).trim().length > 0;
        });
      }
      case "logistics":
        return (
          !!basePrice.trim() &&
          !!priceType &&
          !!duration.trim() &&
          !!meetingPoint.trim()
        );
      case "photos":
        return true;
      case "message":
        return !!captchaToken;
      default:
        return true;
    }
  }

  const currentStepValid = isStepValid(stepId);

  function goNext() {
    if (!currentStepValid) return;

    if (stepId === "message") {
      handleSubmit();
      return;
    }

    setDirection(1);
    setCurrentStep((s) => s + 1);
  }

  function goBack() {
    if (currentStep === 0) return;
    trackExperienceSubmissionStepBack(stepId, currentStep);
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  }

  async function handleSubmit() {
    if (!category) return;

    setStatus("sending");

    try {

      const response = await fetch("/api/experience-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnstileToken: captchaToken,
          businessName,
          contactName,
          email,
          phone,
          category,
          experienceTitle,
          shortDescription,
          fullDescription,
          details,
          basePrice,
          priceType,
          duration,
          minParticipants,
          maxParticipants,
          meetingPoint,
          availabilityNotes,
          photoDelivery,
          photoLink,
          message,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setStatus("error");
        trackExperienceSubmissionError(data.error || "unknown");
        return;
      }

      setStatus("success");
      trackExperienceSubmissionSubmitted(category);

    } catch (err) {
      console.error("experience-submission submit failed:", err);
      setStatus("error");
      trackExperienceSubmissionError("network");
    }
  }

  function selectCategory(value: Category) {
    setCategory(value);
    setDetails({});
    trackExperienceSubmissionTypeSelected(value);
  }

  // =======================================================
  // SUCCESS
  // =======================================================

  if (status === "success") {
    return (
      <main className="h-dvh flex items-center justify-center bg-[#0C0C0C] text-white px-6 text-center">
        <p className="text-xl md:text-2xl font-light max-w-md leading-relaxed">
          Grazie — abbiamo ricevuto la tua proposta e ti ricontatteremo
          personalmente a breve.
        </p>
      </main>
    );
  }

  // =======================================================
  // STEP CONTENT
  // =======================================================

  function renderStep() {
    switch (stepId) {

      case "type":
        return (
          <div className="grid gap-3">
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <button
                type="button"
                key={value}
                onClick={() => selectCategory(value)}
                className={`min-w-0 border rounded-2xl px-6 py-5 text-left transition-all duration-500 ease-out ${
                  category === value
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 hover:border-white/40"
                }`}
              >
                <span className="block text-base font-light break-words">{label}</span>
              </button>
            ))}
          </div>
        );

      case "business":
        return (
          <div className="space-y-5">
            <TextField label="Nome della tua attività" value={businessName} onChange={setBusinessName} />
            <TextField label="Il tuo nome" value={contactName} onChange={setContactName} />
            <TextField label="Email" value={email} onChange={setEmail} type="email" />
            <TextField label="Telefono / WhatsApp" value={phone} onChange={setPhone} type="tel" />
          </div>
        );

      case "experience":
        return (
          <div className="space-y-5">
            <TextField label="Titolo dell'esperienza" value={experienceTitle} onChange={setExperienceTitle} />
            <TextAreaField
              label="Descrizione breve (una frase)"
              value={shortDescription}
              onChange={setShortDescription}
            />
            <TextAreaField
              label="Descrizione completa — cosa vivrà l'ospite?"
              value={fullDescription}
              onChange={setFullDescription}
            />
          </div>
        );

      case "details": {
        if (!category) return null;

        const fields = DETAIL_FIELDS[category];

        return (
          <div className="space-y-5">
            {fields.map((field) => {

              if (field.type === "text") {
                return (
                  <TextField
                    key={field.key}
                    label={field.label}
                    value={getString(details, field.key)}
                    onChange={(v) => setDetailField(field.key, v)}
                  />
                );
              }

              if (field.type === "textarea") {
                return (
                  <TextAreaField
                    key={field.key}
                    label={field.label}
                    value={getString(details, field.key)}
                    onChange={(v) => setDetailField(field.key, v)}
                  />
                );
              }

              if (field.type === "select") {
                return (
                  <SelectButtons
                    key={field.key}
                    label={field.label}
                    value={getString(details, field.key)}
                    onChange={(v) => setDetailField(field.key, v)}
                    options={field.options || []}
                  />
                );
              }

              if (field.type === "multiselect") {
                return (
                  <MultiSelectButtons
                    key={field.key}
                    label={field.label}
                    values={getArray(details, field.key)}
                    onToggle={(v) => toggleDetailMulti(field.key, v, field.exclusiveValue)}
                    options={field.options || []}
                  />
                );
              }

              // yesno
              return (
                <YesNoButtons
                  key={field.key}
                  label={field.label}
                  value={getBoolean(details, field.key)}
                  onChange={(v) => setDetailField(field.key, v)}
                />
              );
            })}
          </div>
        );
      }

      case "logistics":
        return (
          <div className="space-y-5">
            <TextField label="Prezzo base (€)" value={basePrice} onChange={setBasePrice} />
            <SelectButtons
              label="Il prezzo è..."
              value={priceType}
              onChange={setPriceType}
              options={PRICE_TYPE_OPTIONS}
            />
            <TextField label="Durata indicativa" value={duration} onChange={setDuration} />
            <TextField
              label="Numero minimo partecipanti (facoltativo)"
              value={minParticipants}
              onChange={setMinParticipants}
            />
            <TextField
              label="Numero massimo partecipanti (facoltativo)"
              value={maxParticipants}
              onChange={setMaxParticipants}
            />
            <TextField label="Punto d'incontro / location" value={meetingPoint} onChange={setMeetingPoint} />
            <TextAreaField
              label="Disponibilità indicativa (es. da aprile a ottobre, tutti i giorni tranne lunedì)"
              value={availabilityNotes}
              onChange={setAvailabilityNotes}
            />
          </div>
        );

      case "photos":
        return (
          <div className="space-y-5">
            <SelectButtons
              label="Come preferisci inviarci le fotografie?"
              value={photoDelivery}
              onChange={setPhotoDelivery}
              options={PHOTO_DELIVERY_OPTIONS}
            />
            <TextField
              label="Link alle foto, se disponibile"
              value={photoLink}
              onChange={setPhotoLink}
              type="url"
            />
          </div>
        );

      case "message":
        return (
          <div className="space-y-6">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Messaggio facoltativo"
              rows={5}
              className={inputClass}
            />

            <div className="flex justify-center">
              <Turnstile
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onVerify={(token) => setCaptchaToken(token)}
              />
            </div>

            {status === "error" && (
              <p className="text-center text-red-400 text-sm">
                Qualcosa è andato storto — riprova, oppure scrivici direttamente su WhatsApp.
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  const categoryLabel = category
    ? CATEGORY_OPTIONS.find((c) => c.value === category)?.label
    : null;

  const headerTitle =
    stepId === "details" && categoryLabel
      ? `${STEP_TITLES.details} — ${categoryLabel}`
      : STEP_TITLES[stepId];

  // =======================================================
  // SHELL
  // =======================================================

  return (
    <main className="h-dvh overflow-hidden bg-[#0C0C0C] text-white flex flex-col break-words">

      {/* HEADER: back (solo dal 2° step in poi) + progress + counter */}
      <div className="px-6 pt-4 pb-2 md:pt-6 md:pb-3 max-w-xl w-full mx-auto shrink-0">

        <div className="flex items-center gap-4 mb-2 md:mb-4">

          {currentStep > 0 && (
            <button
              type="button"
              onClick={goBack}
              aria-label="Indietro"
              className="text-2xl opacity-70 hover:opacity-100 transition-opacity"
            >
              &#8592;
            </button>
          )}

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
          Portovenere Experience — Per gli operatori
        </p>

        <h1 className="text-xl md:text-4xl font-light leading-tight">
          {headerTitle}
        </h1>

      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-between gap-3 md:gap-6 overflow-y-auto pt-4 pb-4 md:pb-6 px-6 max-w-xl w-full mx-auto">

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 shrink-0">

          {currentStep > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="w-1/3 rounded-full px-2 py-3.5 uppercase tracking-[0.25em] text-xs border border-white/20 text-white/70 hover:border-white/40 hover:text-white transition-all duration-500"
            >
              Indietro
            </button>
          )}

          <button
            type="button"
            onClick={goNext}
            disabled={!currentStepValid || status === "sending"}
            className={`${currentStep > 0 ? "w-2/3" : "w-full"} rounded-full px-4 py-3.5 uppercase tracking-[0.2em] text-[11px] leading-snug text-center transition-all duration-500 ${
              currentStepValid && status !== "sending"
                ? "bg-white text-black hover:scale-[1.02]"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            {stepId === "message"
              ? status === "sending"
                ? "Invio in corso..."
                : "Invia esperienza"
              : "Avanti"}
          </button>

        </div>
      </div>
    </main>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-2">
        {label}
      </p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-2">
        {label}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={inputClass}
      />
    </div>
  );
}

function SelectButtons({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-2">
        {label}
      </p>
      <div className="grid gap-2.5">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onChange(option)}
            className={`min-w-0 border rounded-2xl px-5 py-3 text-left text-sm break-words transition-all duration-500 ease-out ${
              value === option
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 hover:border-white/40"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiSelectButtons({
  label,
  values,
  onToggle,
  options,
}: {
  label: string;
  values: string[];
  onToggle: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-2">
        {label}
      </p>
      <div className="grid gap-2.5">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              type="button"
              key={option}
              onClick={() => onToggle(option)}
              className={`min-w-0 border rounded-2xl px-5 py-3 text-left text-sm break-words transition-all duration-500 ease-out flex items-center justify-between gap-2 ${
                active
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/5 hover:border-white/40"
              }`}
            >
              <span>{option}</span>
              {active && <span aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YesNoButtons({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-2">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {[true, false].map((v) => (
          <button
            type="button"
            key={String(v)}
            onClick={() => onChange(v)}
            className={`min-w-0 border rounded-2xl px-5 py-3 text-center text-sm transition-all duration-500 ease-out ${
              value === v
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 hover:border-white/40"
            }`}
          >
            {v ? "Sì" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}
