"use client";

import {
  deleteExperienceFact,
} from "@/lib/supabase/experienceRepository";

interface Props {

  experience: any;

  setExperience: any;

}

export default function FactsCard({

  experience,

  setExperience,

}: Props) {

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
        text-3xl
        font-light
        mb-8
        "
      >

        Experience Facts

      </h2>

      <p
        className="
        text-white/40
        mb-8
        "
      >

        Configure the key information displayed
        inside the proposal.

      </p>

      {experience.facts?.map(

        (fact: any, index: number) => (

          <div

            key={fact.id}

            className="
            border
            border-white/10
            rounded-2xl
            p-5
            mb-5
            "

          >

            {/* LABEL */}

            <input

              value={fact.label}

              placeholder="Label"

              onChange={(e) => {

                const facts = [
                  ...experience.facts
                ];

                facts[index].label =
                  e.target.value;

                setExperience({

                  ...experience,

                  facts,

                });

              }}

              className="
              w-full
              rounded-xl
              bg-white/5
              border
              border-white/10
              px-4
              py-3
              mb-3
              "

            />

            {/* VALUE */}

            <input

              value={fact.value}

              placeholder="Value"

              onChange={(e) => {

                const facts = [
                  ...experience.facts
                ];

                facts[index].value =
                  e.target.value;

                setExperience({

                  ...experience,

                  facts,

                });

              }}

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

            {/* DELETE */}

            <button

              onClick={async () => {

                const ok = confirm(
                  "Delete this fact?"
                );

                if (!ok) return;

                if (!fact.isNew) {

                  await deleteExperienceFact(
                    fact.id
                  );

                }

                setExperience({

                  ...experience,

                  facts:

                  experience.facts.filter(

                    (f: any) =>
                      f.id !== fact.id

                  ),

                });

              }}

              className="
              mt-4
              px-4
              py-2
              rounded-xl
              bg-red-600
              text-white
              "

            >

              Delete

            </button>

          </div>

        )

      )}

      {/* ADD */}

      <button

        onClick={() =>

          setExperience({

            ...experience,

            facts: [

              ...experience.facts,

              {

                id:
                  crypto.randomUUID?.() ??
                  `fact-${Date.now()}`,

                experience_id:
                  experience.id,

                label: "New Label",

                value: "",

                display_order:
                  experience.facts.length + 1,

                active: true,

                isNew: true,

              },

            ],

          })

        }

        className="
        mt-4
        px-6
        py-3
        rounded-xl
        bg-white
        text-black
        font-medium
        "

      >

        + Add Fact

      </button>

    </section>

  );

}