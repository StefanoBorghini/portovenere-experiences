"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


import {
  getFullExperiences,
} from "@/lib/supabase/experienceRepository";

export default function AdminExperiencesPage() {

  const [experiences, setExperiences] =
    useState<any[]>([]);

useEffect(() => {

  async function loadData() {

    if (!supabase) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {

      window.location.href =
        "/admin/login";

      return;
    }

    const data =
      await getFullExperiences();

    setExperiences(data);

    console.log(
      "ADMIN EXPERIENCES",
      data
    );
  }

  loadData();

}, []);

  return (

    <main className="min-h-screen bg-black text-white p-8">

<div className="mb-12">

  <h1
    className="
      text-5xl
      font-light
      tracking-tight
    "
  >
    Experiences CMS
  </h1>

  <p
    className="
      mt-3
      text-white/50
    "
  >
    Manage experiences, galleries and proposal engine data.
  </p>

</div>

<div
  className="
    flex
    items-center
    justify-between
    mb-8
    gap-4
  "
>

  <button

    onClick={async () => {

      if (!supabase) return;

      await supabase.auth.signOut();

      window.location.href =
        "/admin/login";

    }}

    className="
      px-4
      py-3
      rounded-xl
      border
      border-white/10
      hover:bg-white/5
      transition-all
    "
  >

    Logout

  </button>

  <input
    placeholder="Search experience..."
    className="
      w-full
      max-w-md
      px-4
      py-3
      rounded-xl
      bg-white/[0.04]
      border
      border-white/[0.08]
      outline-none
    "
  />

  <button
    className="
      px-5
      py-3
      rounded-xl
      bg-white
      text-black
      font-medium
    "
  >

    New Experience

  </button>

</div>

<div
  className="
    grid
    grid-cols-1
    md:grid-cols-3
    gap-4
    mb-8
  "
>

  <div
    className="
      p-5
      rounded-2xl
      bg-zinc-900
      border
      border-white/10
    "
  >

    <div className="text-white/50 text-sm">

      Experiences

    </div>

    <div className="text-3xl mt-2">

      {experiences.length}

    </div>

  </div>

  <div
    className="
      p-5
      rounded-2xl
      bg-zinc-900
      border
      border-white/10
    "
  >

    <div className="text-white/50 text-sm">

      Active

    </div>

    <div className="text-3xl mt-2">

      {
        experiences.filter(
          exp => exp.active
        ).length
      }

    </div>

  </div>

  <div
    className="
      p-5
      rounded-2xl
      bg-zinc-900
      border
      border-white/10
    "
  >

    <div className="text-white/50 text-sm">

      Gallery Images

    </div>

    <div className="text-3xl mt-2">

      {
        experiences.reduce(
          (total, exp) =>
            total +
            (
              exp.gallery?.length ||
              0
            ),
          0
        )
      }

    </div>

  </div>

</div>
      <div className="grid gap-6">

        {experiences.map(
          (experience) => (

            <div
              key={experience.id}
              className="
                border
                border-zinc-700
                rounded-xl
                p-6
                bg-zinc-900
              "
            >

              <div className="mb-4">

                <img
                  src={
                    experience.featured_image ||
                    experience.hero_image
                  }
                  alt={experience.title}
                  className="
                    w-full
                    max-w-md
                    rounded-lg
                  "
                />

              </div>

              <h2 className="text-2xl font-semibold">

                {experience.title}

              </h2>

              <p className="text-zinc-400">

                {experience.operator}

              </p>

              <p className="mt-2">

                Category:
                {" "}
                {experience.category}

              </p>

              <p>

                Price:
                {" "}
                €
                {experience.base_price}

              </p>

              <p>

                Gallery:
                {" "}
                {experience.gallery?.length || 0}
                {" "}
                images

              </p>

              <button
                className="
                  mt-4
                  px-4
                  py-2
                  rounded
                  bg-white
                  text-black
                "
              >

                Edit

              </button>

            </div>
          )
        )}

      </div>

    </main>
  );
}