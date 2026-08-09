export function getExperienceImage(
  experience: any
) {
  return (
    experience.detail_image ||
    experience.hero_image ||
    experience.gallery?.find(
      (img: any) => img.active
    )?.image_url ||
    "/images/default.webp"
  );
}