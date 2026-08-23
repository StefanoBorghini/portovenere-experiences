"use client";

import { useEffect, useState } from "react";
import Turnstile from "react-turnstile";
import { motion, AnimatePresence } from "framer-motion";
import {
  trackPartnerPageView,
  trackPartnerStepEntered,
  trackPartnerStepBack,
  trackPartnerTypeSelected,
  trackPartnerPlanSelected,
  trackPartnerApplicationSubmitted,
  trackPartnerApplicationError,
} from "@/lib/analytics/gtag";
import { LANGUAGE_OPTIONS } from "@/lib/config/languageOptions";

// =========================================================
// Wizard step-by-step, stesso linguaggio visivo e stessa
// meccanica di src/app/craft-your-experience/page.tsx. Ricalca
// 1:1 le 7 sezioni delle "schede attività" cartacee di
// Portovenere.com (Accommodation / Experiences & Activities /
// Restaurant & Food / Services / Shops): dati attività,
// presentazione, info generali, dettagli per categoria, contatto
// e prenotazione, foto e materiali, autorizzazione — piu' i due
// step aggiuntivi specifici di questo wizard (piano di interesse,
// messaggio finale + invio). Pagina solo in italiano, testo
// hardcoded qui direttamente — niente useTranslations()/site_copy.
// Nessun menu di navigazione, nessun pulsante indietro al primo
// step (non c'e' nessuno step precedente a cui tornare).
// =========================================================

const STEP_IDS = [
  "type",
  "business",
  "presentation",
  "general",
  "details",
  "booking",
  "photos",
  "consent",
  "plan",
  "message",
] as const;
type StepId = (typeof STEP_IDS)[number];

const STEP_TITLES: Record<StepId, string> = {
  type: "Che tipo di attività hai?",
  business: "Informazioni sulla tua attività",
  presentation: "Presentaci la tua attività",
  general: "Informazioni generali",
  details: "Qualche dettaglio in più",
  booking: "Contatto e prenotazione",
  photos: "Foto e materiali",
  consent: "Autorizzazione",
  plan: "Quale piano ti interessa?",
  message: "C'è altro che dovremmo sapere?",
};

type Category =
  | "accommodation"
  | "experiences_activities"
  | "restaurant_food"
  | "services"
  | "shops";

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "accommodation", label: "Alloggio (Hotel, B&B, Appartamenti...)" },
  { value: "experiences_activities", label: "Esperienze e Attività" },
  { value: "restaurant_food", label: "Ristorante / Food" },
  { value: "services", label: "Servizi" },
  { value: "shops", label: "Negozi" },
];

interface DetailField {
  key: string;
  label: string;
  // "yesno-bool" e' come "yesno" ma salva un booleano vero (true/false)
  // invece della stringa "yes"/"no" — usato solo dove esplicitamente
  // richiesto (Negozi), per non cambiare il formato dei campi yesno
  // gia' esistenti fuori da questo step (es. "photos", che ha i suoi
  // YesNoButtons separati e non passa da DETAIL_FIELDS).
  type: "text" | "textarea" | "select" | "multiselect" | "yesno" | "yesno-bool";
  options?: string[];
}

const DETAIL_FIELDS: Record<Category, DetailField[]> = {
  accommodation: [
    {
      key: "typology",
      label: "Tipologia",
      type: "select",
      options: ["Hotel", "B&B", "Guesthouse", "Appartamento", "Villa", "Altro"],
    },
    { key: "roomsCount", label: "Numero camere / unità", type: "text" },
    { key: "mainServices", label: "Servizi principali", type: "text" },
    { key: "checkInOut", label: "Check-in / Check-out", type: "text" },
    {
      key: "amenities",
      label: "Servizi",
      type: "multiselect",
      options: ["Colazione", "Wi-Fi", "Parcheggio", "Vista mare", "Pet friendly", "Altro"],
    },
  ],
  experiences_activities: [
    { key: "experienceType", label: "Tipologia di esperienza / attività", type: "text" },
    { key: "shortDescription", label: "Descrizione sintetica dell'esperienza", type: "textarea" },
    { key: "duration", label: "Durata indicativa", type: "text" },
    { key: "participants", label: "Numero minimo / massimo partecipanti", type: "text" },
    { key: "meetingPoint", label: "Punto di partenza / incontro", type: "text" },
    {
      key: "availability",
      label: "Disponibilità",
      type: "select",
      options: ["Tutto l'anno", "Stagionale", "Su richiesta"],
    },
    { key: "advanceBooking", label: "Prenotazione anticipata necessaria?", type: "yesno" },
  ],
  restaurant_food: [
    {
      key: "typology",
      label: "Tipologia",
      type: "select",
      options: ["Ristorante", "Bar", "Enoteca", "Gelateria", "Bakery", "Altro"],
    },
    { key: "cuisineType", label: "Tipo di cucina / proposta", type: "text" },
    { key: "specialties", label: "Specialità / piatti distintivi", type: "text" },
    {
      key: "amenities",
      label: "Servizi",
      type: "multiselect",
      options: ["Prenotazione", "Dehors", "Vista mare", "Take-away", "Vegetariano/Vegano", "Altro"],
    },
  ],
  services: [
    { key: "serviceType", label: "Tipologia di servizio", type: "text" },
    { key: "servicesOffered", label: "Servizi offerti", type: "text" },
    { key: "areaServed", label: "Area servita", type: "text" },
    {
      key: "availability",
      label: "Disponibilità",
      type: "select",
      options: ["Tutto l'anno", "Stagionale", "Su richiesta"],
    },
    {
      key: "requestMethod",
      label: "Modalità di richiesta",
      type: "multiselect",
      options: ["Telefono", "WhatsApp", "Email", "Sito", "Altro"],
    },
  ],
  shops: [
    { key: "shopType", label: "Tipologia di negozio", type: "text" },
    { key: "mainProducts", label: "Prodotti principali", type: "text" },
    { key: "localProducts", label: "Prodotti locali / artigianali", type: "yesno-bool" },
    { key: "onlineShipping", label: "Spedizione / acquisto online", type: "yesno-bool" },
    { key: "distinctiveBrands", label: "Marchi o produzioni distintive", type: "text" },
  ],
};

const OPENING_PERIOD_OPTIONS = ["Annuale", "Stagionale"];
const CTA_DESTINATION_OPTIONS = ["Sito web", "WhatsApp", "Telefono", "Email", "Prenotazione", "Altro"];
const PHOTO_DELIVERY_OPTIONS = ["Email", "WhatsApp", "Drive/Dropbox", "Altro"];

const CONSENT_TEXT =
  "Dichiaro che le informazioni fornite sono corrette e di disporre dei diritti necessari sui materiali trasmessi. Autorizzo Portovenere.com a utilizzare informazioni, logo e materiali fotografici forniti per la creazione, pubblicazione e promozione della scheda dell'attività sui propri canali digitali, salvo successiva richiesta di modifica o rimozione.";

interface PlanOption {
  value: "base" | "premium" | "signature" | "not_sure";
  name?: string;
  price?: string;
  tagline?: string;
  label?: string;
}

const PLAN_OPTIONS: PlanOption[] = [
  { value: "base", name: "Base", price: "€120 / anno", tagline: "Per chi vuole esserci." },
  { value: "premium", name: "Premium", price: "€240 / anno", tagline: "Per chi vuole essere promosso." },
  {
    value: "signature",
    name: "Signature",
    price: "Su richiesta",
    tagline: "Solo su candidatura — un'esperienza in evidenza nel configuratore.",
  },
  { value: "not_sure", label: "Non sono sicuro/a" },
];

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

// Le sezioni "profile"/"details"/"booking"/"materials" mescolano
// stringhe (input di testo) e array (multiselect) nello stesso
// oggetto — questi due helper restringono il tipo esatto atteso da
// ciascun campo, invece di sparpagliare cast inline in ogni JSX.
// I due helper accettano anche il booleano (solo "details"/Step 5 lo
// usa davvero, per i campi "yesno-bool" — profile/booking/materials
// restano string | string[] come prima, non toccati da questa
// modifica; il tipo piu' ampio qui e' solo per poter riusare le stesse
// funzioni su entrambi senza duplicarle).
function getString(obj: Record<string, string | string[] | boolean>, key: string): string {
  const value = obj[key];
  return typeof value === "string" ? value : "";
}

function getArray(obj: Record<string, string | string[] | boolean>, key: string): string[] {
  const value = obj[key];
  return Array.isArray(value) ? value : [];
}

function getBoolean(obj: Record<string, string | string[] | boolean>, key: string): boolean | undefined {
  const value = obj[key];
  return typeof value === "boolean" ? value : undefined;
}

export default function BecomePartnerClient() {

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const [category, setCategory] = useState<Category | null>(null);

  // Campi che mappano direttamente su colonne del DB (vedi
  // /api/partner-application) — il resto vive nei quattro oggetti
  // "sezione" qui sotto, uno per ciascuna sezione della scheda
  // cartacea che non ha gia' una colonna dedicata.
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");

  const [profile, setProfile] = useState<Record<string, string | string[]>>({});
  const [details, setDetails] = useState<Record<string, string | string[] | boolean>>({});
  const [booking, setBooking] = useState<Record<string, string | string[]>>({});
  const [materials, setMaterials] = useState<Record<string, string | string[]>>({});

  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentFullName, setConsentFullName] = useState("");

  const [planInterest, setPlanInterest] = useState<PlanOption["value"]>("not_sure");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const stepId: StepId = STEP_IDS[currentStep];
  const totalSteps = STEP_IDS.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    trackPartnerPageView();
  }, []);

  useEffect(() => {
    trackPartnerStepEntered(stepId, currentStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  function setProfileField(key: string, value: string | string[]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function setDetailField(key: string, value: string | string[] | boolean) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  function setBookingField(key: string, value: string | string[]) {
    setBooking((prev) => ({ ...prev, [key]: value }));
  }

  function setMaterialsField(key: string, value: string | string[]) {
    setMaterials((prev) => ({ ...prev, [key]: value }));
  }

  function toggleLanguage(value: string) {
    const current: string[] = getArray(profile, "languages");
    setProfileField(
      "languages",
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    );
  }

  function toggleDetailMulti(key: string, value: string) {
    const current: string[] = getArray(details, key);
    setDetailField(
      key,
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    );
  }

  function isStepValid(step: StepId): boolean {
    switch (step) {
      case "type":
        return category !== null;
      case "business":
        return (
          !!companyName.trim() &&
          !!contactPerson.trim() &&
          /\S+@\S+\.\S+/.test(email)
        );
      case "presentation":
        return !!String(getString(profile, "description")).trim();
      case "general":
        return !!profile.openingPeriod && !!String(getString(profile, "openingHours")).trim();
      case "details": {
        if (!category) return false;
        return DETAIL_FIELDS[category].every((f) => {
          const value = details[f.key];
          if (f.type === "multiselect") return Array.isArray(value) && value.length > 0;
          if (f.type === "yesno-bool") return typeof value === "boolean";
          return !!value && String(value).trim().length > 0;
        });
      }
      case "booking":
        return !!booking.ctaDestination && !!String(getString(booking, "ctaContact")).trim();
      case "photos":
        return true;
      case "consent":
        return consentAccepted && !!consentFullName.trim();
      case "plan":
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
    trackPartnerStepBack(stepId, currentStep);
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  }

  async function handleSubmit() {
    if (!category) return;

    setStatus("sending");

    try {

      const response = await fetch("/api/partner-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnstileToken: captchaToken,
          companyName,
          contactName: contactPerson,
          email,
          phone,
          category,
          profile,
          details,
          booking,
          materials,
          consentAccepted,
          consentFullName,
          planInterest,
          website,
          instagram,
          message,
          locale: "it",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setStatus("error");
        trackPartnerApplicationError(data.error || "unknown");
        return;
      }

      setStatus("success");
      trackPartnerApplicationSubmitted(planInterest, category);

    } catch (err) {
      console.error("partner-application submit failed:", err);
      setStatus("error");
      trackPartnerApplicationError("network");
    }
  }

  function selectCategory(value: Category) {
    setCategory(value);
    setDetails({});
    trackPartnerTypeSelected(value);
  }

  function selectPlan(plan: PlanOption["value"]) {
    setPlanInterest(plan);
    if (plan !== "not_sure") trackPartnerPlanSelected(plan);
  }

  // =======================================================
  // SUCCESS
  // =======================================================

  if (status === "success") {
    return (
      <main className="h-dvh flex items-center justify-center bg-[#0C0C0C] text-white px-6 text-center">
        <p className="text-xl md:text-2xl font-light max-w-md leading-relaxed">
          Grazie — abbiamo ricevuto la tua candidatura e ti ricontatteremo
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
            <TextField label="Nome dell'attività" value={companyName} onChange={setCompanyName} />
            <TextField
              label="Ragione sociale (facoltativa)"
              value={getString(profile, "legalName")}
              onChange={(v) => setProfileField("legalName", v)}
            />
            <TextField
              label="Partita IVA / Codice Fiscale (per fatturazione)"
              value={getString(profile, "vatNumber")}
              onChange={(v) => setProfileField("vatNumber", v)}
            />
            <TextField
              label="Indirizzo / Località"
              value={getString(profile, "address")}
              onChange={(v) => setProfileField("address", v)}
            />
            <TextField label="Referente e ruolo" value={contactPerson} onChange={setContactPerson} />
            <TextField label="Telefono" value={phone} onChange={setPhone} type="tel" />
            <TextField
              label="WhatsApp"
              value={getString(profile, "whatsapp")}
              onChange={(v) => setProfileField("whatsapp", v)}
              type="tel"
            />
            <TextField label="Email" value={email} onChange={setEmail} type="email" />
            <TextField label="Sito web" value={website} onChange={setWebsite} type="url" />
            <TextField label="Instagram / Facebook" value={instagram} onChange={setInstagram} />
          </div>
        );

      case "presentation":
        return (
          <div className="space-y-5">
            <TextAreaField
              label="Descrivi brevemente la tua attività. Cosa offrite e cosa vi caratterizza?"
              value={getString(profile, "description")}
              onChange={(v) => setProfileField("description", v)}
            />
            <TextAreaField
              label="Cosa vorresti che un visitatore sapesse di voi?"
              value={getString(profile, "visitorMessage")}
              onChange={(v) => setProfileField("visitorMessage", v)}
            />
          </div>
        );

      case "general":
        return (
          <div className="space-y-5">
            <SelectButtons
              label="Periodo di apertura"
              value={getString(profile, "openingPeriod")}
              onChange={(v) => setProfileField("openingPeriod", v)}
              options={OPENING_PERIOD_OPTIONS}
            />
            {profile.openingPeriod === "Stagionale" && (
              <TextField
                label="Periodo stagionale"
                value={getString(profile, "seasonalPeriod")}
                onChange={(v) => setProfileField("seasonalPeriod", v)}
              />
            )}
            <TextField
              label="Giorni e orari di apertura"
              value={getString(profile, "openingHours")}
              onChange={(v) => setProfileField("openingHours", v)}
            />
            <MultiSelectButtons
              label="Lingue parlate"
              values={getArray(profile, "languages")}
              onToggle={toggleLanguage}
              options={LANGUAGE_OPTIONS}
            />
            <TextAreaField
              label="Accessibilità / informazioni utili"
              value={getString(profile, "accessibilityInfo")}
              onChange={(v) => setProfileField("accessibilityInfo", v)}
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
                    onToggle={(v) => toggleDetailMulti(field.key, v)}
                    options={field.options || []}
                  />
                );
              }

              if (field.type === "yesno-bool") {
                return (
                  <YesNoBooleanButtons
                    key={field.key}
                    label={field.label}
                    value={getBoolean(details, field.key)}
                    onChange={(v) => setDetailField(field.key, v)}
                  />
                );
              }

              // yesno
              return (
                <YesNoButtons
                  key={field.key}
                  label={field.label}
                  value={getString(details, field.key)}
                  onChange={(v) => setDetailField(field.key, v)}
                />
              );
            })}
          </div>
        );
      }

      case "booking":
        return (
          <div className="space-y-5">
            <SelectButtons
              label="Dove deve portare il pulsante principale?"
              value={getString(booking, "ctaDestination")}
              onChange={(v) => setBookingField("ctaDestination", v)}
              options={CTA_DESTINATION_OPTIONS}
            />
            <TextField
              label="Link / numero / contatto da utilizzare"
              value={getString(booking, "ctaContact")}
              onChange={(v) => setBookingField("ctaContact", v)}
            />
          </div>
        );

      case "photos":
        return (
          <div className="space-y-5">
            <SelectButtons
              label="Come preferisci inviarci le fotografie?"
              value={getString(materials, "photoDelivery")}
              onChange={(v) => setMaterialsField("photoDelivery", v)}
              options={PHOTO_DELIVERY_OPTIONS}
            />
            <YesNoButtons
              label="Logo disponibile?"
              value={getString(materials, "logoAvailable")}
              onChange={(v) => setMaterialsField("logoAvailable", v)}
            />
            <YesNoButtons
              label="Fotografie professionali?"
              value={getString(materials, "professionalPhotos")}
              onChange={(v) => setMaterialsField("professionalPhotos", v)}
            />
            <TextField
              label="Link ai materiali, se disponibile"
              value={getString(materials, "materialsLink")}
              onChange={(v) => setMaterialsField("materialsLink", v)}
              type="url"
            />
          </div>
        );

      case "consent":
        return (
          <div className="space-y-6">
            <p className="text-zinc-400 text-sm leading-relaxed">{CONSENT_TEXT}</p>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-white cursor-pointer"
              />
              <span className="text-sm text-zinc-200">Accetto</span>
            </label>

            <TextField label="Nome e cognome" value={consentFullName} onChange={setConsentFullName} />
          </div>
        );

      case "plan":
        return (
          <div className="grid gap-3">
            {PLAN_OPTIONS.map((plan) => (
              <button
                type="button"
                key={plan.value}
                onClick={() => selectPlan(plan.value)}
                className={`min-w-0 border rounded-2xl px-6 py-5 text-left transition-all duration-500 ease-out ${
                  planInterest === plan.value
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 hover:border-white/40"
                }`}
              >
                {plan.value === "not_sure" ? (
                  <span className="block text-base font-light break-words">{plan.label}</span>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <span className="min-w-0 break-words text-base font-light">{plan.name}</span>
                      <span
                        className={`min-w-0 break-words text-sm ${
                          planInterest === plan.value ? "text-black/60" : "text-zinc-500"
                        }`}
                      >
                        {plan.price}
                      </span>
                    </div>
                    <span
                      className={`block text-sm mt-1 break-words ${
                        planInterest === plan.value ? "text-black/60" : "text-zinc-500"
                      }`}
                    >
                      {plan.tagline}
                    </span>
                  </>
                )}
              </button>
            ))}
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
                : "Invia candidatura"
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
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm mb-2">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {["yes", "no"].map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => onChange(v)}
            className={`min-w-0 border rounded-2xl px-5 py-3 text-center text-sm transition-all duration-500 ease-out ${
              value === v
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 hover:border-white/40"
            }`}
          >
            {v === "yes" ? "Sì" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

// Stessa identica UI di YesNoButtons, ma legge/scrive un booleano vero
// invece della stringa "yes"/"no" — usato solo dai campi Step 5
// dichiarati "yesno-bool" (Negozi), per non cambiare il formato dei
// campi yesno esistenti altrove nel form (es. "photos").
function YesNoBooleanButtons({
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
