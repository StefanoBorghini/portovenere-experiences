"use client";

import { motion } from "framer-motion";

import { useTranslations } from "next-intl";

import Section
from "@/components/layout/Section";

import SectionContainer
from "@/components/layout/SectionContainer";

import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

import Countdown
from "@/components/countdown";

import { trackWhatsappClick } from "@/lib/analytics/gtag";

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

  const t = useTranslations("proposal");
  const tc = useTranslations("common");

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

          {/* COUNTDOWN — una volta che bookingState diventa "sent"
              (mail confermata), il countdown si ferma DEFINITIVAMENTE:
              il componente <Countdown> viene smontato (quindi il suo
              interval interno viene distrutto) e non viene MAI PIU'
              rimontato, nemmeno se in seguito il cliente modifica la
              selezione (hasUnconfirmedChanges non ha piu' effetto qui
              apposta — prima invece faceva ricomparire il countdown,
              ripartendolo da capo, che e' esattamente cio' che non
              deve piu' succedere).
              hasUnconfirmedChanges resta comunque disponibile come
              prop per altri usi (es. testo del bottone in
              FloatingPriceBar), semplicemente non condiziona piu'
              questa sezione. */}

          <div
            className="
              mb-12
              md:mb-32
            "
          >

            {bookingState === "sent" ? (

              <div className="text-center">

                <p className="
                  uppercase
                  tracking-[0.45em]
                  text-[11px]
                  text-zinc-600
                  mb-8
                ">
                  {t("reservation.label")}
                </p>

                <p className="
                  text-2xl
                  md:text-4xl
                  font-light
                  text-emerald-300/80
                ">
                  {t("reservation.bookingConfirmed")}
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
            {t("reservation.label")}
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

            {t("reservation.title")}

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

            {closingParagraph || t("reservation.description")}

          </p>

          {/* CONTACT — solo il link diretto, senza il nome del brand
              ripetuto (gia' presente altrove nella pagina) */}

          <div
            className="
              mb-12
              md:mb-24
            "
          >

            <a
              href={whatsappUrl}
              target="_blank"
              onClick={() =>
                trackWhatsappClick("reservation_section")
              }
              className="
                inline-block
                border
                border-white/20
                rounded-full
                px-6
                py-3

                text-white/60
                text-[11px]
                uppercase
                tracking-[0.22em]

                hover:border-white/40
                hover:text-white
                transition-all
                duration-500
              "
            >
              {tc("speakWithTeam")}
            </a>

          </div>

          {/* Il messaggio di stato (conferma email / errore) e' stato
              spostato su FloatingPriceBar, subito sopra il bottone
              di azione — e' li' che l'utente guarda dopo aver
              cliccato "Reserve Now" / "Confirm Changes". Qui restano
              solo countdown, testo introduttivo e contatto WhatsApp. */}

        </motion.div>
      </SectionContainer>
    </Section>
  );
}