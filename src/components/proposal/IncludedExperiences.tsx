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
            Included Experiences
          </p>

          <h2 className="
            text-4xl
            md:text-7xl
            font-light
            tracking-tight
            leading-none
          ">

            Curated Riviera Moments

          </h2>

        </div>

        {/* GRID */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-8
        ">

          {experiences.map(
            (experience) => (

              <div
                key={experience.title}
                className="
                  bg-white/[0.03]
                  border
                  border-white/10
                  rounded-[32px]
                  overflow-hidden
                  backdrop-blur-sm
                "
              >

                {/* IMAGE */}

                <img
                  src={experience.image}
                  alt={experience.title}
                  className="
                    w-full
                    h-[340px]
                    object-cover
                  "
                />

                {/* CONTENT */}

                <div className="
                  p-8
                ">

                  <h3 className="
                    text-3xl
                    font-light
                    tracking-tight
                    mb-5
                  ">

                    {experience.title}

                  </h3>

                  <p className="
                    text-zinc-400
                    leading-relaxed
                    mb-8
                  ">

                    {experience.description}

                  </p>

                  <div className="
                    space-y-3
                  ">

                    {experience.details.map(
                      (detail) => (

                        <div
                          key={detail}
                          className="
                            flex
                            items-center
                            gap-3
                            text-zinc-300
                          "
                        >

                          <div className="
                            w-1.5
                            h-1.5
                            rounded-full
                            bg-white
                          " />

                          <span>

                            {detail}

                          </span>

                        </div>
                      )
                    )}

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </section>
  );
}