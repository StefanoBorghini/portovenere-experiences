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