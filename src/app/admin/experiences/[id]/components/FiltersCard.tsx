import {
  CATEGORIES,
  BUDGET_TIERS,
  ACCESSIBILITY_NEEDS,
} from "@/lib/config/experienceTaxonomy";

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

// Fonte: BUDGET_TIERS in experienceTaxonomy.ts — stessa lista usata
// dallo step budget del wizard e da generateProposal.ts, cosi' una
// fascia aggiunta/rimossa li' compare qui automaticamente.
const budgetOptions = BUDGET_TIERS.map((tier) => ({
  label: tier.range,
  key: tier.dbField,
}));

// Etichette solo-admin (pannello sempre in inglese, niente locale
// switcher) — ACCESSIBILITY_NEEDS.i18nKey e' per il wizard pubblico,
// qui serve testo semplice locale al file, stesso trattamento di
// guestOptions/budgetOptions sopra.
const ACCESSIBILITY_ADMIN_LABELS: Record<string, string> = {
  mobility_reduced: "Reduced mobility",
  visual_impairment: "Visual impairment",
  hearing_impairment: "Hearing impairment",
  cognitive_sensory: "Cognitive/sensory needs",
  other: "Other accessibility need",
};

// Non specificato / Si' / No — tre stati espliciti, non solo
// checkbox on/off: un booleano nullable su experience_content, cosi'
// "mai impostato" resta distinguibile da "esplicitamente non
// accessibile" (vedi generateProposal.ts, scoring neutro sul primo
// caso).
const ACCESSIBILITY_STATE_OPTIONS: { label: string; value: boolean | null }[] = [
  { label: "Not specified", value: null },
  { label: "Yes", value: true },
  { label: "No", value: false },
];

// =========================================================
// FASCIA ORARIA — nuovo parametro (richiesta LPG Italia).
// Stessi campi definiti nello schema experience_filters:
// available_morning, available_afternoon, available_sunset,
// available_full_day. Default true a livello DB, quindi qui
// se il campo non e' ancora presente su una experience esistente
// il checkbox risultera' comunque marcato (coerente col default).
// =========================================================

const timeSlotOptions = [

  {
    label: "🌅 Morning",
    key: "available_morning",
  },

  {
    label: "☀️ Afternoon",
    key: "available_afternoon",
  },

  {
    label: "🌇 Sunset",
    key: "available_sunset",
  },

  {
    label: "🌞 Full Day",
    key: "available_full_day",
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
        mb-4
      "
    >

      Categories

    </label>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

      {CATEGORIES.map((category) => {

        const isChecked =
          (experience.categories ?? []).includes(category.dbValue);

        return (
          <label
            key={category.dbValue}
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
              checked={isChecked}
              onChange={(e) => {

                const current: string[] = experience.categories ?? [];

                const next = e.target.checked
                  ? [...current, category.dbValue]
                  : current.filter((value) => value !== category.dbValue);

                setExperience({
                  ...experience,
                  categories: next,
                });
              }}
            />

            {category.label}

          </label>
        );
      })}

    </div>

    <p className="text-white/30 text-xs mt-2">
      Un&apos;esperienza puo&apos; comparire in piu&apos; di una
      macrocategoria — deve esserne selezionata almeno una perche&apos;
      compaia nel configuratore.
    </p>

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

<div className="mt-6 grid md:grid-cols-2 gap-6">

  <div>

    <label
      className="
        block
        text-sm
        text-white/50
        mb-2
      "
    >
      Min Participants (exact minimum)
    </label>

    <input
      type="number"
      min={1}
      value={experience.min_participants ?? ""}
      placeholder="Leave empty for no minimum"
      onChange={(e) =>
        setExperience({
          ...experience,
          min_participants:
            e.target.value === ""
              ? null
              : Number(e.target.value),
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

    <label
      className="
        block
        text-sm
        text-white/50
        mb-2
      "
    >
      Max Participants (exact cap)
    </label>

    <input
      type="number"
      min={1}
      value={experience.max_participants ?? ""}
      placeholder="Leave empty for no exact limit"
      onChange={(e) =>
        setExperience({
          ...experience,
          max_participants:
            e.target.value === ""
              ? null
              : Number(e.target.value),
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

<p className="text-white/30 text-xs mt-2">
  Le checkbox Guests sopra restano fasce larghe per il
  matching generale. Questi due campi sono un pavimento/tetto ESATTI
  che escludono sempre l'esperienza se il gruppo richiesto è,
  rispettivamente, più piccolo del minimo o più numeroso del massimo —
  utile quando la fascia più vicina disponibile (es. "5-7") non
  riflette la capacità reale (es. minimo 6, o massimo 5).
</p>

</div>

<div>

  <label
    className="
      block
      text-sm
      text-white/50
      mb-2
    "
  >
    Minimum Trip Duration (days)
  </label>

  <input
    type="number"
    min={1}
    value={experience.min_days ?? ""}
    placeholder="Leave empty if a single day is fine"
    onChange={(e) =>
      setExperience({
        ...experience,
        min_days:
          e.target.value === ""
            ? null
            : Number(e.target.value),
      })
    }
    className="
      w-full
      md:w-1/3
      rounded-xl
      bg-white/5
      border
      border-white/10
      px-4
      py-3
    "
  />

  <p className="text-white/30 text-xs mt-2">
    Numero minimo di giorni necessari per fare questa esperienza
    (es. 2 = non fattibile in giornata, richiede almeno un
    weekend; 7 = richiede almeno una settimana). Calcolato dalle
    date scelte dal cliente nel wizard. Lascia vuoto se
    l'esperienza si può fare anche in giornata.
  </p>

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

  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

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
    Fascia oraria disponibile
  </label>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

    {timeSlotOptions.map((slot) => (

      <label
        key={slot.key}
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
            experience[slot.key] ?? true
          }
          onChange={(e) =>

            setExperience({

              ...experience,

              [slot.key]: e.target.checked,

            })

          }
        />

        {slot.label}

      </label>

    ))}

  </div>

  <p className="text-white/30 text-xs mt-2">
    Determina in quali fasce orarie questa esperienza è
    prioritaria nel matching. Se il cliente non seleziona
    nessuna fascia, questo filtro non ha effetto.
  </p>

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
    Animals
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
      md:w-1/2
    "
  >

    <span>Animals Allowed</span>

    <input
      type="checkbox"
      checked={experience.animals_allowed ?? true}
      onChange={(e) =>
        setExperience({
          ...experience,
          animals_allowed: e.target.checked,
        })
      }
    />

  </label>

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
    Accessibility
  </label>

  <div className="space-y-3">

    {ACCESSIBILITY_NEEDS.map((need) => {

      const currentValue: boolean | null = experience[need.dbField] ?? null;

      return (
        <div
          key={need.dbField}
          className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-4
            py-3
            gap-4
          "
        >
          <span>{ACCESSIBILITY_ADMIN_LABELS[need.key]}</span>

          <div className="flex gap-1.5 shrink-0">
            {ACCESSIBILITY_STATE_OPTIONS.map((option) => (
              <button
                type="button"
                key={String(option.value)}
                onClick={() =>
                  setExperience({
                    ...experience,
                    [need.dbField]: option.value,
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${
                  currentValue === option.value
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 hover:border-white/40"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );
    })}

  </div>

  <textarea
    value={experience.accessibility_notes ?? ""}
    onChange={(e) =>
      setExperience({
        ...experience,
        accessibility_notes: e.target.value,
      })
    }
    placeholder="Accessibility notes (optional) — extra detail for the team, e.g. step-free access, assistance available on request..."
    rows={2}
    className="
      w-full
      mt-3
      rounded-xl
      border
      border-white/10
      bg-white/5
      px-4
      py-3
      text-sm
      outline-none
      transition-all
      duration-300
      focus:border-white/40
    "
  />

  <p className="text-white/30 text-xs mt-2">
    &quot;Not specified&quot; (default) keeps this experience neutral in
    matching for that need — it is never treated as inaccessible just
    because the field was never set.
  </p>

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