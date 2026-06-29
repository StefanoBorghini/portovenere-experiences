export function buildProposalSummary(
  lead: any,
  generatedProposal: any
) {
  const name =
    lead?.first_name || "you";

  return `Curated for ${name}.`;
}