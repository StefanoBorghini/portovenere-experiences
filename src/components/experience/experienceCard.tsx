"use client";

import { motion } from "framer-motion";

import ExperienceFacts from "@/components/experience/experienceFacts";
import ExperienceSections from "@/components/experience/experienceSections";

import { fadeReveal } from "@/lib/motion/fadeReveal";

interface Props {

  experience: any;

  index: number;

  isSelected: boolean;

  onToggle: () => void;

}

export default function ExperienceCard({

  experience,

  index,

  isSelected,

  onToggle,

}: Props) {

  return (

    <motion.button

      onClick={onToggle}

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

    </motion.button>

  );

}