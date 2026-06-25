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

  <div className="space-y-8">

    <div>

      <label className="block text-sm text-white/50 mb-2">
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
        "
      />

    </div>

    <div className="grid md:grid-cols-2 gap-6">

      <div>

        <label className="block text-sm text-white/50 mb-2">
          Operator
        </label>

        <input
          type="text"
          value={experience.operator || ""}
          onChange={(e)=>
            setExperience({
              ...experience,
              operator:e.target.value,
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
          "
        />

      </div>

      <div>

        <label className="block text-sm text-white/50 mb-2">
          Base Price (€)
        </label>

        <input
          type="number"
          value={experience.base_price || 0}
          onChange={(e)=>
            setExperience({
              ...experience,
              base_price:Number(e.target.value),
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
          "
        />

      </div>

    </div>

    <div>

      <label className="block text-sm text-white/50 mb-2">
        Description
      </label>

      <textarea
        rows={6}
        value={experience.description || ""}
        onChange={(e)=>
          setExperience({
            ...experience,
            description:e.target.value,
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
        "
      />

    </div>

    <div>

      <label className="block text-sm text-white/50 mb-2">
        Short Description
      </label>

      <textarea
        rows={3}
        value={experience.short_description || ""}
        onChange={(e)=>
          setExperience({
            ...experience,
            short_description:e.target.value,
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
        "
      />

    </div>

  </div>

</section>

  );

}