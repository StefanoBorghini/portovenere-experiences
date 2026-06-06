"use client";

interface ProposalHeroProps {

  heroImage: string;

  heroTitle: string;

  guests: string;

  totalPrice: number;
}
import { motion } from "framer-motion";

import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

export default function ProposalHero({

  heroImage,

  heroTitle,

  guests,

  totalPrice,

}: ProposalHeroProps) {

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
          src="/logo-white.png"
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
          Private Riviera Proposal
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

          Tailored for {guests} guests
          across curated Riviera experiences,
          cinematic atmosphere and
          Mediterranean moments.

        </p>

        {/* PRICE */}
<div className="
  inline-flex
  flex-col
  items-center
  justify-center
  border
  border-white/12
  rounded-[40px]
  px-6
py-4
  backdrop-blur-[6px]
  bg-white/5
min-w-[190px]
">

  <span className="
    uppercase
    tracking-[0.35em]
    text-[11px]
    text-white/52
    mb-2
  ">
    Starting From
  </span>

  <span className="
   text-[38px]
tracking-[-0.04em]
font-[300]
    md:text-[46px]
    
    tracking-[-0.03em]
font-[300]
  ">

    €{totalPrice.toLocaleString()}

  </span>

</div>

      </motion.div>

    </section>
  );
}