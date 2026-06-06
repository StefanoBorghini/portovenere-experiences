
"use client";

import { motion } from "framer-motion";

import Section
from "@/components/layout/Section";

import SectionContainer
from "@/components/layout/SectionContainer";

import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

interface ReservationSectionProps {
  expiresAt: string;
  closingParagraph?: string;
  whatsappUrl: string;
}

import Countdown
from "@/components/countdown";

export default function ReservationSection({
  expiresAt,
  closingParagraph,
  whatsappUrl,
}: ReservationSectionProps) {

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

      {/* TOP TRANSITION */}

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

      {/* BOTTOM VIGNETTE */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.45)_100%)]
          pointer-events-none
        "
      />

      {/* CONTENT */}
<SectionContainer>
      <motion.div
variants={fadeReveal}

  initial="initial"

  whileInView="animate"

  viewport={{
    once: true,
    amount: 0.25,
  }}

  transition={{
    duration: 1.8,
    ease: [0.22, 1, 0.36, 1],
  }}
      >

        {/* COUNTDOWN */}

        <div
          className="
            mb-24
            md:mb-32
          "
        >

          <Countdown
            expiresAt={expiresAt}
          />

        </div>

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
          Private Reservation
        </p>

        {/* TITLE */}

        <h2
          className="
            text-[44px]
            leading-[0.98]
            tracking-[-0.05em]
            font-light

            md:text-[110px]
            md:leading-[0.92]

            max-w-[340px]
           

            mb-16
          "
        >

          Your Riviera
          <br />
          experience awaits

        </h2>

        {/* PARAGRAPH */}

        <p
          className="
            text-[16px]
            md:text-[22px]

            leading-[1.95]
            tracking-[-0.01em]

            text-white/62

            max-w-[320px]
            md:max-w-2xl

            mx-auto

            mb-24
          "
        >

          {
            closingParagraph ||

            "Your curated proposal has been privately reserved for a limited time, allowing you to confirm your Riviera experience in complete exclusivity."
          }

        </p>

        {/* CONTACT DETAILS */}

        <div
          className="
            flex
            flex-col
            items-center

            gap-5

            mb-24
          "
        >

          <p
            className="
              uppercase
              tracking-[0.22em]
              text-[11px]
              text-white/32
            "
          >
            Stefano Borghini
          </p>

          <p
            className="
              uppercase
              tracking-[0.22em]
              text-[11px]
              text-white/32
            "
          >
            Portovenere Experiences
          </p>

          <p
            className="
              text-white/52
              tracking-[-0.01em]
            "
          >
            info@portovenere.com
          </p>

          <p
            className="
              text-white/52
              tracking-[-0.01em]
            "
          >
            +39 348 714 0722
          </p>

        </div>

        {/* CTA */}

        <div
          className="
            flex
            justify-center
          "
        >

          <a
            href={whatsappUrl}
            target="_blank"

            className="
              group

              relative

              inline-flex
              items-center
              justify-center

              overflow-hidden

              rounded-full

              border
              border-white/12

              bg-white/[0.06]
              backdrop-blur-[6px]

              px-10
              py-5

              md:px-14
              md:py-6

              transition-all
              duration-[1200ms]
              ease-out

              hover:bg-white
            "
          >

            {/* BUTTON GLOW */}

            <div
              className="
                absolute
                inset-0

                opacity-0
                group-hover:opacity-100

                transition-opacity
                duration-[1200ms]

                bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_70%)]
              "
            />

            <span
              className="
                relative
                z-10

                uppercase

                tracking-[0.28em]
                text-[11px]

                text-white
                group-hover:text-black

                transition-colors
                duration-700
              "
            >

              Request Private Booking

            </span>

          </a>

        </div>

      </motion.div>
</SectionContainer>
    </Section>
  );
}

