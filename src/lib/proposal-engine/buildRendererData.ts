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

  const includedExperiences = [

    {

      image:
        galleryImages[0],

      title:
        "Sunset Riviera Aperitivo",

      description:
        "A private culinary moment designed around Mediterranean sunset atmosphere and slow coastal navigation.",

      details: [

        "Local wine selection",

        "Private onboard setup",

        "Sunset aperitivo",
      ],
    },

    {

      image:
        galleryImages[1],

      title:
        "Hidden Coves Escape",

      description:
        "Discover secluded Riviera locations accessible only through private coastal navigation.",

      details: [

        "Private navigation",

        "Hidden swimming spots",

        "Slow luxury atmosphere",
      ],
    },

    {

      image:
        galleryImages[2],

      title:
        "Cinematic Riviera Moments",

      description:
        "Curated Riviera experiences designed around cinematic atmosphere and Mediterranean storytelling.",

      details: [

        "Editorial atmosphere",

        "Private experience",

        "Mediterranean scenery",
      ],
    },
  ];

  // ===================================================
  // PRICE
  // ===================================================

  const finalPrice =

    calculateProposalPrice({

      selectedExperiences:
        generatedProposal.scoredExperiences || [],

      moodsSelected:
        lead.moods || [],

      guests:
        lead.guests,

      travelingWithChildren:
        lead.traveling_with_children || false,
    });

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