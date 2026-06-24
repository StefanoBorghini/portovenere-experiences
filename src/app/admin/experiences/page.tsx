"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import {
  getFullExperiences,
} from "@/lib/supabase/experienceRepository";

export default function AdminExperiencesPage() {

  const [experiences, setExperiences] =
    useState<any[]>([]);

    const [search, setSearch] =
  useState("");
const filteredExperiences =

  experiences.filter(
    (experience) => {

      const query =
        search.toLowerCase();

      return (

        experience.title
          ?.toLowerCase()
          .includes(query)

        ||

        experience.operator
          ?.toLowerCase()
          .includes(query)

        ||

        experience.category
          ?.toLowerCase()
          .includes(query)

      );
    }
  );
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

  <div
    className="
      flex
      items-center
      gap-4
      mb-4
    "
  >

    <img
      src="/logo-white.png"
      alt="PV"
      className="
        h-10
        w-auto
      "
    />

    <div>

      <h1
        className="
          text-4xl
          md:text-5xl
          font-light
          tracking-tight
        "
      >
        Experiences CMS
      </h1>

     
    </div>

  </div>

  <p
    className="
      text-white/40
      max-w-2xl
    "
  >
    Manage experiences, galleries and proposal engine data.
  </p>

</div>

<div
  className="
  flex
  flex-col
  md:flex-row
  md:items-center
  md:justify-between
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
  value={search}

onChange={(e) =>
  setSearch(
    e.target.value
  )
}

    placeholder="Search by title, operator or category..."
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

<div
  className="
    md:hidden
    space-y-4
  "
>

  {filteredExperiences.map(
    (experience) => (

      <div
        key={experience.id}
        className="
          p-4
          rounded-2xl
          border
          border-white/10
          bg-zinc-950
        "
      >

        <img
          src={
            experience.featured_image ||
            experience.hero_image
          }
          alt={experience.title}
          className="
            w-full
            h-40
            object-cover
            rounded-xl
            mb-4
          "
        />

        <h3
          className="
            text-lg
            font-medium
          "
        >
          {experience.title}
        </h3>

        <p className="text-white/50">

          {experience.operator}

        </p>

        <div
          className="
            flex
            justify-between
            mt-4
            text-sm
          "
        >

          <span>
            {experience.category}
          </span>

          <span>
            €{experience.base_price}
          </span>

        </div>

        <Link
          href={`/admin/experiences/${experience.id}`}
          className="
            mt-4
            w-full
            flex
            justify-center
            py-3
            rounded-xl
            bg-white
            text-black
            font-medium
          "
        >

          Edit

        </Link>

      </div>

    )
  )}

</div>
<div
  className="
    hidden
    md:block
    overflow-hidden
    rounded-3xl
    border
    border-white/10
    bg-zinc-950
  "
>
  <table className="w-full">

    <thead>

      <tr
        className="
          border-b
          border-white/10
          text-white/50
          text-sm
        "
      >

        <th className="p-4 text-left">
          Image
        </th>

        <th className="p-4 text-left">
          Experience
        </th>

        <th className="p-4 text-left">
          Operator
        </th>

        <th className="p-4 text-left">
          Category
        </th>

        <th className="p-4 text-left">
          Price
        </th>

        <th className="p-4 text-left">
          Gallery
        </th>

        <th className="p-4 text-right">
          Actions
        </th>

      </tr>

    </thead>

    <tbody>

      {filteredExperiences.map(
        (experience) => (

          <tr

            key={experience.id}

            className="
              border-b
              border-white/5
              hover:bg-white/[0.02]
              transition-colors
            "
          >

            <td className="p-4">

              <img
                src={
                  experience.featured_image ||
                  experience.hero_image
                }
                alt={experience.title}
                className="
                  w-24
                  h-16
                  object-cover
                  rounded-xl
                "
              />

            </td>

            <td className="p-4">

              <div className="font-medium">

                {experience.title}

              </div>

            </td>

            <td className="p-4 text-white/60">

              {experience.operator}

            </td>

            <td className="p-4">

              <span
                className="
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  border
                  border-white/10
                  bg-white/[0.03]
                "
              >

                {experience.category}

              </span>

            </td>

            <td className="p-4">

              €{experience.base_price}

            </td>

            <td className="p-4 text-white/60">

              {experience.gallery?.length || 0}

            </td>

            <td className="p-4 text-right">

              <Link
                href={`/admin/experiences/${experience.id}`}
                className="
                  inline-flex
                  px-4
                  py-2
                  rounded-xl
                  bg-white
                  text-black
                  font-medium
                "
              >

                Edit

              </Link>

            </td>

          </tr>

        )
      )}

    </tbody>

  </table>

</div>
<footer
  className="
    mt-20
    pt-8
    border-t
    border-white/5
    flex
    justify-center
  "
>

  <div
    className="
      px-4
      py-2
      rounded-full
      border
      border-white/10
      text-[11px]
      tracking-[0.2em]
      uppercase
      text-white/40
    "
  >

    Powered by Ductavia

  </div>

</footer>
    </main>
  );
}