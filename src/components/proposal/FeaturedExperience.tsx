interface FeaturedExperienceProps {

  image: string;

  operator: string;

  subtitle: string;

  description: string;

  essentials: string[];

  embarkPoint?: string;

  duration?: string;

  guests?: string;
}

import { motion } from "framer-motion";

export default function FeaturedExperience({

  image,

  operator,

  subtitle,

  description,

  essentials,

  embarkPoint = "Portovenere",

  duration = "Full Day",

  guests = "Up to 8 Guests",

}: FeaturedExperienceProps) {

  return (

    <section className="
      py-24
      md:py-40
      px-6
      bg-black
    ">

      <div className="
        max-w-7xl
        mx-auto
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-16
        items-center
      ">

        {/* LEFT INFO */}

       <motion.div

  initial={{
    opacity: 0,
    y: 24,
  }}

  whileInView={{
    opacity: 1,
    y: 0,
  }}

  viewport={{
    once: true,
    amount: 0.2,
  }}

  transition={{
    duration: 0.9,
    ease: [0.22, 1, 0.36, 1],
  }}

  className="
    order-1
    text-center
    lg:text-left
  "
>

          <div className="
            bg-white/[0.03]
            border
            border-white/10
            rounded-[36px]
            p-10
            md:p-14
            backdrop-blur-sm
          ">

            {/* LABEL */}

            <p className="
              uppercase
              tracking-[0.35em]
              text-zinc-500
              text-xs
              mb-8
            ">
              Featured Experience
            </p>

            {/* OPERATOR */}

            <h2 className="
              text-5xl
              md:text-7xl
              font-light
              tracking-tight
              leading-none
              mb-6
            ">

              {operator}

            </h2>

            {/* SUBTITLE */}

            <p className="
              text-zinc-300
              text-xl
              md:text-2xl
              leading-relaxed
              mb-10
            ">

              {subtitle}

            </p>

            {/* DESCRIPTION */}

            <p className="
              text-zinc-500
              text-lg
              leading-relaxed
              mb-14
            ">

              {description}

            </p>

            {/* TECHNICAL DETAILS */}

            <div className="
              space-y-5
              mb-14
            ">

              <div className="
                flex
                justify-between
                border-b
                border-white/10
                pb-4
              ">

                <span className="
                  text-zinc-500
                ">
                  Embark Point
                </span>

                <span className="
                  text-white
                ">
                  {embarkPoint}
                </span>

              </div>

              <div className="
                flex
                justify-between
                border-b
                border-white/10
                pb-4
              ">

                <span className="
                  text-zinc-500
                ">
                  Duration
                </span>

                <span className="
                  text-white
                ">
                  {duration}
                </span>

              </div>

              <div className="
                flex
                justify-between
                border-b
                border-white/10
                pb-4
              ">

                <span className="
                  text-zinc-500
                ">
                  Guests
                </span>

                <span className="
                  text-white
                ">
                  {guests}
                </span>

              </div>

            </div>

            {/* EXPERIENCE ESSENTIALS */}

            <div className="
              space-y-4
              flex
              flex-col
              items-center
              lg:items-start
            ">

              {essentials.map(
                (item) => (

                  <div
                    key={item}
                    className="
                      flex
                      items-center
                      gap-4
                      text-zinc-300
                    "
                  >

                    <div className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-white
                    " />

                    <span className="
                      text-base
                      md:text-lg
                    ">

                      {item}

                    </span>

                  </div>
                )
              )}

            </div>

          </div>

        </motion.div>

        {/* RIGHT IMAGE */}

        <div className="
          order-2
        ">

          <motion.div

  initial={{
    opacity: 0,
    scale: 1.04,
  }}

  whileInView={{
    opacity: 1,
    scale: 1,
  }}

  viewport={{
    once: true,
    amount: 0.3,
  }}

  transition={{
    duration: 1.2,
    ease: [0.22, 1, 0.36, 1],
  }}

  className="
    relative
    overflow-hidden
    rounded-[36px]
  "
>
            <img
              src={image}
              alt={operator}
              className="
                w-full
                h-[420px]
                md:h-[700px]
                object-cover
              "
            />

            <div className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/20
              to-transparent
            " />

          

        </motion.div>
</div>
</div>
      

    </section>
  );
}