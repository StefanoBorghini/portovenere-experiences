import {
  buildProposalGallery,
} from "@/lib/buildProposalGallery";

import {
  calculateProposalPrice,
} from "@/lib/pricing";

// =====================================================
// BUILD RENDERER DATA
// =====================================================

export function buildRendererData({

  generatedProposal,

  lead,
}: any) {

  // ===================================================
  // GALLERY
  // ===================================================

  

  const rankedExperiences =

  generatedProposal
    ?.scoredExperiences || [];

  const galleryImages =

    buildProposalGallery({

      experiencesSelected:
        lead.experiences || [],

      moodsSelected:
        lead.moods || [],

      heroExperienceId:
        generatedProposal
          ?.featuredExperience?.id || "",
    });

  // ===================================================
  // ENHANCEMENTS
  // ===================================================

  const enhancements = [

    {

      image:
        galleryImages[0],

      title:
        "Private Transfer",

      description:
        "Private luxury transportation across the Riviera with curated pickup and drop-off experience.",
    },

    {

      image:
        galleryImages[1],

      title:
        "Boutique Stay",

      description:
        "Curated overnight stays in selected boutique properties and private hospitality locations.",
    },

    {

      image:
        galleryImages[2],

      title:
        "Personal Photographer",

      description:
        "Editorial-style Riviera photography throughout your curated private experience.",
    },

    {

      image:
        galleryImages[3],

      title:
        "Private Chef",

      description:
        "Elevated onboard culinary experiences designed around Mediterranean atmosphere.",
    },

    {

      image:
        galleryImages[4],

      title:
        "Sommelier Onboard",

      description:
        "Elevated onboard wine experiences designed around Mediterranean atmosphere.",
    },

    {

      image:
        galleryImages[5],

      title:
        "Live Onboard Music",

      description:
        "Live music performances curated around navigation and Mediterranean atmosphere.",
    },
  ];

  // ===================================================
  // INCLUDED EXPERIENCES
  // ===================================================

 const featuredCategory =
  generatedProposal
    ?.featuredExperience
    ?.category;

const featuredId =
  generatedProposal
    ?.featuredExperience
    ?.id;
console.log(
  "SECONDARY EXPERIENCES",
  rankedExperiences
    .filter(
      (e: any) =>
        e.category !== featuredCategory
    )
    .map(
      (e: any) => ({
        id: e.id,
        category: e.category,
      })
    )
);

console.log(
  "RANKED",
  rankedExperiences.map(
    (e: any) => ({
      id: e.id,
      category: e.category,
      score: e.finalScore,
    })
  )
);
const includedExperiences =

  rankedExperiences

    .filter(
      (experience: any) =>

        experience.id !==
        featuredId
    )

    .filter(
      (experience: any) =>

        experience.category !==
        featuredCategory
    )

    .slice(0, 3)

    .map((experience: any, index: number) => ({

      image:
        experience.featured_image ||
        galleryImages[index] ||
        "/images/default.webp",

      title:
        experience.title,

      description:
        experience.short_description ||
        experience.description ||
        "",

      details: [

        experience.operator,

        experience.category
          ?.replaceAll("_", " "),

        `From €${experience.base_price}`,
      ],
    }));
  // ===================================================
  // PRICE
  // ===================================================


const finalPrice = 2800;
  // ===================================================
  // RETURN
  // ===================================================

  return {

    galleryImages,

    enhancements,

    includedExperiences,

    finalPrice,
  };
}