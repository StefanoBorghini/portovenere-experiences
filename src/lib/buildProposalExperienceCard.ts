import { getExperienceImage } from "./getExperienceImage";

export function buildProposalExperienceCard(
  experience: any
) {
  return {

    id: experience.id,

    title: experience.title,

    image: getExperienceImage(experience),

    description:
      experience.short_description ??
      experience.description ??
      "",


    experience,

  };
}