
"use client";

import {
  useAnimationFrame,
} from "framer-motion";

import { motion }
from "framer-motion";

import Section
from "@/components/layout/Section";

import SectionContainer
from "@/components/layout/SectionContainer";

import SectionHeader
from "@/components/layout/SectionHeader";

import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

import {
  useRef,
  useState,
  useEffect,
} from "react";

import {
  proposalConfig,
} from "@/config/proposalConfig";

interface CinematicGalleryProps {

  images: string[];

  label?: string;

  title?: string;
}

export default function CinematicGallery({

  images,

  label = proposalConfig.gallery.label,

  title = proposalConfig.gallery.title,

}: CinematicGalleryProps) {

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [isPaused, setIsPaused] =
    useState(false);

  // =====================================================
  // DRAG SYSTEM
  // =====================================================

  useEffect(() => {

    const slider =
      containerRef.current;

    if (!slider) return;

    let isDown = false;

    let startX = 0;

    let scrollLeft = 0;

    // -----------------------------
    // MOUSE
    // -----------------------------

    const handleMouseDown = (
      e: MouseEvent
    ) => {

      isDown = true;

      slider.classList.add(
        "cursor-grabbing"
      );

      startX =
        e.pageX -
        slider.offsetLeft;

      scrollLeft =
        slider.scrollLeft;
    };

    const handleMouseLeave =
      () => {

        isDown = false;

        slider.classList.remove(
          "cursor-grabbing"
        );
      };

    const handleMouseUp = () => {

      isDown = false;

      slider.classList.remove(
        "cursor-grabbing"
      );
    };

    const handleMouseMove = (
      e: MouseEvent
    ) => {

      if (!isDown) return;

      e.preventDefault();

      const x =
        e.pageX -
        slider.offsetLeft;

      const walk =
        (x - startX) * 1.5;

      slider.scrollLeft =
        scrollLeft - walk;
    };

    // -----------------------------
    // TOUCH
    // -----------------------------

    let touchStartX = 0;

    let touchScrollLeft = 0;

    const handleTouchStart = (
      e: TouchEvent
    ) => {

      touchStartX =
        e.touches[0].pageX;

      touchScrollLeft =
        slider.scrollLeft;
    };

    const handleTouchMove = (
      e: TouchEvent
    ) => {

      const touchX =
        e.touches[0].pageX;

      const walk =
        (touchX - touchStartX) * 1.2;

      slider.scrollLeft =
        touchScrollLeft - walk;
    };

    // -----------------------------
    // EVENTS
    // -----------------------------

    slider.addEventListener(
      "mousedown",
      handleMouseDown
    );

    slider.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    slider.addEventListener(
      "mouseup",
      handleMouseUp
    );

    slider.addEventListener(
      "mousemove",
      handleMouseMove
    );

    slider.addEventListener(
      "touchstart",
      handleTouchStart
    );

    slider.addEventListener(
      "touchmove",
      handleTouchMove
    );

    return () => {

      slider.removeEventListener(
        "mousedown",
        handleMouseDown
      );

      slider.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );

      slider.removeEventListener(
        "mouseup",
        handleMouseUp
      );

      slider.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      slider.removeEventListener(
        "touchstart",
        handleTouchStart
      );

      slider.removeEventListener(
        "touchmove",
        handleTouchMove
      );
    };

  }, []);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useAnimationFrame(() => {

    if (
      !containerRef.current ||
      isPaused
    ) return;

    containerRef.current.scrollLeft +=
      0.35;

    // infinite illusion

    if (

      containerRef.current.scrollLeft >=

      containerRef.current.scrollWidth / 2

    ) {

      containerRef.current.scrollLeft =
        0;
    }
  });

  // =====================================================
  // LOOP IMAGES
  // =====================================================

  const loopImages = [
    ...images,
    ...images,
  ];

  // =====================================================
  // MANUAL NAVIGATION
  // =====================================================

  function scrollGallery(
    direction: "left" | "right"
  ) {

    if (!containerRef.current)
      return;

    const amount =
      window.innerWidth < 768
        ? window.innerWidth * 0.9
        : window.innerWidth * 0.35;

    containerRef.current.scrollBy({

      left:
        direction === "left"
          ? -amount
          : amount,

      behavior: "smooth",
    });
  }

  return (

    <Section>

      {/* ATMOSPHERIC BACKGROUND */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.03]
          pointer-events-none
          bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]
        "
      />

      {/* HEADER */}
<SectionContainer>

  <motion.div

    variants={fadeReveal}

    initial="initial"

    whileInView="animate"

    viewport={{
      once: true,
      amount: 0.2,
    }}

    transition={{
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    }}

    className="
      relative
      z-10
      mb-28
      md:mb-40
    "
  >

    <SectionHeader
      label={label}
      title={title}
    />

  </motion.div>

</SectionContainer>

      {/* LEFT ARROW */}

      <div
        className="
          absolute
          top-1/2
          left-6
          z-20

          hidden
          md:block
        "
      >

        <button
          onClick={() =>
            scrollGallery("left")
          }
          className="
            opacity-0
            group-hover:opacity-100

            transition-all
            duration-700

            flex
            items-center
            justify-center

            w-16
            h-16

            rounded-full

            border
            border-white/10

            bg-black/20
            backdrop-blur-[4px]

            text-white/70
            hover:text-white
            hover:border-white/20
          "
        >

          <span
            className="
              text-5xl
              font-thin
              leading-none
            "
          >
            ‹
          </span>

        </button>

      </div>

      {/* RIGHT ARROW */}

      <div
        className="
          absolute
          top-1/2
          right-6
          z-20

          hidden
          md:block
        "
      >

        <button
          onClick={() =>
            scrollGallery("right")
          }
          className="
            opacity-0
            group-hover:opacity-100

            transition-all
            duration-700

            flex
            items-center
            justify-center

            w-16
            h-16

            rounded-full

            border
            border-white/10

            bg-black/20
            backdrop-blur-[4px]

            text-white/70
            hover:text-white
            hover:border-white/20
          "
        >

          <span
            className="
              text-5xl
              font-thin
              leading-none
            "
          >
            ›
          </span>

        </button>

      </div>

      {/* GALLERY */}

      <div
        ref={containerRef}

        style={{
          touchAction:
            "pan-y pinch-zoom",
        }}

        onMouseEnter={() =>
          setIsPaused(true)
        }

        onMouseLeave={() =>
          setIsPaused(false)
        }

        onTouchStart={() =>
          setIsPaused(true)
        }

        onTouchEnd={() =>
          setIsPaused(false)
        }

        className="
          relative
          z-10
          select-none
          flex

          gap-8
          md:gap-10

          overflow-x-auto
          no-scrollbar

          px-6
          py-10
          md:py-20

          cursor-grab
          active:cursor-grabbing
        "
      >

        {loopImages.map(
          (
            image,
            index
          ) => (

            <div
              key={index}

              className={`
                relative
                shrink-0
                will-change-transform
                w-[88vw]
                md:w-[30vw]

                overflow-hidden
                rounded-[40px]

                group

                ${
                  index % 4 === 0
                    ? "h-[68vh] md:h-[78vh]"
                    : ""
                }

                ${
                  index % 4 === 1
                    ? "h-[82vh] md:h-[92vh] md:translate-y-10"
                    : ""
                }

                ${
                  index % 4 === 2
                    ? "h-[74vh] md:h-[84vh]"
                    : ""
                }

                ${
                  index % 4 === 3
                    ? "h-[88vh] md:h-[98vh] md:-translate-y-6"
                    : ""
                }
              `}
            >

              {/* IMAGE */}

              <img
                src={image}
                alt="Experience"
                pointer-events-none
                select-none
                draggable={false}

                className="
                  w-full
                  h-full

                  object-cover

                  transition-transform
                  duration-[2200ms]
                  ease-out

                  group-hover:scale-[1.03]
                "
              />

              {/* OVERLAY */}

              <div
                className="
                  absolute
                  inset-0

                  bg-gradient-to-t
                  from-black/35
                  via-transparent
                  to-transparent
                "
              />

              {/* RADIAL OVERLAY */}

              <div
                className="
                  absolute
                  inset-0

                  bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.18))]
                "
              />

            </div>
          )
        )}

      </div>

    </Section>
  );
}
