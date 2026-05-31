
"use client";

import { motion } from "framer-motion";

interface ExperienceCard {
  image: string;
  title: string;
  description: string;
  details: string[];
}

interface IncludedExperiencesProps {
  experiences: ExperienceCard[];
}

export default function IncludedExperiences({
  experiences,
}: IncludedExperiencesProps) {

  return (

    <section
      className="
        relative
        py-32
        md:py-48
        px-6
        bg-black
        overflow-hidden
      "
    >

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

      <div
        className="
          max-w-7xl
          mx-auto
          relative
          z-10
        "
      >

        {/* HEADER */}

        <motion.div

          initial={{
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
          }}

          whileInView={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}

          viewport={{
            once: true,
            amount: 0.3,
          }}

          transition={{
            duration: 1.4,
            ease: [0.22, 1, 0.36, 1],
          }}

          className="
            text-center
            mb-32
            md:mb-40
          "
        >

          <p
            className="
              uppercase
              tracking-[0.35em]
              text-[11px]
              text-white/40
              mb-8
            "
          >
            Included Experiences
          </p>

          <h2
            className="
              text-4xl
              md:text-7xl
              font-light
              tracking-[-0.04em]
              leading-[0.98]
              max-w-5xl
              mx-auto
            "
          >

            Curated Riviera Moments

          </h2>

        </motion.div>

        {/* GRID */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-10
            md:gap-14
          "
        >

          {experiences.map(
            (
              experience,
              index
            ) => (

              <motion.div

                key={experience.title}

                initial={{
                  opacity: 0,
                  y: 30,
                  filter: "blur(12px)",
                }}

                whileInView={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}

                viewport={{
                  once: true,
                  amount: 0.2,
                }}

                transition={{
                  duration: 1.3,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}

                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-[36px]
                  bg-white/[0.02]
                  border
                  border-white/[0.06]
                  backdrop-blur-[4px]

                  ${
                    index === 1
                      ? "md:translate-y-16"
                      : ""
                  }

                  ${
                    index === 2
                      ? "md:-translate-y-6"
                      : ""
                  }
                `}
              >

                {/* IMAGE */}

                <div
                  className="
                    relative
                    overflow-hidden
                  "
                >

                  <img
                    src={experience.image}
                    alt={experience.title}
                    className={`
                      w-full
                      object-cover
                      transition-transform
                      duration-[1600ms]
                      ease-out
                      group-hover:scale-[1.02]

                      ${
                        index === 0
                          ? "h-[360px] md:h-[460px]"
                          : ""
                      }

                      ${
                        index === 1
                          ? "h-[420px] md:h-[560px]"
                          : ""
                      }

                      ${
                        index === 2
                          ? "h-[380px] md:h-[500px]"
                          : ""
                      }
                    `}
                  />

                  {/* IMAGE OVERLAY */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/30
                      via-transparent
                      to-transparent
                    "
                  />

                </div>

                {/* CONTENT */}

                <div
                  className="
                    p-10
                    md:p-12
                  "
                >

                  <h3
                    className="
                      text-[32px]
                      md:text-[38px]
                      leading-[1.02]
                      tracking-[-0.03em]
                      font-light
                      mb-7
                      max-w-[90%]
                    "
                  >

                    {experience.title}

                  </h3>

                  <p
                    className="
                      text-[15px]
                      md:text-[16px]
                      leading-[1.9]
                      tracking-[-0.01em]
                      text-white/62
                      mb-10
                      max-w-[90%]
                    "
                  >

                    {experience.description}

                  </p>

                  {/* DETAILS */}

                  <div
                    className="
                      space-y-4
                    "
                  >

                    {experience.details.map(
                      (detail) => (

                        <div
                          key={detail}
                          className="
                            flex
                            items-center
                            gap-4
                            text-white/70
                          "
                        >

                          <div
                            className="
                              w-1.5
                              h-1.5
                              rounded-full
                              bg-white/70
                              shrink-0
                            "
                          />

                          <span
                            className="
                              text-[14px]
                              tracking-[-0.01em]
                            "
                          >

                            {detail}

                          </span>

                        </div>
                      )
                    )}

                  </div>

                </div>

              </motion.div>
            )
          )}

        </div>

      </div>

    </section>
  );
}
