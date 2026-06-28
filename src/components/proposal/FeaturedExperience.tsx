"use client";

import { motion } from "framer-motion";

import Section
from "@/components/layout/Section";

import SectionContainer
from "@/components/layout/SectionContainer";

import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

// =====================================================
// TYPES
// =====================================================

interface FeaturedExperienceProps {

  image: string;

  operator: string;

  subtitle: string;

  description: string;

essentials: {
  id: string;
  title: string;
  description: string;
}[];

  facts: {
    id: string;
    label: string;
    value: string;
  }[];
}

// =====================================================
// COMPONENT
// =====================================================

export default function FeaturedExperience({

  image,

  operator,

  subtitle,

  description,

  essentials,

  facts,

}: FeaturedExperienceProps) {

  return (

    <Section className="bg-black">

      <SectionContainer>

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-12
            md:gap-20
            items-center
          "
        >

          {/* LEFT CONTENT */}

          <motion.div

            variants={fadeReveal}

            initial="initial"

            whileInView="animate"

            viewport={{
              once: true,
              amount: 0.2,
            }}

            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}

            className="
              order-1
              text-center
              lg:text-left
            "
          >

            <div
              className="
                bg-white/[0.03]
                border
                border-white/10
                rounded-[40px]
                p-8
                md:p-14
                backdrop-blur-sm
              "
            >

              {/* LABEL */}

              <p
                className="
                  uppercase
                  tracking-[0.35em]
                  text-white/45
                  text-[11px]
                  mb-8
                "
              >

                Featured Experience

              </p>

              {/* OPERATOR */}

              <h2
                className="
                  text-5xl
                  md:text-7xl
                  font-[450]
                  tracking-[-0.04em]
                  leading-[0.92]
                  mb-8
                "
              >

                {operator}

              </h2>

              {/* SUBTITLE */}

              <p
                className="
                  text-white/72
                  text-[18px]
                  md:text-[24px]
                  leading-[1.6]
                  tracking-[-0.02em]
                  mb-10
                "
              >

                {subtitle}

              </p>

              {/* DESCRIPTION */}

              <p
                className="
                  text-white/50
                  text-[15px]
                  md:text-[18px]
                  leading-[1.9]
                  max-w-2xl
                  mb-14
                "
              >

                {description}

              </p>

              {/* TECHNICAL DETAILS */}

              <div
  className="
    space-y-5
    mb-14
  "
>

  {facts.map((fact) => (

    <div
      key={fact.id}
      className="
        flex
        justify-between
        items-center
        border-b
        border-white/10
        pb-4
      "
    >

      <span
        className="
          text-white/45
        "
      >
        {fact.label}
      </span>

      <span
        className="
          text-white
          text-right
        "
      >
        {fact.value}
      </span>

    </div>

  ))}

</div>

              {/* ESSENTIALS */}

              <div
                className="
                  space-y-4
                  flex
                  flex-col
                  items-center
                  lg:items-start
                "
              >

               {essentials.map((section) => (

  <div
    key={section.id}
    className="
      flex
      items-start
      gap-4
    "
  >

    <div
      className="
        w-2
        h-2
        rounded-full
        bg-white
        mt-2
        shrink-0
      "
    />

    <div>

      <h4
        className="
          text-white
          text-[17px]
          font-medium
          mb-1
        "
      >

        {section.title}

      </h4>

    <div
  className="
    text-white/55
    text-[15px]
    leading-relaxed
    prose
    prose-invert
    max-w-none
  "
  dangerouslySetInnerHTML={{
    __html: section.description,
  }}
/>

    </div>

  </div>

))}

              </div>

            </div>

          </motion.div>

          {/* RIGHT IMAGE */}

          <motion.div

            variants={fadeReveal}

            initial="initial"

            whileInView="animate"

            viewport={{
              once: true,
              amount: 0.2,
            }}

            transition={{
              duration: 1.4,
              ease: [0.22, 1, 0.36, 1],
            }}

            className="
              order-2
            "
          >

            <div
              className="
                relative
                overflow-hidden
                rounded-[40px]
              "
            >

              <img
                src={image}
                alt={operator}
                className="
                  w-full
                  h-[420px]
                  md:h-[760px]
                  object-cover
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/25
                  via-transparent
                  to-transparent
                "
              />

            </div>

          </motion.div>

        </div>

      </SectionContainer>

    </Section>
  );
}