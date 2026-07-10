"use client";

import { motion } from "framer-motion";

import { proposalConfig }
from "@/config/proposalConfig";

import Section
from "@/components/layout/Section";

import SectionContainer
from "@/components/layout/SectionContainer";

import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

import Countdown
from "@/components/countdown";

interface ReservationSectionProps {
  expiresAt: string;
  closingParagraph?: string;
  whatsappUrl: string;
  leadName: string;
  leadEmail: string;
  alreadyVerified?: boolean;
  bookingState: "idle" | "sending" | "sent" | "error";
  onRequestBooking: () => void;
  hasUnconfirmedChanges?: boolean;
}

export default function ReservationSection({
  expiresAt,
  closingParagraph,
  whatsappUrl,
  leadName,
  leadEmail,
  alreadyVerified = false,
  bookingState,
  onRequestBooking,
  hasUnconfirmedChanges = false,
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
          className="
            relative
            z-10
            max-w-5xl
            mx-auto

            flex
            flex-col
            items-center

            text-center
          "
        >

          {/* COUNTDOWN — attivo solo se non c'e' gia' una richiesta
              confermata senza modifiche in sospeso. Se il cliente
              modifica la selezione dopo aver confermato, il countdown
              torna a scorrere (con il nuovo expiresAt che arriva dal
              genitore dopo la conferma delle modifiche). */}

          <div
            className="
              mb-12
              md:mb-32
            "
          >

            {bookingState === "sent" && !hasUnconfirmedChanges ? (

              <div className="text-center">

                <p className="
                  uppercase
                  tracking-[0.45em]
                  text-[11px]
                  text-zinc-600
                  mb-8
                ">
                  Private Reservation
                </p>

                <p className="
                  text-2xl
                  md:text-4xl
                  font-light
                  text-emerald-300/80
                ">
                  Booking Confirmed
                </p>

              </div>

            ) : (

              <Countdown
                expiresAt={expiresAt}
              />

            )}

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
            {proposalConfig.reservation.label}
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

              max-w-4xl

              text-center

              mb-8
              md:mb-16
            "
          >

            {proposalConfig.reservation.title}

          </h2>

          {/* PARAGRAPH */}

          <p
            className="
              text-[16px]
              md:text-[22px]

              leading-[1.95]
              tracking-[-0.01em]

              text-white/62

              max-w-[420px]
              md:max-w-2xl

              mx-auto

              mb-12
              md:mb-24
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

              mb-12
              md:mb-24
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
              {proposalConfig.brand.name}
            </p>

          </div>

          {/* STATO — l'azione (bottone) vive ora solo su
              FloatingPriceBar, sempre visibile mentre scorri.
              Qui restano solo un messaggio informativo e il
              contatto diretto via WhatsApp. */}

          <div
            className="
              flex
              flex-col
              items-center
              gap-6
            "
          >

            {bookingState === "sent" && !hasUnconfirmedChanges && (

              <p
                className="
                  text-white/70
                  text-sm
                  max-w-md
                "
              >
                {alreadyVerified
                  ? `Thank you, ${leadName || "there"} — your email has been confirmed. We'll be in touch shortly to finalize your private booking.`
                  : `Check your inbox — we've sent a confirmation link to ${leadEmail}. Click it to complete your booking request.`}
              </p>

            )}

            {bookingState === "error" && (
              <p className="text-red-400 text-sm">
                Something went wrong — please try again, or contact us directly.
              </p>
            )}

            {/* CONTATTO DIRETTO — sempre disponibile */}

            <a
              href={whatsappUrl}
              target="_blank"
              className="
                text-white/40
                text-[11px]
                uppercase
                tracking-[0.22em]
                hover:text-white/70
                transition-colors
                duration-500
              "
            >
              {proposalConfig.cta.secondaryLabel}
            </a>

          </div>

        </motion.div>
      </SectionContainer>
    </Section>
  );
}