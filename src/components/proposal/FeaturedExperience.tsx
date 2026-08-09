"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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

  const t = useTranslations("proposal");

  const price = useGuestTiers
    ? {
        labelKey: "priceLabel" as const,
        valueKey: "" as const,
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

  const priceLabel = price.labelKey ? t(`featured.${price.labelKey}`) : "";
  const priceValue = price.valueKey ? t(`featured.${price.valueKey}`) : price.value;

  // =====================================================
  // SHOW MORE / SHOW ALL — stesso pattern gia' usato in
  // ExperienceCard.tsx per "What's included" (collassato di
  // default, max-height + opacity in transizione), riusato qui
  // per description, facts e included, cosi' la card featured
  // non risulta enorme quando un'esperienza ha molto testo.
  // =====================================================

  const [showFullDescription, setShowFullDescription] =
    useState(false);

  const [showAllFacts, setShowAllFacts] =
    useState(false);

  const [showAllIncluded, setShowAllIncluded] =
    useState(false);

  // Soglie: sotto queste, il contenuto e' gia' corto di suo e
  // il toggle sarebbe superfluo (es. 2 facts non hanno bisogno
  // di "Show all"). Sopra, mostriamo il pulsante.
  const isDescriptionLong =
    (description?.length ?? 0) > 220;

  const hasManyFacts =
    (facts?.length ?? 0) > 3;

  const hasEssentials =
    (essentials?.length ?? 0) > 0;

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

                {t("featured.label")}

              </p>

              {/* TITLE — nome dell'esperienza (es. "Authentic
                  Ligurian Fishing Experience"). */}

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

              {/* DESCRIPTION — line-clamp a 4 righe quando
                  collassata; nessun toggle se il testo e' gia'
                  corto (isDescriptionLong = false). Nota: il
                  blocco prezzo qui sotto e' stato spostato FUORI
                  dal <p> della description (prima era annidato
                  dentro, <div> dentro <p> non e' HTML valido) —
                  stesso ordine visivo di prima, solo markup corretto. */}

              <p
                className={`
                  text-white/50
                  text-[15px]
                  md:text-[18px]
                  leading-[1.9]
                  max-w-2xl
                  ${
                    !showFullDescription && isDescriptionLong
                      ? "line-clamp-4"
                      : ""
                  }
                `}
              >

                {description}

              </p>

              {isDescriptionLong && (

                <button
                  type="button"
                  onClick={() =>
                    setShowFullDescription((prev) => !prev)
                  }
                  className="
                    mt-4
                    uppercase
                    tracking-[0.25em]
                    text-[11px]
                    text-white/40
                    hover:text-white/70
                    transition
                    cursor-pointer
                  "
                >
                  {showFullDescription
                    ? t("featured.showLess")
                    : t("featured.showMore")}
                </button>

              )}

              {(priceLabel || priceValue) && (

                <div className="mb-16 mt-10">

                  {priceLabel && (

                    <p
                      className="
                         uppercase
                        tracking-[0.35em]
                        text-[11px]
                        text-white/35
                        mb-4
                      "
                    >
                      {priceLabel}
                    </p>

                  )}

                  {priceValue && (

                    <p
                      className="
                       text-6xl
                      font-light
                      tracking-tight
                      leading-none
                      "
                    >
                      {priceValue}
                    </p>

                  )}

                </div>

              )}

              {/* FACTS — collassati solo se ce ne sono molti
                  (soglia: piu' di 3). Con 1-2 facts, come duration
                  e departure, il toggle non compare: sarebbe
                  superfluo per due righe di testo. */}

              <div
                className={`
                  overflow-hidden
                  transition-all
                  duration-500
                  ease-out

                  ${
                    showAllFacts || !hasManyFacts
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-[220px] opacity-100"
                  }
                `}
              >

                <ExperienceFacts facts={facts} />

              </div>

              {hasManyFacts && (

                <div

                  onClick={() =>
                    setShowAllFacts((prev) => !prev)
                  }

                  className="
                    mt-4
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

                  {showAllFacts
                    ? t("featured.showLess")
                    : t("featured.showAll")}

                </div>

              )}

              {/* ESSENTIALS ("Included in the tour" ecc.) —
                  stesso pattern "What's included +/−" gia' usato
                  in ExperienceCard.tsx per le card piu' piccole:
                  collassato di default, cosi' la card featured
                  non diventa enorme quando ci sono molte sezioni
                  (es. "Included in the tour" + "The boat is
                  equipped with"). */}

              {hasEssentials && (

                <>

                  <div

                    onClick={() =>
                      setShowAllIncluded((prev) => !prev)
                    }

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

                    {showAllIncluded
                      ? t("featured.hideWhatsIncluded")
                      : t("featured.whatsIncluded")}

                  </div>

                  <div
                    className={`
                      overflow-hidden
                      transition-all
                      duration-500
                      ease-out

                      ${
                        showAllIncluded
                          ? "max-h-[3000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }
                    `}
                  >

                    <ExperienceSections
                      sections={essentials}
                    />

                  </div>

                </>

              )}

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