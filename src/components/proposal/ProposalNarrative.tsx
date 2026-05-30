interface ProposalNarrativeProps {

title?: string;

paragraph?: string;
}

export default function ProposalNarrative({

  title,

  paragraph,

}: ProposalNarrativeProps) {

  return (

    <section className="
      py-32
      md:py-40
      px-6
      border-y
      border-white/10
      bg-black
    ">

      <div className="
        max-w-5xl
        mx-auto
        text-center
      ">

        {/* LABEL */}

        <p className="
          uppercase
          tracking-[0.4em]
          text-zinc-600
          text-xs
          mb-8
        ">
          Mediterranean Luxury
        </p>

        {/* TITLE */}

        <h2 className="
          text-4xl
          md:text-7xl
          font-light
          leading-[1.1]
          tracking-tight
          mb-12
        ">

          {title || "Curated Around Your Riviera Journey"}

        </h2>

        {/* PARAGRAPH */}

        <p className="
          text-zinc-400
          text-lg
          md:text-2xl
          leading-relaxed
          max-w-3xl
          mx-auto
        ">

         {
  paragraph ||
  "A private Riviera proposal designed around atmosphere, cinematic moments and curated Mediterranean experiences."
}

        </p>

      </div>

    </section>
  );
}