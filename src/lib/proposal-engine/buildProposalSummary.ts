export function buildProposalSummary(
  lead: any,
  generatedProposal: any
) {

  const name =
    lead?.first_name ||
    lead?.name ||
    "you";

  const guests =
    Number(lead?.guests) || 2;

  const hasChildren =
    lead?.traveling_with_children;

  const moods =
    lead?.moods || [];

  const experiences =
    lead?.experiences || [];

  const featured =
    generatedProposal?.featuredExperience?.title;

  const moodText =
    moods.length
      ? moods.join(", ")
      : "authentic Mediterranean moments";

  const experienceText =
    experiences.length
      ? experiences.join(", ")
      : "private Riviera experiences";

  return `Created exclusively for ${name}, this proposal has been designed for ${guests} guest${guests > 1 ? "s" : ""}${hasChildren ? ", including children," : ","} combining ${experienceText}. Every recommendation has been carefully selected around your preference for ${moodText}, with ${featured} as the heart of your Riviera journey.`;

}