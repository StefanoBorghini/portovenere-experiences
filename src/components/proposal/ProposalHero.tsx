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

      <div className="
        absolute
        inset-0
        bg-black/50
      " />

      {/* CONTENT */}

   <motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 1.2,
    ease: "easeOut",
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
    max-w-6xl
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
            mb-8
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
    leading-[0.95]
    tracking-tight
    mb-8
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
          text-zinc-200
          text-base
          md:text-xl
          text-center
          leading-8
         max-w-2xl
          mx-auto
          mb-10
          text-4xl
md:text-8xl
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
  backdrop-blur-md
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
    tracking-tight
  ">

    €{totalPrice.toLocaleString()}

  </span>

</div>

      </motion.div>

    </section>
  );
}