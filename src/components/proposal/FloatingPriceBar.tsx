"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type BookingState = "idle" | "sending" | "sent" | "error";

interface FloatingPriceBarProps {

  experienceCount: number;

  totalPrice: number;

  bookingState: BookingState;

  onRequestBooking: () => void;

  hasUnconfirmedChanges?: boolean;

}

export default function FloatingPriceBar({

  experienceCount,

  totalPrice,

  bookingState,

  onRequestBooking,

  hasUnconfirmedChanges = false,

}: FloatingPriceBarProps) {

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
            bottom-6
            left-1/2
            -translate-x-1/2
            z-50
            flex
            items-center
            border
            border-white/12
            rounded-full
            backdrop-blur-[10px]
            bg-black/70
            shadow-[0_8px_40px_rgba(0,0,0,0.4)]
            overflow-hidden
          "
        >

          {/* PARTE INFORMATIVA — prezzo e conteggio, non cliccabile */}

          <div className="
            flex
            items-center
            gap-4
            md:gap-6
            pl-6
            md:pl-8
            pr-5
            py-4
          ">

            <span className="
              uppercase
              tracking-[0.25em]
              text-[9px]
              md:text-[10px]
              text-white/45
              whitespace-nowrap
              hidden
              sm:inline
            ">
              {experienceCount} Experience{experienceCount !== 1 ? "s" : ""}
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
              h-full
              flex
              items-center
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

            {isDone
              ? "Request Sent ✓"
              : isBusy
              ? "Sending..."
              : hasUnconfirmedChanges
              ? (
                <>
                  Confirm Changes
                  <span aria-hidden="true">→</span>
                </>
              )
              : (
                <>
                  Reserve Now
                  <span aria-hidden="true">→</span>
                </>
              )}

          </button>

        </motion.div>

      )}

    </AnimatePresence>
  );
}