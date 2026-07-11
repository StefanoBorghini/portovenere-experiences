"use client";

import { motion } from "framer-motion";
import { ExperienceFact } from "@/types/experience";
import Section
from "@/components/layout/Section";
import ExperienceFacts from "@/components/experience/experienceFacts";
import ExperienceSections from "@/components/experience/experienceSections";
import SectionContainer
from "@/components/layout/SectionContainer";
import { ExperienceSection } from "@/types/experience";
import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";
import {
  formatPrice,
} from "@/lib/pricing/formatPrice";
import {
  calculatePrice,
  PriceTier,
} from "@/lib/pricing/calculatePrice";

// =====================================================
// TYPES
// =====================================================

interface FeaturedExperienceProps {

  image: string;

  operator: string;

  subtitle: string;

  description: string;

  basePrice: number;

  priceType: string;

  essentials: ExperienceSection[];

  facts: ExperienceFact[];

  useGuestTiers?: boolean;

  tiers?: PriceTier[];

  guests?: number;

  children?: number;

}

// =====================================================
// COMPONENT
// =====================================================


export default function FeaturedExperience({

  image,

  operator,

  subtitle,

  description,

  basePrice,

  priceType,

  essentials,

  facts,

  useGuestTiers = false,

  tiers = [],

  guests = 1,

  children = 0,

}: FeaturedExperienceProps) {

  const price = useGuestTiers
    ? {
        label: "Price",
        value: `€${calculatePrice(
          basePrice,
          priceType,
          guests,
          children,
          0,
          tiers,
          true
        )}`,
      }
    : formatPrice(basePrice, priceType);

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

              {/* TITLE — nome dell'esperienza (es. "Authentic
                  Ligurian Fishing Experience"). RIMESSO QUI: era
                  andato perso nella ricostruzione precedente. */}

              <h2
                className="
                  text-4xl
                  md:text-6xl
                  font-light
                  tracking-tight
                  leading-[1.05]
                  mb-4
                "
              >

                {subtitle}

              </h2>

              {/* OPERATOR — nome dell'operatore (es. "Aphrodite"),
                  nella riga piu' piccola sotto il titolo */}

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

                {operator}

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
{(price.label || price.value) && (

  <div className="mb-16 mt-10">

    {price.label && (

      <p
        className="
           uppercase
          tracking-[0.35em]
          text-[11px]
          text-white/35
          mb-4
        "
      >
        {price.label}
      </p>

    )}

    {price.value && (

      <p
        className="
         text-6xl
        font-light
        tracking-tight
        leading-none
        "
      >
        {price.value}
      </p>

    )}

  </div>

)}
              </p>
<ExperienceFacts facts={facts} />
          
              {/* ESSENTIALS */}

             <ExperienceSections
  sections={essentials}
/> 

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