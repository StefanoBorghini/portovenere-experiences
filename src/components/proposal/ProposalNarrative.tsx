
"use client";

import { motion } from "framer-motion";

import Section
from "@/components/layout/Section";

import SectionContainer
from "@/components/layout/SectionContainer";


import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

import { useTranslations } from "next-intl";

interface ProposalNarrativeProps {
  title?: string;
  summary?: string;
  paragraph?: string;
}

export default function ProposalNarrative({
  title,
  summary,
  paragraph,
}: ProposalNarrativeProps) {

  const t = useTranslations("proposal");

  return (

   <Section
  className="
    relative
    overflow-hidden
    bg-black
  "
>

      {/* ATMOSPHERIC BACKGROUND */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.04]
          pointer-events-none
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]
        "
      />

      {/* TOP GRADIENT */}

      <div
        className="
          absolute
          top-0
          left-0
          w-full
          h-40
          bg-gradient-to-b
          from-black
          to-transparent
        "
      />

      {/* BOTTOM GRADIENT */}

      <div
        className="
          absolute
          bottom-0
          left-0
          w-full
          h-40
          bg-gradient-to-t
          from-black
          to-transparent
        "
      />
<SectionContainer>


      <motion.div

  variants={fadeReveal}

  initial="initial"

  whileInView="animate"

  viewport={{
    once: true,
    amount: 0.3,
  }}

  transition={{
    duration: 1.8,
    ease: [0.22, 1, 0.36, 1],
  }}

  className="
    relative
    z-10
    text-center
  "
>
        {/* LABEL */}

        <p
          className="
            uppercase
            tracking-[0.35em]
            text-[11px]
            text-white/38
            mb-10
          "
        >
          {t("narrative.label")}
        </p>

        {/* TITLE */}

        <h2
          className="
            text-[42px]
            leading-[0.98]
            tracking-[-0.05em]
            font-light

            md:text-[110px]
            md:leading-[0.92]

            max-w-[340px]
            md:max-w-5xl

            mx-auto
            mb-16
          "
        >
{title ?? t("narrative.title")}

        </h2>

        {/* PARAGRAPH */}

     {summary && (
  <p
    className="
      text-[18px]
      md:text-[28px]
      leading-[1.8]
      tracking-[-0.02em]
      text-white/90
      max-w-4xl
      mx-auto
      mb-12
      font-light
    "
  >
    {summary}
  </p>
)}

<p
  className="
    text-[16px]
    md:text-[22px]
    leading-[1.95]
    tracking-[-0.01em]
    text-white/62
    max-w-2xl
    mx-auto
  "
>
  {paragraph ?? t("narrative.description")}
</p>

      </motion.div>
</SectionContainer>
    </Section>
  );
}

