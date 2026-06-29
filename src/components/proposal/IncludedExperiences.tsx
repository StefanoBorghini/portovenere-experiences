"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Section
from "@/components/layout/Section";
import SectionContainer
from "@/components/layout/SectionContainer";

import SectionHeader
from "@/components/layout/SectionHeader";
import ExperienceCard
from "@/components/experience/experienceCard";
import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

// =====================================================
// TYPES
// =====================================================


interface ExperienceCardData {

  id: string;

  image: string;

  title: string;

  description: string;


  experience: any;

}
interface IncludedExperiencesProps {

  experiences: ExperienceCardData[];
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

function toggleExperience(id: string) {

    setSelectedExperiences(current =>

        current.includes(id)

            ? current.filter(item => item !== id)

            : [...current, id]

    );

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

    {experiences.map((experience, index) => {

    const isSelected =
        selectedExperiences.includes(experience.id);

    return (

        <ExperienceCard
            key={experience.id}
            experience={experience}
            index={index}
            isSelected={isSelected}
            onToggle={() => toggleExperience(experience.id)}
        />

    );

})}

        </div>

      </SectionContainer>

    </Section>
  );
}