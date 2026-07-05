"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ProposalExperienceCard } from "@/types/proposal";
import ExperienceFacts from "@/components/experience/experienceFacts";
import ExperienceSections from "@/components/experience/experienceSections";
import { Experience } from "@/types/experience";
import { fadeReveal } from "@/lib/motion/fadeReveal";

interface Props {

    experience: ProposalExperienceCard;

    index: number;

    isSelected: boolean;

    isDisabled: boolean;

    onToggle: () => void;

}

export default function ExperienceCard({

  experience,

  index,

  isSelected,

  isDisabled,

  onToggle,

}: Props) {

  const [showIncluded, setShowIncluded] =
    useState(false);

  const hasSections =
    (experience.experience.sections?.length ?? 0) > 0;

  return (

   <motion.button

  onClick={() => {

    if (isDisabled) return;

    onToggle();

}}

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
    flex
    flex-col

    overflow-hidden
    rounded-[36px]
    bg-white/[0.02]
    border

    ${
      isSelected
        ? "border-white/40 shadow-[0_0_0_2px_rgba(255,255,255,0.15)]"
        : "border-white/[0.08]"
    }

${
    isDisabled
        ? "opacity-30 grayscale cursor-not-allowed"
        : !isSelected
            ? "opacity-50 grayscale-[20%]"
            : ""
}
    backdrop-blur-[4px]
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
          ? "h-[420px] md:h-[520px]"
          : ""
      }

      ${
        index === 1
          ? "h-[420px] md:h-[520px]"
          : ""
      }

      ${
        index === 2
          ? "h-[420px] md:h-[520px]"
          : ""
      }
    `}
  />

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
    flex-1
    p-10
    md:p-12
    items-center
    text-center
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
      
    "
  >
    {experience.description}
  </p>
<div
    className="
        w-full
    "
>

    <ExperienceFacts
        facts={experience.experience.facts}
    />

    {hasSections && (

      <>

        <div

          onClick={(e) => {

            e.stopPropagation();

            setShowIncluded(
              (prev) => !prev
            );

          }}

          className="
            mt-8
            text-center
            uppercase
            tracking-[0.25em]
            text-[11px]
            text-white/40
            hover:text-white/70
            transition
            cursor-pointer
          "
        >

          {showIncluded
            ? "Hide what's included  −"
            : "What's included  +"}

        </div>

        <div
          className={`
            overflow-hidden
            transition-all
            duration-500
            ease-out

            ${
              showIncluded
                ? "max-h-[1200px] opacity-100"
                : "max-h-0 opacity-0"
            }
          `}
        >

          <ExperienceSections
            sections={experience.experience.sections}
          />

        </div>

      </>

    )}

</div>

<div
    className="
        mt-8
        w-full
        flex
        justify-center
    "
>

    <div
       className={`
    min-w-[140px]
    rounded-full
    px-6
    py-2.5
    uppercase
    tracking-[0.2em]
    text-[11px]
    text-center
    transition-all
    duration-300

    ${
        isDisabled
            ? "bg-red-500/10 border border-red-500/30 text-red-300"
            : isSelected
                ? "bg-white text-black"
                : "border border-white/15 text-white/75"
    }
`}
    >
  {isDisabled
    ? "Not compatible"
    : isSelected
      ? "Included"
      : "Add"}
</div>

</div>

</div>

</motion.button>

  );

}