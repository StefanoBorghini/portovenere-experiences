interface ProposalHeroProps {

  heroImage: string;

  heroTitle: string;

  guests: string;

  totalPrice: number;
}

export default function ProposalHero({

  heroImage,

  heroTitle,

  guests,

  totalPrice,

}: ProposalHeroProps) {

  return (

    <section
      className="
        relative
        h-screen
        flex
        items-center
        justify-center
        overflow-hidden
      "
    >

      {/* BACKGROUND */}

      <img
        src={heroImage}
        alt={heroTitle}
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
        "
      />

      {/* OVERLAY */}

      <div className="
        absolute
        inset-0
        bg-black/50
      " />

      {/* CONTENT */}

      <div className="
        relative
        z-10
        text-center
        px-6
        max-w-5xl
      ">

        {/* LOGO */}

        <img
          src="/logo-white.png"
          alt="Portovenere Experiences"
          className="
            w-28
            md:w-36
            object-contain
            mx-auto
            mb-8
            opacity-95
          "
        />

        {/* LABEL */}

        <p className="
          uppercase
          tracking-[0.35em]
          text-[11px]
          text-zinc-300
          mb-6
        ">
          Private Riviera Proposal
        </p>

        {/* TITLE */}

        <h1 className="
          text-5xl
          md:text-8xl
          font-light
          leading-none
          tracking-tight
          mb-8
        ">

          {heroTitle}

        </h1>

        {/* SUBTITLE */}

        <p className="
          text-zinc-200
          text-base
          md:text-xl
          leading-8
          max-w-3xl
          mx-auto
          mb-10
        ">

          Tailored for {guests} guests
          across curated Riviera experiences,
          cinematic atmosphere and
          Mediterranean moments.

        </p>

        {/* PRICE */}

        <div className="
          inline-flex
          items-center
          gap-4
          border
          border-white/20
          rounded-full
          px-7
          py-4
          backdrop-blur-md
          bg-white/5
        ">

          <span className="
            uppercase
            tracking-[0.25em]
            text-[11px]
            text-zinc-300
          ">
            Starting From
          </span>

          <span className="
            text-2xl
            md:text-3xl
            font-light
          ">
<br></br>
            €{totalPrice.toLocaleString()}

          </span>

        </div>

      </div>

    </section>
  );
}