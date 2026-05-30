interface CinematicGalleryProps {

  images: string[];
}

export default function CinematicGallery({

  images,

}: CinematicGalleryProps) {

  return (

    <section className="
      py-28
      md:py-40
      bg-black
      overflow-hidden
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

      {/* SCROLL AREA */}

      <div className="
        flex
        gap-6
        overflow-x-auto
        snap-x
        snap-mandatory
        scroll-smooth
        px-6
        pb-4
        no-scrollbar
      ">

        {images.map(
          (
            image,
            index
          ) => (

            <div
              key={index}
              className="
                relative
                shrink-0
                snap-center

                w-[88vw]
                md:w-[31vw]

                h-[65vh]
                md:h-[75vh]

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

      </div>

    </section>
  );
}