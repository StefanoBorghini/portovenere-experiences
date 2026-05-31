"use client";

interface ProposalHeroProps {

  heroImage: string;

  heroTitle: string;

  guests: string;

  totalPrice: number;
}
import { motion } from "framer-motion";

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
        h-screen
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

      <img
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
 initial={{
  opacity: 0,
  y: 18,
  filter: "blur(10px)",
}}

animate={{
  opacity: 1,
  y: 0,
  filter: "blur(0px)",
}}

transition={{
  duration: 1.8,
  ease: [0.22, 1, 0.36, 1],
}}
  className="
    relative
    z-20
    flex
    flex-col
    items-center
    justify-center
    text-center
    px-6
    max-w-5xl
    mx-auto
  "
>

        {/* LOGO */}

        <img
          src="/logo-white.png"
          alt="Portovenere Experiences"
          className="
            w-28
            md:w-36
            object-contain
            mx-auto
            mb-12
md:mb-14
            opacity-95
          "
        />

        {/* LABEL */}

        <p className="
          uppercase
          tracking-[0.35em]
          text-[11px]
          text-zinc-300
          text-center
          mb-6
        ">
          Private Riviera Proposal
        </p>

        {/* TITLE */}

       <h1
  className="
    text-5xl
    md:text-8xl
    font-light
    leading-[0.92]
tracking-[-0.04em]
font-[450]
    mb-12
md:mb-14
    text-center
    max-w-6xl
    mx-auto
  "
  style={{
    textShadow:
      "0 4px 30px rgba(0,0,0,0.35)",
  }}
>
          {heroTitle}

        </h1>

        {/* SUBTITLE */}

        <p className="
  text-[15px]
  md:text-[19px]
  leading-[1.9]
  tracking-[-0.01em]
  text-white/72
  max-w-2xl
  mx-auto
  mb-14
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
  border-white/20
  rounded-[40px]
  px-10
  py-6
  backdrop-blur-[6px]
  bg-white/5
  min-w-[240px]
">

  <span className="
    uppercase
    tracking-[0.35em]
    text-[11px]
    text-zinc-300
    mb-3
  ">
    Starting From
  </span>

  <span className="
    text-4xl
    md:text-5xl
    font-light
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