interface FiltersCardProps {

  experience:any;

  setExperience:any;

}

const guestOptions = [
  {
    label: "2 Guests",
    key: "guest_2",
  },
  {
    label: "3–4 Guests",
    key: "guest_3_4",
  },
  {
    label: "5–7 Guests",
    key: "guest_5_7",
  },
  {
    label: "8+ Guests",
    key: "guest_8_plus",
  },
];

export default function FiltersCard({

  experience,

  setExperience,

}:FiltersCardProps){

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

Experience Filters

</h2>
<div className="space-y-8">

  <div>

    <label
      className="
        block
        text-sm
        text-white/50
        mb-2
      "
    >

      Category

    </label>

    <select

      value={experience.category}

      onChange={(e)=>

        setExperience({

          ...experience,

          category:e.target.value,

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

    >

      <option value="sea_escape">
        Sea Escape
      </option>

      <option value="aerial_escape">
        Aerial Escape
      </option>

      <option value="gourmet_escape">
        Gourmet Escape
      </option>

      <option value="wild_escape">
        Wild Escape
      </option>

    </select>

  </div>

  <div>

  <label
    className="
      block
      text-sm
      text-white/50
      mb-4
    "
  >
    Guests
  </label>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

  {guestOptions.map((guest) => (

    <label
      key={guest.key}
      className="
        flex
        items-center
        gap-2
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
        checked={experience[guest.key] || false}
        onChange={(e) =>
          setExperience({
            ...experience,
            [guest.key]: e.target.checked,
          })
        }
      />

      {guest.label}

    </label>

  ))}

</div>

</div>

</div>


</section>

)}