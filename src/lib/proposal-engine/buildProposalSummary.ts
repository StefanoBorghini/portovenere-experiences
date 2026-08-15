import { sentenceBuilder } from "./summary/sentenceBuilder";
import { EXPERIENCE_NAME_KEYS, MOOD_NAME_KEYS } from "@/lib/config/experienceTaxonomy";

// =====================================================
// DATE — formatta start_date/end_date in un'unica frase
// leggibile, gestendo i tre casi: stesso giorno, stesso mese,
// mesi/anni diversi. Nessun'assunzione su formato di input:
// accetta sia stringhe ISO che oggetti Date. Locale-aware —
// "August" diventa "agosto" gratis via Intl, senza Lara.
// =====================================================

function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  dateLocale: string
): string | null {

  if (!startDate) return null;

  const start = new Date(startDate);

  if (isNaN(start.getTime())) return null;

  const end =
    endDate ? new Date(endDate) : start;

  if (isNaN(end.getTime())) return null;

  const sameDay =
    start.toDateString() === end.toDateString();

  if (sameDay) {

    return start.toLocaleDateString(dateLocale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {

    const monthName =
      start.toLocaleDateString(dateLocale, { month: "long" });

    return `${monthName} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
  }

  // Mesi (o anni) diversi — data completa su entrambi gli estremi.
  const startLabel =
    start.toLocaleDateString(dateLocale, {
      month: "long",
      day: "numeric",
      year:
        start.getFullYear() !== end.getFullYear()
          ? "numeric"
          : undefined,
    });

  const endLabel =
    end.toLocaleDateString(dateLocale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return `${startLabel} – ${endLabel}`;
}

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

type TFunction = (key: string, values?: Record<string, string | number>) => string;

/**
 * Compone il riepilogo dinamico della proposal SENZA passare da Lara:
 * il template della frase e le 4 varianti di fascia oraria sono
 * tradotti UNA VOLTA tramite site_copy (vedi messages/en.json,
 * namespace proposal.summary), e i nomi di categorie/mood riusano le
 * stesse traduzioni gia' fatte per il configuratore
 * (configurator.experienceNames/moodNames) — l'unica cosa che cambia
 * da proposal a proposal sono i valori dinamici (ospiti, date,
 * QUALI categorie/mood), non le parole stesse, quindi non serve
 * (e sarebbe uno spreco) tradurre l'intera frase ad ogni generazione.
 */
export function buildProposalSummary(
  lead: any,
  proposal: any,
  t: TFunction,
  locale: string = "en"
) {

  const adults =
    Number(lead.guests) || 2;

  const children =
    Number(lead.children) || 0;

  // "12 adults" oppure "12 adults and 2 children" — niente bambini
  // menzionati affatto se non ce ne sono. Le singole parole (adult/
  // adults/child/children/"and") sono le stesse gia' tradotte per
  // l'hero della proposal (proposal.hero.*).
  const adultsPhrase =
    adults > 1
      ? t("proposal.hero.adultsCount", { count: adults })
      : t("proposal.hero.oneAdult", { count: adults });

  const guestSentence =
    children > 0
      ? t("proposal.hero.guestsWithChildren", {
          adults: adultsPhrase,
          children:
            children > 1
              ? t("proposal.hero.childrenCount", { count: children })
              : t("proposal.hero.oneChild", { count: children }),
        })
      : adultsPhrase;

  const moods =
    (lead.moods || []).map((m: string) => {
      const key = MOOD_NAME_KEYS[m];
      return key ? t(`configurator.moodNames.${key}`) : m;
    });

  const experiences =
    (lead.experiences || []).map((e: string) => {
      const key = EXPERIENCE_NAME_KEYS[e];
      return key ? t(`configurator.experienceNames.${key}`) : e;
    });

  const moodSentence =
    sentenceBuilder(moods, locale);

  const experienceSentence =
    sentenceBuilder(experiences, locale);

  // =====================================================
  // DATE + FASCIA ORARIA — entrambe opzionali, compaiono solo
  // se presenti sul lead. Se manca la data, niente frase; se
  // manca solo la fascia oraria, la frase sulle date resta
  // comunque completa senza di essa.
  // =====================================================

  const dateRangeLabel =
    formatDateRange(
      lead.start_date,
      lead.end_date,
      DATE_LOCALES[locale] ?? DATE_LOCALES.en
    );

  const timeSlotPhrase =
    lead.preferred_time
      ? t(`proposal.summary.timeSlotPhrase.${lead.preferred_time}`)
      : null;

  let dateClause = "";

  if (dateRangeLabel && timeSlotPhrase) {

    dateClause = t("proposal.summary.dateClauseWithTime", {
      dateRange: dateRangeLabel,
      timeSlotPhrase,
    });

  } else if (dateRangeLabel) {

    dateClause = t("proposal.summary.dateClauseDateOnly", {
      dateRange: dateRangeLabel,
    });

  } else if (timeSlotPhrase) {

    dateClause = t("proposal.summary.dateClauseTimeOnly", {
      timeSlotPhrase,
    });
  }

  return t("proposal.summary.template", {
    guestSentence,
    dateClause,
    experienceSentence,
    moodSentence,
  });

}
