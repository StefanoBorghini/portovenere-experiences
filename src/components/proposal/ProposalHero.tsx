"use client";

import { useTranslations } from "next-intl";
import {
  proposalConfig,
} from "@/config/proposalConfig";

interface ProposalHeroProps {

  heroImage: string;

  heroTitle: string;

  guests: string;

  children?: number | string;

  totalPrice: number;

  priceLabel?: string;
}
import { motion } from "framer-motion";

import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

export default function ProposalHero({

  heroImage,

  heroTitle,

  guests,

  children,

  totalPrice,

  priceLabel,

}: ProposalHeroProps) {

  const t = useTranslations("proposal");

  // Stessa formula di buildProposalSummary.ts, cosi' hero e
  // paragrafo narrativo dicono sempre la stessa cosa — "12
  // adults" oppure "12 adults and 2 children", mai bambini
  // menzionati se non ce ne sono.

  const adults =
    Number(guests) || 2;

  const childrenCount =
    Number(children) || 0;

  const adultsText =
    adults === 1
      ? t("hero.oneAdult", { count: adults })
      : t("hero.adultsCount", { count: adults });

  const childrenText =
    childrenCount === 1
      ? t("hero.oneChild", { count: childrenCount })
      : t("hero.childrenCount", { count: childrenCount });

  const guestSentence =

    childrenCount > 0
      ? t("hero.guestsWithChildren", { adults: adultsText, children: childrenText })
      : adultsText;

  return (

    <section
      className="
        relative
        min-h-[100dvh]
        flex
        items-center
        justify-center
        overflow-hidden
      "

      style={{
  perspective: "1200px",
}}
    >

      {/* BACKGROUND */}

      <motion.img
      initial={{
  scale: 1.08,
  opacity: 0,
}}

animate={{
  scale: 1,
  opacity: 1,
}}

transition={{
  duration: 1.8,
  ease: [0.22, 1, 0.36, 1],
}}
        src={heroImage}
        alt={heroTitle}
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
        "
      />

      <div
  className="
  will-change-transform
    absolute
    inset-0
    opacity-[0.03]
    mix-blend-soft-light
    pointer-events-none
    bg-[url('/noise.png')]
  "
/>

      {/* OVERLAY */}

<div
  className="
    absolute
    inset-0
    bg-gradient-to-b
    from-black/70
    via-black/30
    to-black/80
  "
/>

<div
  className="
    absolute
    inset-0
    bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_65%)]
  "
/>

      {/* CONTENT */}

 <motion.div

  variants={fadeReveal}
className="
  flex
  flex-col
  items-center
  text-center
"
  initial="initial"

  animate="animate"

  transition={{
    duration: 1.8,
    ease: [0.22, 1, 0.36, 1],
  }}
>

        {/* LOGO */}

        <motion.img
        initial={{
  scale: 1.06,
}}

animate={{
  opacity: [0.92, 1, 0.92],
}}

transition={{
  duration: 6,
  repeat: Infinity,
  ease: "easeInOut",
}}
          src={proposalConfig.brand.logo}
          alt="Portovenere Experiences"
          className="
            w-28
            md:w-36
            object-contain
            mx-auto
            mb-12
md:mb-10
            opacity-95
          "
        />

        {/* LABEL */}

        <p className="
          uppercase
          tracking-[0.35em]
          text-[11px]
          text-white/52
          text-center
          mb-6
        ">
          {t("hero.label")}
        </p>

        {/* TITLE */}

       <h1
  className="
    text-5xl
    md:text-[110px]
    font-light
    leading-[0.92]
tracking-[-0.04em]
font-[450]
    mb-12
md:mb-14
    text-center
  
    max-w-[320px]
md:max-w-5xl
  "
  style={{
    textShadow:
      "0 4px 30px rgba(0,0,0,0.35)",
  }}
>
          {heroTitle}

        </h1>

        {/* SUBTITLE */}

        <p className="text-center
mx-auto
  text-[15px]
  md:text-[19px]
  leading-[1.9]
  tracking-[-0.01em]
  text-white/72
  max-w-[300px]
md:max-w-2xl
">

          {t("hero.subtitle", { guestSentence })}

        </p>

        {/* SCROLL CUE */}

        <button
          type="button"
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: "smooth",
            });
          }}
          aria-label={t("hero.scrollCue")}
          className="
            mt-12
            flex
            items-center
            justify-center
            w-14
            h-14
            rounded-full
            border
            border-white/20
            bg-white/5
            backdrop-blur-[6px]
            hover:bg-white/10
            hover:border-white/40
            transition-all
            duration-300
            cursor-pointer
          "
        >

          <motion.svg
            animate={{ y: [0, 6, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>

        </button>

      </motion.div>

    </section>
  );
}