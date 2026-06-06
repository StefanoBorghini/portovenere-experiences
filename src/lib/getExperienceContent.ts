import {
  experienceContent,
} from "@/data/experienceContent";

export function getExperienceContent(
  experienceId: string
) {

  return experienceContent.find(
    (item) =>
      item.id === experienceId
  );
}

export function getExperiencePrice(
  experienceId: string
) {

  return (
    getExperienceContent(
      experienceId
    )?.basePrice || 0
  );
}