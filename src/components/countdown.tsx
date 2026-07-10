"use client";

import {
  useEffect,
  useState,
} from "react";

interface CountdownProps {

  expiresAt: string;
}

export default function Countdown({

  expiresAt,

}: CountdownProps) {

  const [timeLeft, setTimeLeft] =
    useState("");

  const [expired, setExpired] =
    useState(false);

  const [hoursLeft, setHoursLeft] =
    useState(48);

  useEffect(() => {

    // Riferimento al timeout di redirect: deve essere ripulito
    // anche lui quando il componente si smonta (es. il cliente
    // conferma la prenotazione proprio mentre il countdown sta
    // scadendo) — altrimenti il redirect a /proposal-expired
    // scatta comunque 3s dopo, anche a countdown gia' nascosto.
    let redirectTimeout: ReturnType<typeof setTimeout> | null = null;

    const interval =
      setInterval(() => {

        const now =
          new Date().getTime();

        const target =
          new Date(
            expiresAt
          ).getTime();

        const difference =
          target - now;

        // =====================================================
        // EXPIRED
        // =====================================================

        if (difference <= 0) {

          setExpired(true);

          setTimeLeft(
            "00h 00m 00s"
          );

          clearInterval(
            interval
          );

          redirectTimeout =
            setTimeout(() => {

              window.location.href =
                "/proposal-expired";

            }, 3000);

          return;
        }

        // =====================================================
        // TIME
        // =====================================================

        const hours =
          Math.floor(
            difference /
            (1000 * 60 * 60)
          );

        const minutes =
          Math.floor(
            (
              difference %
              (1000 * 60 * 60)
            ) /
            (1000 * 60)
          );

        const seconds =
          Math.floor(
            (
              difference %
              (1000 * 60)
            ) /
            1000
          );

        setHoursLeft(hours);

        const formattedHours =

          String(hours)
            .padStart(2, "0");

        const formattedMinutes =

          String(minutes)
            .padStart(2, "0");

        const formattedSeconds =

          String(seconds)
            .padStart(2, "0");

        setTimeLeft(

          `${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`
        );

      }, 950);

    return () => {

      clearInterval(
        interval
      );

      // Pulizia anche del redirect pendente, non solo dell'interval:
      // se il componente si smonta prima dei 3s (es. bookingState
      // passa a "sent" e ReservationSection nasconde il Countdown),
      // il redirect programmato non deve piu' scattare.
      if (redirectTimeout) {

        clearTimeout(
          redirectTimeout
        );

      }

    };

  }, [expiresAt]);

  // =====================================================
  // DYNAMIC URGENCY COLORS
  // =====================================================

  let urgencyClass =

    "text-white";

  if (hoursLeft <= 12) {

    urgencyClass =
      "text-amber-200";
  }

  if (hoursLeft <= 3) {

    urgencyClass =
      "text-red-300";
  }

  return (

    <div className="text-center">

      {/* LABEL */}

      <p className="
        uppercase
        tracking-[0.45em]
        text-[11px]
        text-zinc-600
        mb-8
      ">
        Private Reservation
      </p>

      {/* TIMER */}

      <div className="
        relative
        inline-block
      ">

        {/* GLOW */}

        <div className="
          absolute
          inset-0
          blur-3xl
          opacity-20
          bg-white
          rounded-full
          animate-pulse
        " />

        {/* TIME */}

        <div
          className={`
            relative
            text-5xl
            md:text-8xl
            font-light
            tracking-tight
            transition-all
            duration-700
            ${urgencyClass}
          `}
        >

          {timeLeft}

        </div>

      </div>

      {/* SUBTEXT */}

      <div className="
        mt-10
        max-w-2xl
        mx-auto
      ">

        <p className="
          text-zinc-500
          text-sm
          md:text-base
          leading-8
        ">

          Your curated Riviera proposal
          remains privately reserved
          for a limited time.

        </p>

      </div>

      {/* EXPIRED */}

      {expired && (

        <p className="
          mt-8
          text-zinc-500
          text-sm
          animate-pulse
        ">
          Redirecting...
        </p>

      )}

    </div>
  );
}