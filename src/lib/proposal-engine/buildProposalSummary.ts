import { MOOD_DESCRIPTIONS } from "./summary/moodDescriptions";
import { EXPERIENCE_DESCRIPTIONS } from "./summary/experienceDescriptions";
import { sentenceBuilder } from "./summary/sentenceBuilder";

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

  return `Created exclusively for ${guestSentence}, this proposal has been crafted around ${experienceSentence}. Every experience has been carefully selected to reflect ${moodSentence}, creating a Riviera journey that feels entirely personal.`;

}