"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type BookingState = "idle" | "sending" | "sent" | "error";

interface FloatingPriceBarProps {

  experienceCount: number;

  totalPrice: number;

  bookingState: BookingState;

  onRequestBooking: () => void;

}

export default function FloatingPriceBar({

  experienceCount,

  totalPrice,

  bookingState,

  onRequestBooking,

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
  const isDone = bookingState === "sent";

  return (

    <AnimatePresence>

      {visible && (

        <motion.button

          type="button"

          onClick={onRequestBooking}

          disabled={isBusy || isDone}

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
            gap-6
            border
            border-white/12
            rounded-full
            px-8
            py-4
            backdrop-blur-[10px]
            bg-black/70
            shadow-[0_8px_40px_rgba(0,0,0,0.4)]

            transition-all
            duration-300

            hover:border-white/25
            hover:scale-[1.02]

            disabled:opacity-70
            disabled:cursor-not-allowed
            disabled:hover:scale-100
          "
        >

          <span className="
            uppercase
            tracking-[0.3em]
            text-[10px]
            text-white/50
            whitespace-nowrap
          ">
            {isDone
              ? "Request Sent"
              : isBusy
              ? "Sending..."
              : `${experienceCount} Experience${experienceCount !== 1 ? "s" : ""} Included`}
          </span>

          <span className="
            text-[22px]
            font-[300]
            tracking-[-0.03em]
            text-white
            whitespace-nowrap
          ">
            €{totalPrice.toLocaleString()}
          </span>

        </motion.button>

      )}

    </AnimatePresence>
  );
}