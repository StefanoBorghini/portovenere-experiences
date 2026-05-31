"use client";

import { useState } from "react";

interface Enhancement {

    image: string;

    title: string;

    description: string;
}

interface ProposalEnhancementsProps {

    enhancements: Enhancement[];
}

export default function ProposalEnhancements({

    enhancements,

}: ProposalEnhancementsProps) {

    const [
        selectedEnhancements,
        setSelectedEnhancements,
    ] = useState<string[]>([]);

    function toggleEnhancement(
        title: string
    ) {

        if (
            selectedEnhancements.includes(
                title
            )
        ) {

            setSelectedEnhancements(

                selectedEnhancements.filter(
                    (item) =>
                        item !== title
                )
            );

        } else {

            setSelectedEnhancements([
                ...selectedEnhancements,
                title,
            ]);
        }
    }

    return (

        <section className="
      py-28
      md:py-40
      px-6
      bg-black
    ">

            <div className="
        max-w-7xl
        mx-auto
      ">

                {/* HEADER */}

                <div className="
          text-center
          mb-24
        ">

                    <p className="
            uppercase
            tracking-[0.35em]
            text-zinc-500
            text-xs
            mb-6
          ">
                        Optional Enhancements
                    </p>

                    <h2 className="
            text-4xl
            md:text-7xl
            font-light
            tracking-tight
            leading-none
            mb-8
          ">

                        Enhance Your Riviera Escape

                    </h2>

                    <p className="
            text-zinc-400
            text-lg
            max-w-3xl
            mx-auto
            leading-relaxed
          ">

                        Additional private services
                        available to further personalize
                        your Riviera experience.

                    </p>

                </div>

                {/* GRID */}

                <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-8
        ">

                    {enhancements.map(
                        (enhancement) => {

                            const isSelected =
                                selectedEnhancements.includes(
                                    enhancement.title
                                );

                            return (

                                <button
                                    key={
                                        enhancement.title
                                    }
                                    onClick={() =>
                                        toggleEnhancement(
                                            enhancement.title
                                        )
                                    }
                                    className={`
                    group
                    text-left
                    overflow-hidden
                    rounded-[32px]
                    border
                    transition-all
                    duration-500
                    bg-white/[0.03]
                    min-h-[520px]
                    md:min-h-[580px]
                    p-0

                    ${isSelected

                                            ? `
                          border-white/40
bg-white
text-white
shadow-[0_0_0_2px_rgba(255,255,255,0.15)]
                        `

                                            : `
                          border-white/10
                          hover:border-white/30
                        `
                                        }
                  `}
                                >

                                    {/* IMAGE */}

                                    <img
                                        src={
                                            enhancement.image
                                        }
                                        alt={
                                            enhancement.title
                                        }
                                        className="
  w-full
  h-[220px]
  object-cover
  rounded-t-[32px]
  transition-transform
  duration-700
  group-hover:scale-[1.03]
"
                                    />

                                    {/* CONTENT */}

                                    <div className="
  px-8
  pb-8
  pt-6
">

                                        <h3 className="
                      text-2xl
                      md:text-3xl
                      font-light
                      tracking-tight
                      mb-5
                    ">

                                            {
                                                enhancement.title
                                            }

                                        </h3>

                                        <p className="
                      text-zinc-400
                      leading-relaxed
                      mb-8
                    ">

                                            {
                                                enhancement.description
                                            }

                                        </p>

                                        <div className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-full
                      border
                      px-5
                      py-3
                      text-sm
                      tracking-[0.2em]
                      uppercase
                      transition-all
                      duration-300

                      ${
                        isSelected

                          ? `
                            
border-transparent
  bg-white
  text-black
  shadow-[0_0_0_1px_rgba(255,255,255,0.12),
  0_0_0_8px_rgba(255,255,255,0.06)]
                          `

                          : `
                            border-white/20
                            text-black
                          `
                      }
                    ">

                                            {isSelected

                                                ? "Enhancement Requested"

                                                : "Request Enhancement"}

                                        </div>

                                    </div>

                                </button>
                            );
                        }
                    )}

                </div>

            </div>

        </section>
    );
}