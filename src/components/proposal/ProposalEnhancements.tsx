"use client";

import { useState } from "react";


import { motion } from "framer-motion";

import Section
from "@/components/layout/Section";

import SectionContainer
from "@/components/layout/SectionContainer";

import SectionHeader
from "@/components/layout/SectionHeader";

import {
  formatPrice,
} from "../../lib/pricing/formatPrice";

import {
  fadeReveal,
} from "@/lib/motion/fadeReveal";

import {
  proposalConfig,
} from "@/config/proposalConfig";

interface Enhancement {

    id: number;

  image: string;

    title: string;

    description: string;

    unselected_button_text: string;

    selected_button_text: string;

    base_price: number;

    price_type: string;


}

interface ProposalEnhancementsProps {

  enhancements: Enhancement[];

  selectedEnhancements: number[];

  setSelectedEnhancements: React.Dispatch<
    React.SetStateAction<number[]>
  >;

}
export default function ProposalEnhancements({

    enhancements,

}: ProposalEnhancementsProps) {

   const [selectedEnhancements,
setSelectedEnhancements] =
useState<number[]>([]);

    function toggleEnhancement(
        id: number
    ) {

        if (
            selectedEnhancements.includes(
                id
            )
        ) {

            setSelectedEnhancements(

                selectedEnhancements.filter(
                    (item) =>
                        item !== id
                )
            );

        } else {

            setSelectedEnhancements([
                ...selectedEnhancements,
                id,
            ]);
        }
    }

    return (

     <Section className="bg-black">

          <SectionContainer>

                {/* HEADER */}

             <motion.div

  variants={fadeReveal}

  initial="initial"

  whileInView="animate"

  viewport={{
    once: true,
    amount: 0.3,
  }}

  transition={{
    duration: 1.4,
    ease: [0.22, 1, 0.36, 1],
  }}
>

  <SectionHeader
    label={
    proposalConfig
      .enhancements
      .label
  }
  title={
    proposalConfig
      .enhancements
      .title
  }
  />

</motion.div>

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
                                    enhancement.id
                                );

                                const price = formatPrice(

    enhancement.base_price,

    enhancement.price_type

);

                            return (

                                <button
                                    key={
                                        enhancement.id
                                    }
                                    onClick={() =>
                                        toggleEnhancement(
                                            enhancement.id
                                        )
                                    }
                                    className={`
                    group
                    text-left
                    overflow-hidden
                    flex
                    flex-col
                    justify-start
                    rounded-[32px]
                    border
                    transition-all
                    duration-500
                    bg-white/[0.03]
                  
                    
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
  p-8
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

   
<div className="mb-8">

  {price.label && (

    <p
      className="
        text-[12px]
        uppercase
        tracking-[0.25em]
        text-zinc-500
        mb-2
      "
    >
      {price.label}
    </p>

  )}

  <p
    className="
      text-3xl
      font-light
      tracking-tight
      text-white
    "
  >
    {price.value}
  </p>

</div>


<div
  className={`
    relative
    inline-flex
    rounded-full
  `
  
  }>

  {
  isSelected && (

    <div
      className="
        absolute
        -inset-[4px]
        rounded-full
        border
        border-white/15
        pointer-events-none
      "
    />

  )
}


  <div
    className={`
      inline-flex
      items-center
      justify-center
      w-full
      md:w-auto
      rounded-full
      px-5
      py-3
      text-sm
      tracking-[0.2em]
      uppercase
      text-center
      transition-all
      duration-300
     

      ${
        isSelected

          ? `
            border-transparent
            bg-white
            text-black
          `

          : `
           border-transparent
  text-white
  shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]
          `
      }
    `}
  >

 {isSelected

  ? enhancement.selected_button_text

  : enhancement.unselected_button_text}

  </div>

</div>
</div>


                                </button>
                            );
                        }
                    )}

                </div>

            </SectionContainer>

        </Section>
    );
}