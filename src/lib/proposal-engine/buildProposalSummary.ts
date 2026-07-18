import { MOOD_DESCRIPTIONS } from "./summary/moodDescriptions";
import { EXPERIENCE_DESCRIPTIONS } from "./summary/experienceDescriptions";
import { sentenceBuilder } from "./summary/sentenceBuilder";

// =====================================================
// FASCIA ORARIA — stessa convenzione di preferredTime in
// generateProposal.ts ("morning" | "afternoon" | "sunset" |
// "full_day"), tradotta in una frase leggibile.
// =====================================================

const TIME_SLOT_PHRASES: Record<string, string> = {
  morning: "the morning",
  afternoon: "the afternoon",
  sunset: "sunset",
  full_day: "a full day",
};

// =====================================================
// DATE — formatta start_date/end_date in un'unica frase
// leggibile, gestendo i tre casi: stesso giorno, stesso mese,
// mesi/anni diversi. Nessun'assunzione su formato di input:
// accetta sia stringhe ISO che oggetti Date.
// =====================================================

function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
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

    return start.toLocaleDateString("en-US", {
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
      start.toLocaleDateString("en-US", { month: "long" });

    return `${monthName} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
  }

  // Mesi (o anni) diversi — data completa su entrambi gli estremi.
  const startLabel =
    start.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year:
        start.getFullYear() !== end.getFullYear()
          ? "numeric"
          : undefined,
    });

  const endLabel =
    end.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return `${startLabel} – ${endLabel}`;
}

export function buildProposalSummary(
  lead: any,
  proposal: any
) {

  const adults =
    Number(lead.guests) || 2;

  const children =
    Number(lead.children) || 0;

  // "12 adults" oppure "12 adults and 2 children" — niente
  // bambini menzionati affatto se non ce ne sono.
  const guestSentence =
    children > 0
      ? `${adults} adult${adults > 1 ? "s" : ""} and ${children} child${children > 1 ? "ren" : ""}`
      : `${adults} adult${adults > 1 ? "s" : ""}`;

  const moods =

    (lead.moods || [])

      .map(
        (m: string) =>
          MOOD_DESCRIPTIONS[m] || m
      );

  const experiences =

    (lead.experiences || [])

      .map(
        (e: string) =>
          EXPERIENCE_DESCRIPTIONS[e] || e
      );

  const moodSentence =
    sentenceBuilder(moods);

  const experienceSentence =
    sentenceBuilder(experiences);

  // =====================================================
  // DATE + FASCIA ORARIA — entrambe opzionali, compaiono solo
  // se presenti sul lead. Se manca la data, niente frase; se
  // manca solo la fascia oraria, la frase sulle date resta
  // comunque completa senza di essa.
  // =====================================================

  const dateRangeLabel =
    formatDateRange(lead.start_date, lead.end_date);

  const timeSlotLabel =
    lead.preferred_time
      ? TIME_SLOT_PHRASES[lead.preferred_time] || null
      : null;

  let dateClause = "";

  if (dateRangeLabel && timeSlotLabel) {

    dateClause =
      ` for ${dateRangeLabel}, in ${timeSlotLabel}`;

  } else if (dateRangeLabel) {

    dateClause =
      ` for ${dateRangeLabel}`;

  } else if (timeSlotLabel) {

    dateClause =
      `, in ${timeSlotLabel}`;
  }

  return `Created exclusively for ${guestSentence}${dateClause}, this proposal has been crafted around ${experienceSentence}. Every experience has been carefully selected to reflect ${moodSentence}, creating a Riviera journey that feels entirely personal.`;

}