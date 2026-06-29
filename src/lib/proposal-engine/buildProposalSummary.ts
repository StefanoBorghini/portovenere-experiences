import { MOOD_DESCRIPTIONS } from "./summary/moodDescriptions";
import { EXPERIENCE_DESCRIPTIONS } from "./summary/experienceDescriptions";
import { sentenceBuilder } from "./summary/sentenceBuilder";

export function buildProposalSummary(
  lead: any,
  proposal: any
) {

  const firstName =
    lead.first_name ||
    lead.name ||
    "you";

  const guests =
    Number(lead.guests) || 2;

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

  return `Created exclusively for ${firstName} and ${guests} guest${guests > 1 ? "s" : ""}, this proposal has been crafted around ${experienceSentence}. Every experience has been carefully selected to reflect ${moodSentence}, creating a Riviera journey that feels entirely personal.`;

}