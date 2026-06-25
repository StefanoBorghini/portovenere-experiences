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
<div className="space-y-6">

  <div>

    <label
      className="
        block
        text-sm
        text-white/50
        mb-2
      "
    >

      Title

    </label>

    <input
      type="text"
      value={experience.title}
      onChange={(e)=>

        setExperience({

          ...experience,

          title:e.target.value,

        })

      }

      className="
        w-full
        rounded-xl
        bg-white/5
        border
        border-white/10
        px-4
        py-3
        outline-none
        focus:border-white/30
      "
    />

  </div>

</div>
    </section>

  );

}