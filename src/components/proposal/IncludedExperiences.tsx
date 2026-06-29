"use client";
import ExperienceFacts from "@/components/experience/experienceFacts";
import ExperienceSections from "@/components/experience/experienceSections";
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

  id: string;

  image: string;

  title: string;

  description: string;


  experience: any;

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
    experience => experience.id
  )

);

function toggleExperience(
id: string
) {

if (
selectedExperiences.includes(
  id
)
) {

setSelectedExperiences(

  selectedExperiences.filter(
    item => item !== id
  )

);

} else {

setSelectedExperiences([
  ...selectedExperiences,
  id,
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
console.log(
  "Experience",
  experience.title,
  experience.experience
);

console.log(
  "Facts",
  experience.experience?.facts
);

console.log(
      "SECTIONS",
      experience.title,
      experience.experience?.sections
    );
    const isSelected =
      selectedExperiences.includes(
        experience.id
      );

    return (
              <motion.button

                  onClick={() =>
    toggleExperience(
      experience.id
    )
  }

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

${
  isSelected
    ? `
      border-white/40
      shadow-[0_0_0_2px_rgba(255,255,255,0.15)]
    `
    : `
      border-white/[0.08]
    `
}

backdrop-blur-[4px]
will-change-transform

${!isSelected ? "opacity-50 grayscale-[20%]" : ""}

${index === 1 ? "md:translate-y-16" : ""}
${index === 2 ? "md:-translate-y-6" : ""}
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
flex
flex-col
items-center
text-center
p-10
md:p-12
h-full
"
>

                  <h3
                   className="
text-[32px]
md:text-[38px]
leading-[1.02]
tracking-[-0.03em]
font-light
mb-10
mx-auto
"
                  >

                   {experience.title}

                  </h3>
<p
  className="
    text-white/80
    text-[24px]
font-light
tracking-[-0.03em]
mb-10
  "
>
 €{experience.experience.base_price?.toLocaleString() ?? "0"}
</p>
                  <p
                    className="
                      text-[15px]
                      md:text-[16px]
                      leading-[1.9]
                      tracking-[-0.01em]
                      text-white/62
                      max-w-[320px]
mx-auto
mb-12
                    "
                  >

                    {experience.description}

                  </p>
<div
className="
flex-1
w-full
"
>

    <ExperienceFacts
        facts={experience.experience.facts}
    />

    <ExperienceSections
        sections={experience.experience.sections}
    />

</div>
                 
<div
  className={`
    mt-12

    w-full
    flex
    justify-center
  `}
>

  <div
    className={`
      min-w-[210px]

      rounded-full

      px-8
      py-4

      uppercase
      tracking-[0.22em]
      text-[12px]

      transition-all
      duration-300

      ${
        isSelected
          ? "bg-white text-black"
          : "border border-white/15 text-white/75"
      }
    `}
  >

    {isSelected
      ? "Included"
      : `Add Experience · €${experience.experience.base_price}`
    }

  </div>

</div></div>

            </motion.button>

    );

  }
)}

        </div>

      </SectionContainer>

    </Section>
  );
}