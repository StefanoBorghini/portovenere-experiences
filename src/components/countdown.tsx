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

        if (difference <= 0) {

          setTimeLeft(
            "Proposal expired"
          );

          clearInterval(
            interval
          );

          return;
        }

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

        setTimeLeft(
          `${hours}h ${minutes}m remaining`
        );

      }, 1000);

    return () =>
      clearInterval(
        interval
      );

  }, [expiresAt]);

  return (

    <div className="text-center">

      <p className="uppercase tracking-[0.25em] text-[11px] text-zinc-500 mb-3">
        Private proposal reserved for
      </p>

      <p className="text-2xl font-light text-white">
        {timeLeft}
      </p>

    </div>
  );
}