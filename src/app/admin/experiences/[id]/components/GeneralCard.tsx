interface GeneralCardProps {

  experience: any;

  setExperience: any;

}

export default function GeneralCard({

  experience,

  setExperience,

}: GeneralCardProps) {

  return (

    <section
      className="
        rounded-3xl
        border
        border-white/10
        bg-zinc-950
        p-8
      "
    >

      <h2
        className="
          text-2xl
          font-light
          mb-8
        "
      >

        General Information

      </h2>

    </section>

  );

}