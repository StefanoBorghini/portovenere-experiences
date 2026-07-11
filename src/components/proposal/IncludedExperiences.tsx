"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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

import { ProposalExperienceCard } from "@/types/proposal";
import {
  trackProposalExperienceAdded,
  trackProposalExperienceRemoved,
} from "@/lib/analytics/gtag";
interface IncludedExperiencesProps {
 
  experiences: ProposalExperienceCard[];
 
  onSelectionChange?: (selectedIds: string[]) => void;
 
  preSelected?: boolean;
 
  isMultiDayTrip?: boolean;
 
  guests?: number;
 
  children?: number;
}

// =====================================================
// COMPONENT
// =====================================================

export default function IncludedExperiences({

  experiences,

  onSelectionChange,

  preSelected = true,

  isMultiDayTrip = false,

}: IncludedExperiencesProps) {

  const [
  selectedExperiences,
  setSelectedExperiences,
] = useState<string[]>(

  preSelected && !isMultiDayTrip
    ? experiences.map(experience => experience.id)
    : []

);

useEffect(() => {
  onSelectionChange?.(selectedExperiences);
}, [selectedExperiences]);

const disabledExperiences = new Set<string>();

// Su viaggi multi-giorno, niente viene mai disabilitato: si
// possono selezionare tutte le combinazioni liberamente.
if (!isMultiDayTrip) {

  selectedExperiences.forEach((selectedId) => {

    const selected = experiences.find(
      experience => experience.id === selectedId
    );

    if (!selected) return;

    selected.experience.incompatible_experiences?.forEach(
      (id: string) => disabledExperiences.add(id)
    );

  });
}

function toggleExperience(id: string) {

  setSelectedExperiences(current => {

    const target = experiences.find(
      experience => experience.id === id
    );

    const trackingLabel =
      target?.experience?.category ?? id;

    // Deselezione normale
    if (current.includes(id)) {

      trackProposalExperienceRemoved(trackingLabel);

      return current.filter(item => item !== id);

    }

    trackProposalExperienceAdded(trackingLabel);

    // Su viaggi multi-giorno: aggiunta semplice, nessuna rimozione
    // automatica di altre esperienze "incompatibili" — si possono
    // accumulare liberamente, sono su giorni diversi.
    if (isMultiDayTrip) {
      return [...current, id];
    }

    // Experience che sto aggiungendo
    const addedExperience = experiences.find(
      experience => experience.id === id
    );

    if (!addedExperience) return current;

    const incompatible =
      addedExperience.experience.incompatible_experiences ?? [];

    // Rimuovo tutte le incompatibili
    const cleanedSelection = current.filter(
      selectedId => !incompatible.includes(selectedId)
    );

    // Aggiungo la nuova
    return [
      ...cleanedSelection,
      id,
    ];

  });

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
            label={
              preSelected && !isMultiDayTrip
                ? "Included Experiences"
                : "You Might Also Like"
            }
            title={
              preSelected && !isMultiDayTrip
                ? "Curated Riviera Moments"
                : "Complete Your Escape"
            }
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

        const isDisabled =
  disabledExperiences.has(experience.id) &&
  !isSelected;

    return (

        <ExperienceCard
            key={experience.id}
    experience={experience}
    index={index}
    isSelected={isSelected}
    isDisabled={isDisabled}
    onToggle={() => toggleExperience(experience.id)}
        />

    );

})}

        </div>

      </SectionContainer>

    </Section>
  );
}