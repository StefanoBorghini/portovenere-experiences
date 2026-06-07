"use client";

import { useEffect, useState } from "react";

import {
  getFullExperiences,
} from "@/lib/supabase/experienceRepository";

export default function AdminExperiencesPage() {

  const [experiences, setExperiences] =
    useState<any[]>([]);

  useEffect(() => {

    async function loadData() {

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

      <h1 className="text-4xl font-bold mb-8">

        Experiences CMS

      </h1>

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