interface MoodCardProps {

  experience: any;

  setExperience: any;

}

const moodOptions = [

  {
    label: "Romantic",
    key: "mood_romantic",
  },

  {
    label: "Adventure",
    key: "mood_adventure",
  },

  {
    label: "Authentic",
    key: "mood_authentic",
  },

  {
    label: "Luxury",
    key: "mood_luxury",
  },

  {
    label: "Cinematic",
    key: "mood_cinematic",
  },

];

export default function MoodCard({

  experience,

  setExperience,

}: MoodCardProps) {

  return (

    <section
      className="
        rounded-3xl
        border
        border-white/10
        bg-zinc-950
        p-8
        mt-8
      "
    >

      <h2
        className="
          text-2xl
          font-light
          mb-8
        "
      >
        Mood Compatibility
      </h2>

      <div className="grid md:grid-cols-3 gap-3">

        {moodOptions.map((mood) => (

          <label
            key={mood.key}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-3
              cursor-pointer
            "
          >

            <input
              type="checkbox"
              checked={
                experience[mood.key] || false
              }
              onChange={(e) =>

                setExperience({

                  ...experience,

                  [mood.key]:
                    e.target.checked,

                })

              }
            />

            {mood.label}

          </label>

        ))}

      </div>

    </section>

  );

}