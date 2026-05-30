interface FeaturedExperienceProps {

  image: string;

  operator: string;

  subtitle: string;

  description: string;

  essentials: string[];
}

export default function FeaturedExperience({

  image,

  operator,

  subtitle,

  description,

  essentials,

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
  gap-14
  items-center
">

        {/* IMAGE */}

       <div className="
  relative
  order-2
  lg:order-1
">

          <img
            src={image}
            alt={operator}
            className="
              w-full
              h-[700px]
              object-cover
              rounded-[32px]
            "
          />

          <div className="
            absolute
            inset-0
            rounded-[32px]
            bg-gradient-to-t
            from-black/20
            to-transparent
          " />

        </div>

        {/* CONTENT */}


<div className="
  order-1
  lg:order-2
  text-center
  lg:text-left
">

          {/* LABEL */}

          <p className="
            uppercase
            tracking-[0.35em]
            text-zinc-500
            text-xs
            mb-6
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
            mb-12
            max-w-xl
          ">

            {description}

          </p>

          {/* ESSENTIALS */}

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

      </div>

    </section>
  );
}