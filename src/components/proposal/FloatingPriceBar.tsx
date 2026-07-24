"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type BookingState = "idle" | "sending" | "sent" | "error";

interface FloatingPriceBarProps {

  experienceCount: number;

  totalPrice: number;

  bookingState: BookingState;

  onRequestBooking: () => void;

  hasUnconfirmedChanges?: boolean;

  leadName?: string;

  leadEmail?: string;

  alreadyVerified?: boolean;

}

export default function FloatingPriceBar({

  experienceCount,

  totalPrice,

  bookingState,

  onRequestBooking,

  hasUnconfirmedChanges = false,

  leadName,

  leadEmail,

  alreadyVerified = false,

}: FloatingPriceBarProps) {

  const t = useTranslations("proposal");
  const tc = useTranslations("common");

  const [visible, setVisible] = useState(false);

  useEffect(() => {

    function handleScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.85);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  const isBusy = bookingState === "sending";
  const isDone = bookingState === "sent" && !hasUnconfirmedChanges;

  const actionLabel = isDone
    ? t("floatingBar.requestSent")
    : isBusy
    ? t("floatingBar.sending")
    : hasUnconfirmedChanges
    ? t("floatingBar.confirmChanges")
    : tc("reserveNow");

  const showArrow = !isDone && !isBusy;

  // =====================================================
  // MESSAGGIO DI STATO — mostrato appena sopra il bottone,
  // stesso testo che prima viveva solo in fondo pagina
  // (ReservationSection). Compare solo quando c'e' qualcosa
  // da comunicare (richiesta confermata o errore).
  // =====================================================

  const statusMessage =

    isDone
      ? (alreadyVerified
          ? t("floatingBar.thankYouVerified", { name: leadName || t("floatingBar.someone") })
          : t("floatingBar.checkInbox", { email: leadEmail || "" }))
      : bookingState === "error"
      ? t("floatingBar.genericError")
      : null;

  return (

    <AnimatePresence>

      {visible && (

        <motion.div

          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}

          className="
            fixed
            bottom-14
            md:bottom-6
            left-1/2
            -translate-x-1/2
            z-50

            w-[92vw]
            max-w-sm
            md:w-auto

            flex
            flex-col
            items-center
            gap-3
          "
        >

          {/* MESSAGGIO DI STATO — stesso trattamento visivo della
              pill sottostante (bordo/blur/sfondo nero semi-trasparente/
              ombra), cosi' resta leggibile sempre, a prescindere da
              cosa scorre dietro durante lo scroll. Prima era testo
              "nudo" senza sfondo, illeggibile su sfondi chiari. */}

          {statusMessage && (

            <div
              className="
                w-full
                md:w-auto
                max-w-sm

                px-5
                py-3

                rounded-[20px]
                md:rounded-full

                border
                border-white/12
                backdrop-blur-[10px]
                bg-black/70
                shadow-[0_8px_40px_rgba(0,0,0,0.4)]
              "
            >

              <p
                className={`
                  text-center
                  text-[12px]
                  md:text-[13px]
                  leading-relaxed

                  ${
                    bookingState === "error"
                      ? "text-red-400"
                      : "text-white/70"
                  }
                `}
              >
                {statusMessage}
              </p>

            </div>

          )}

          {/* PILL — bordo, prezzo, bottone azione */}

          <div
            className="
              w-full
              md:w-auto

              flex
              flex-col
              items-stretch

              md:flex-row
              md:items-center

              border
              border-white/12
              rounded-[28px]
              md:rounded-full
              backdrop-blur-[10px]
              bg-black/70
              shadow-[0_8px_40px_rgba(0,0,0,0.4)]
              overflow-hidden
            "
          >

          {/* CONTEGGIO ESPERIENZE — riga propria, solo su mobile.
              Su desktop e' invece incorporato nella riga principale
              qui sotto (span "hidden md:inline"). */}

          <span className="
            md:hidden
            text-center
            uppercase
            tracking-[0.3em]
            text-[9px]
            text-white/40
            pt-4
            pb-2.5
          ">
            {experienceCount === 1 ? t("floatingBar.experienceSingular", { count: experienceCount }) : t("floatingBar.experiencePlural", { count: experienceCount })}
          </span>

          {/* RIGA PRINCIPALE — prezzo (+ conteggio su desktop) a
              sinistra, bottone azione a destra. Il bordo sottile
              sopra (solo mobile) separa visivamente dal conteggio. */}

          <div className="
            flex
            items-center
            justify-between
            md:justify-start
            w-full
            md:w-auto

            border-t
            border-white/[0.07]
            md:border-t-0
          ">

            <div className="
              flex
              items-center
              gap-4
              md:gap-6
              pl-6
              md:pl-8
              pr-5
              py-4
              shrink-0
            ">

              <span className="
                hidden
                md:inline
                uppercase
                tracking-[0.25em]
                text-[10px]
                text-white/45
                whitespace-nowrap
              ">
                {experienceCount === 1 ? t("floatingBar.experienceSingular", { count: experienceCount }) : t("floatingBar.experiencePlural", { count: experienceCount })}
              </span>

              <span className="
                text-[19px]
                md:text-[22px]
                font-[300]
                tracking-[-0.03em]
                text-white
                whitespace-nowrap
              ">
                €{totalPrice.toLocaleString()}
              </span>

            </div>

            {/* PARTE AZIONE — bottone bianco, chiaramente cliccabile,
                stesso linguaggio visivo dei CTA primari nel resto del sito */}

            <button
              type="button"
              onClick={onRequestBooking}
              disabled={isBusy || isDone}
              className="
                self-stretch
                shrink-0
                flex
                items-center
                justify-center
                gap-2

                bg-white
                text-black

                pl-5
                pr-6
                md:pl-6
                md:pr-8
                py-4

                uppercase
                tracking-[0.2em]
                text-[11px]
                font-medium

                whitespace-nowrap

                transition-all
                duration-300

                hover:bg-white/90

                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              {actionLabel}
              {showArrow && <span aria-hidden="true">→</span>}

            </button>

          </div>

          </div>

        </motion.div>

      )}

    </AnimatePresence>
  );
}