export function buildProposalSummary(
  lead: any,
  generatedProposal: any
) {
  // =====================================================
  // BASIC DATA
  // =====================================================

  const name =
    lead?.first_name ||
    lead?.name ||
    "you";

  const guests =
    lead?.guests || 2;

  const hasChildren =
    lead?.traveling_with_children;

  // =====================================================
  // EXPERIENCES
  // =====================================================

  const experiences =
    lead?.experiences || [];

  const experienceText =
    experiences.length
      ? experiences.join(", ")
      : "curated Riviera experiences";

  // =====================================================
  // MOODS
  // =====================================================

  const moods =
    lead?.moods || [];

  const moodText =
    moods.length
      ? moods.join(", ")
      : "relaxation and authenticity";

  // =====================================================
  // CHILDREN
  // =====================================================

  const childrenText =
    hasChildren
      ? "including children"
      : "";

  // =====================================================
  // SUMMARY
  // =====================================================

  return `
Curated exclusively for ${name}.

Designed for ${guests} guests ${childrenText}, this proposal combines ${experienceText} inspired by your preference for ${moodText}, creating a private Mediterranean experience crafted around your personal travel style.
`;
}