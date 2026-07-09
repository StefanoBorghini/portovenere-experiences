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
    label: "8–12 Guests",
    key: "guest_8_12",
  },
  {
    label: "13–20 Guests",
    key: "guest_13_20",
  },
  {
    label: "20+ Guests",
    key: "guest_20_plus",
  },
];

const budgetOptions = [

  {
    label: "€500 - €1000",
    key: "budget_500_1000",
  },

  {
    label: "€1000 - €3000",
    key: "budget_1000_3000",
  },

  {
    label: "€3000+",
    key: "budget_3000_plus",
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
<div>

  <label
    className="
      block
      text-sm
      text-white/50
      mb-4
    "
  >
    Budget
  </label>

  <div className="grid md:grid-cols-3 gap-3">

    {budgetOptions.map((budget)=>(

      <label
        key={budget.key}
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
          checked={
            experience[budget.key] || false
          }
          onChange={(e)=>

            setExperience({

              ...experience,

              [budget.key]:
                e.target.checked,

            })

          }
        />

        {budget.label}

      </label>

    ))}

  </div>


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
    Children (0–6 years)
  </label>

  <div className="grid md:grid-cols-2 gap-3">

    <label
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-white/10
        bg-white/5
        px-4
        py-4
        cursor-pointer
      "
    >

      <span>Children Allowed</span>

      <input
        type="checkbox"
        checked={experience.children_allowed ?? true}
        onChange={(e) =>
          setExperience({
            ...experience,
            children_allowed: e.target.checked,
          })
        }
      />

    </label>

    <label
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-white/10
        bg-white/5
        px-4
        py-4
      "
    >

      <span>Child Discount %</span>

      <input
        type="number"
        min={0}
        max={100}
        value={experience.child_discount_percentage ?? 0}
        onChange={(e) =>
          setExperience({
            ...experience,
            child_discount_percentage: Number(e.target.value),
          })
        }
        className="
          w-20
          text-right
          rounded-lg
          bg-white/5
          border
          border-white/10
          px-2
          py-1
        "
      />

    </label>

  </div>

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

    Status

  </label>

  <div className="grid md:grid-cols-2 gap-3">

    <label
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-white/10
        bg-white/5
        px-4
        py-4
        cursor-pointer
      "
    >

      <span>Active</span>

      <input
        type="checkbox"
        checked={experience.active || false}
        onChange={(e)=>

          setExperience({

            ...experience,

            active:e.target.checked,

          })

        }
      />

    </label>

    <label
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-white/10
        bg-white/5
        px-4
        py-4
        cursor-pointer
      "
    >

      <span>Featured</span>

      <input
        type="checkbox"
        checked={experience.featured || false}
        onChange={(e)=>

          setExperience({

            ...experience,

            featured:e.target.checked,

          })

        }
      />

    </label>

  </div>

</div>
</div>


</section>

)}