import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getEvent, getEventTranslation } from "@/lib/supabase/eventRepository";
import { resolveEventOccurrences } from "@/lib/events/resolveEventOccurrences";
import { buildEventLink } from "@/lib/events/buildEventLink";
import { getLocalizedExperience } from "@/lib/translations/getLocalizedField";
import { getCurrentLocale } from "@/i18n/locale";

// =========================================================
// Pagina pubblica auto-generata per un evento — usata come link di
// fallback quando l'evento non ha un link_default/link_override
// personalizzato (vedi ProposalEvents.tsx). Mostra l'ELENCO di tutte
// le prossime occorrenze (fino a un anno da oggi), non solo la
// prossima — a differenza della card nella proposal page, che
// continua a mostrare solo la prossima occorrenza nelle date del
// cliente (quella resta per design: suggerimento puntuale, non un
// calendario).
//
// Nessuna route /[locale]/... qui: la lingua si risolve come nel
// resto del sito, via cookie/Accept-Language (getCurrentLocale) —
// stesso meccanismo gia' usato da results/proposal/[slug]/page.tsx.
// =========================================================

// Stessa mappa duplicata in ProposalEvents.tsx/buildProposalSummary.ts
// — nessun modulo condiviso esistente per questa costante.
const DATE_LOCALES: Record<string, string> = {
  en: "en-US",
  it: "it-IT",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  ru: "ru-RU",
  zh: "zh-CN",
  ja: "ja-JP",
};

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatEventDate(dateIso: string, locale: string): string {
  const date = new Date(`${dateIso}T00:00:00`);
  return date.toLocaleDateString(DATE_LOCALES[locale] ?? DATE_LOCALES.en, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const event = await getEvent(id);

  if (!event || !event.active) {
    notFound();
  }

  const locale = await getCurrentLocale();
  const t = await getTranslations("eventsPage");

  const translation = await getEventTranslation(id, locale);
  // event arriva da getEvent() con un tipo stretto (EventWithAvailability) —
  // getLocalizedExperience e' generico su Record<string, unknown>, stesso
  // cast gia' accettato altrove nel progetto (experienceRepository.ts/
  // enhancementRepository.ts lavorano con oggetti Supabase non tipizzati).
  const localized = getLocalizedExperience(event as any, translation, ["title", "description"]);

  const today = new Date();
  const oneYearOut = new Date(today);
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);

  const occurrences = resolveEventOccurrences(
    { link_default: event.link_default, weekdays: event.weekdays, dates: event.dates },
    toISODate(today),
    toISODate(oneYearOut)
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-2xl mx-auto">

        {event.image_url && (
          <img
            src={event.image_url}
            alt={localized.title}
            className="w-full h-[320px] object-cover rounded-[32px] mb-10"
          />
        )}

        <h1 className="text-4xl md:text-6xl font-light leading-[0.95] mb-8">
          {localized.title}
        </h1>

        {localized.description && (
          <p className="text-zinc-400 text-lg leading-relaxed mb-10">
            {localized.description}
          </p>
        )}

        <h2 className="uppercase tracking-[0.3em] text-zinc-500 text-xs mb-5">
          {t("upcomingDates")}
        </h2>

        {occurrences.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {occurrences.map((occurrence) => (
              <li
                key={occurrence.date}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4"
              >
                <span>{formatEventDate(occurrence.date, locale)}</span>
                {occurrence.link && (
                  <a
                    href={buildEventLink(occurrence.link, localized.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm uppercase tracking-[0.15em] text-white/70 hover:text-white"
                  >
                    {t("details")}
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500">{t("noUpcoming")}</p>
        )}

      </div>
    </main>
  );
}
