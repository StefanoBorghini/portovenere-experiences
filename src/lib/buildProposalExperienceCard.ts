import { getExperienceImage } from "./getExperienceImage";

import { Experience } from "@/types/experience";
import { ProposalExperienceCard } from "@/types/proposal";

export function buildProposalExperienceCard(
  experience: Experience
): ProposalExperienceCard {

  return {

    id: experience.id,

    title: experience.title,

    image: getExperienceImage(experience),

    description:
      experience.short_description ??
      experience.description ??
      "",

    details: [

      experience.operator ?? "",

      experience.category?.replaceAll("_", " ") ?? "",

      `From €${experience.base_price}`,

    ],

    experience,

  };

}