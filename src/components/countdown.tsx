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

  useEffect(() => {

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
            "Private reservation expired"
          );

          clearInterval(
            interval
          );

          // redirect after short delay

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

    return () =>
      clearInterval(
        interval
      );

  }, [expiresAt]);

  return (

    <div className="text-center">

      <p className="
        uppercase
        tracking-[0.3em]
        text-[11px]
        text-zinc-500
        mb-5
      ">
        Private proposal reserved for
      </p>

      <div className="
        text-5xl
        md:text-7xl
        font-light
        tracking-tight
      ">

        {timeLeft}

      </div>

      {expired && (

        <p className="
          mt-6
          text-zinc-500
          text-sm
        ">
          Redirecting...
        </p>

      )}

    </div>
  );
}