interface ReservationSectionProps {

  expiresAt: string;

  closingParagraph?: string;

  whatsappUrl: string;
}

import Countdown
from "@/components/countdown";

export default function ReservationSection({

  expiresAt,

  closingParagraph,

  whatsappUrl,

}: ReservationSectionProps) {

  return (

    <section className="
      py-32
      md:py-44
      px-6
      bg-black
      border-t
      border-white/10
    ">

      <div className="
        max-w-5xl
        mx-auto
        text-center
      ">

        {/* COUNTDOWN */}

        <div className="
          mb-20
        ">

          <Countdown
            expiresAt={expiresAt}
          />

        </div>

        {/* TITLE */}

        <h2 className="
          text-4xl
          md:text-7xl
          font-light
          leading-[1.1]
          tracking-tight
          mb-12
        ">

          Your private Riviera
          reservation remains available

        </h2>

        {/* PARAGRAPH */}

        <p className="
          text-zinc-400
          text-lg
          md:text-2xl
          leading-relaxed
          max-w-3xl
          mx-auto
          mb-16
        ">

          {
            closingParagraph ||

            "Your curated Riviera proposal has been privately reserved for a limited time."
          }

        </p>

        {/* CONTACT */}

        <div className="
          text-zinc-500
          uppercase
          tracking-[0.25em]
          text-xs
          space-y-4
          mb-16
        ">

          <p>
            Stefano
          </p>

          <p>
            Portovenere Experiences
          </p>

          <p>
            info@portovenere.com
          </p>

          <p>
            +39 348 714 0722
          </p>

        </div>

        {/* CTA */}

        <a
          href={whatsappUrl}
          target="_blank"
          className="
            inline-flex
            items-center
            justify-center
            rounded-full
            border
            border-white
            bg-white
            text-black
            px-10
            py-5
            uppercase
            tracking-[0.25em]
            text-xs
            hover:scale-105
            transition-all
            duration-500
          "
        >

          Request Private Booking

        </a>

      </div>

    </section>
  );
}