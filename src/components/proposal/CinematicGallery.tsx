"use client";

import {
  motion,
  useAnimationFrame,
} from "framer-motion";

import {
  useRef,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CinematicGalleryProps {

  images: string[];
}

export default function CinematicGallery({

  images,

}: CinematicGalleryProps) {

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [isPaused, setIsPaused] =
    useState(false);

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

    // infinite loop illusion

    if (

      containerRef.current.scrollLeft >=

      containerRef.current.scrollWidth / 2

    ) {

      containerRef.current.scrollLeft =
        0;
    }
  });

  // duplicate images for infinite illusion

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

    <section className="
      py-28
      md:py-40
      bg-black
      overflow-hidden
      relative
    ">

      {/* HEADER */}

      <div className="
        text-center
        px-6
        mb-20
      ">

        <p className="
          uppercase
          tracking-[0.35em]
          text-zinc-500
          text-xs
          mb-6
        ">
          Experience Gallery
        </p>

        <h2 className="
          text-4xl
          md:text-7xl
          font-light
          tracking-tight
          leading-none
        ">

          Moments from the Riviera

        </h2>

      </div>

      {/* ARROWS */}

      <div className="
        absolute
        top-1/2
        left-6
        z-20
        hidden
        md:block
      ">

        <button
          onClick={() =>
            scrollGallery("left")
          }
          className="
            px-4
            py-2
            text-white/70
            hover:text-white
            transition
            border-white/20
            bg-black/40
            backdrop-blur-md
            flex
            items-center
            justify-center
            hover:border-white/40
            transition
          "
        >

<span className="
  text-5xl
  font-thin
  leading-none
">
  ‹
</span>
        </button>

      </div>

      <div className="
        absolute
        top-1/2
        right-6
        z-20
        hidden
        md:block
      ">

        <button
          onClick={() =>
            scrollGallery("right")
          }
          className="
           px-4
            py-2
            text-white/70
            hover:text-white
            transition
            border-white/20
            bg-black/40
            backdrop-blur-md
            flex
            items-center
            justify-center
            hover:border-white/40
            transition
          "
        >

<span className="
  text-5xl
  font-thin
  leading-none
">
  ›
</span>
        </button>

      </div>

      {/* GALLERY */}

      <motion.div
        ref={containerRef}
        drag="x"
        dragConstraints={{
          left: -1000,
          right: 1000,
        }}
        onMouseEnter={() =>
          setIsPaused(true)
        }
        onMouseLeave={() =>
          setIsPaused(false)
        }
        className="
          flex
          gap-6
          overflow-x-scroll
          no-scrollbar
          px-6
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
              className="
                relative
                shrink-0

                w-[88vw]
                md:w-[30vw]

                h-[65vh]
                md:h-[80vh]

                overflow-hidden
                rounded-[32px]
                group
              "
            >

              <img
                src={image}
                alt="Experience"
                className="
                  w-full
                  h-full
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-[1.03]
                "
              />

              <div className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/20
                to-transparent
              " />

            </div>
          )
        )}

      </motion.div>

    </section>
  );
}