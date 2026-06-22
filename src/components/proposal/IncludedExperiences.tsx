"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Section
from "@/components/layout/Section";

import SectionContainer
from "@/components/layout/SectionContainer";

import SectionHeader
from "@/components/layout/SectionHeader";

import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

// =====================================================
// TYPES
// =====================================================

interface ExperienceCard {

  image: string;

  title: string;

  description: string;

  details: string[];
}

interface IncludedExperiencesProps {

  experiences: ExperienceCard[];
}

// =====================================================
// COMPONENT
// =====================================================

export default function IncludedExperiences({

  experiences,

}: IncludedExperiencesProps) {

  const [
  selectedExperiences,
  setSelectedExperiences,
] = useState<string[]>(

  experiences.map(
    experience => experience.title
  )

);

function toggleExperience(
title: string
) {

if (
selectedExperiences.includes(
  title
)
) {

setSelectedExperiences(

  selectedExperiences.filter(
    item => item !== title
  )

);

} else {

setSelectedExperiences([
  ...selectedExperiences,
  title,
]);

}

}

return (


    
    <Section
      className="
        bg-black
        overflow-hidden
        relative
      "
    >

      {/* ATMOSPHERIC BACKGROUND */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.03]
          pointer-events-none
          bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]
        "
      />

      <SectionContainer
        className="
          relative
          z-10
        "
      >

        {/* HEADER */}

        <motion.div

          variants={fadeReveal}

          initial="initial"

          whileInView="animate"

          viewport={{
            once: true,
            amount: 0.3,
          }}

          transition={{
            duration: 1.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >

          <SectionHeader
            label="Included Experiences"
            title="Curated Riviera Moments"
          />

        </motion.div>

        {/* GRID */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-10
            md:gap-14
          "
        >

          {experiences.map(
  (
    experience,
    index
  ) => {

    const isSelected =
      selectedExperiences.includes(
        experience.title
      );

    return (
              <motion.div

                key={experience.title}

                variants={fadeReveal}

                initial="initial"

                whileInView="animate"

                viewport={{
                  once: true,
                  amount: 0.2,
                }}

                transition={{
                  duration: 1.3,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}

                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-[36px]
                  bg-white/[0.02]
                  border
                  border-white/[0.08]
                  backdrop-blur-[4px]
                  will-change-transform

                  ${
                    index === 1
                      ? "md:translate-y-16"
                      : ""
                  }

                  ${
                    index === 2
                      ? "md:-translate-y-6"
                      : ""
                  }
                `}
              >

                {/* IMAGE */}

                <div
                  className="
                    relative
                    overflow-hidden
                  "
                >

                  <img
                    src={experience.image}
                    alt={experience.title}
                    className={`
                      w-full
                      object-cover
                      transition-transform
                      duration-[1600ms]
                      ease-out
                      group-hover:scale-[1.02]

                      ${
                        index === 0
                          ? "h-[360px] md:h-[460px]"
                          : ""
                      }

                      ${
                        index === 1
                          ? "h-[420px] md:h-[560px]"
                          : ""
                      }

                      ${
                        index === 2
                          ? "h-[380px] md:h-[500px]"
                          : ""
                      }
                    `}
                  />

                  {/* IMAGE OVERLAY */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/30
                      via-transparent
                      to-transparent
                    "
                  />

                </div>

                {/* CONTENT */}

                <div
                  className="
                    p-10
                    md:p-12
                  "
                >

                  <h3
                    className="
                      text-[32px]
                      md:text-[38px]
                      leading-[1.02]
                      tracking-[-0.03em]
                      font-light
                      mb-7
                      max-w-[85%]
                    "
                  >

                    {experience.title}

                  </h3>

                  <p
                    className="
                      text-[15px]
                      md:text-[16px]
                      leading-[1.9]
                      tracking-[-0.01em]
                      text-white/62
                      mb-10
                      max-w-[85%]
                    "
                  >

                    {experience.description}

                  </p>

                  {/* DETAILS */}

                  <div
                    className="
                      space-y-4
                    "
                  >

                    {experience.details.map(
                      (detail) => (

                        <div
                          key={detail}
                          className="
                            flex
                            items-center
                            gap-4
                            text-white/70
                          "
                        >

                          <div
                            className="
                              w-1.5
                              h-1.5
                              rounded-full
                              bg-white/70
                              shrink-0
                            "
                          />

                          <span
                            className="
                              text-[14px]
                              tracking-[-0.01em]
                            "
                          >

                            {detail}

                          </span>

                        </div>
                      )
                    )}

                  </div>

                </div>

            </motion.div>

    );

  }
)}

        </div>

      </SectionContainer>

    </Section>
  );
}