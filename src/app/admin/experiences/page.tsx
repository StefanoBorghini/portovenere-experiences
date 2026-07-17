"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  createExperience,
  getFullExperiences,
  updateExperience,
  duplicateExperience,
} from "@/lib/supabase/experienceRepository";

export default function AdminExperiencesPage() {

  const router = useRouter();

  const [experiences, setExperiences] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  // Evita doppi click mentre la richiesta e' in corso, per
  // esperienza (cosi' puoi comunque togglarne un'altra nel
  // frattempo senza aspettare).
  const [togglingIds, setTogglingIds] =
    useState<Set<string>>(new Set());

  // Stesso principio, per il bottone Duplicate — separato da
  // togglingIds cosi' le due azioni non si bloccano a vicenda.
  const [duplicatingIds, setDuplicatingIds] =
    useState<Set<string>>(new Set());


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

  
  }

  loadData();

}, []);

  // =======================================================
  // TOGGLE ATTIVA/DISATTIVA — aggiornamento ottimistico:
  // cambia subito nell'interfaccia, e se la chiamata a Supabase
  // fallisce, riporta lo stato precedente e avvisa.
  // =======================================================

  async function toggleActive(experience: any) {

    const newValue = !experience.active;

    setTogglingIds((prev) => new Set(prev).add(experience.id));

    setExperiences((prev) =>
      prev.map((exp) =>
        exp.id === experience.id
          ? { ...exp, active: newValue }
          : exp
      )
    );

    const result = await updateExperience(experience.id, {
      active: newValue,
    });

    if (!result.success) {

      // Rollback: la chiamata e' fallita, torniamo al valore di prima
      setExperiences((prev) =>
        prev.map((exp) =>
          exp.id === experience.id
            ? { ...exp, active: experience.active }
            : exp
        )
      );

      alert("Could not update status — please try again.");
    }

    setTogglingIds((prev) => {
      const next = new Set(prev);
      next.delete(experience.id);
      return next;
    });
  }

  // =======================================================
  // DUPLICATE — clona l'esperienza intera (dati, filtri, scoring,
  // facts, sections, tier, galleria), poi porta direttamente alla
  // pagina di modifica della copia per aggiustare titolo/prezzo/
  // operatore prima di riattivarla (la copia parte disattivata).
  // =======================================================

  async function handleDuplicate(experience: any) {

    setDuplicatingIds((prev) => new Set(prev).add(experience.id));

    const result = await duplicateExperience(experience.id);

    setDuplicatingIds((prev) => {
      const next = new Set(prev);
      next.delete(experience.id);
      return next;
    });

    if (!result.success || !result.newId) {
      alert("Could not duplicate this experience — please try again.");
      return;
    }

    router.push(`/admin/experiences/${result.newId}`);
  }

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
        h-25
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
        Experiences Studio
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

  onClick={async () => {

  const experience =
    await createExperience();

  if (!experience) return;

  const data =
    await getFullExperiences();

  setExperiences(data);

  router.push(
    `/admin/experiences/${experience.id}`
  );

}}

  className="
    px-5
    py-3
    rounded-xl
    bg-white
    text-black
    font-medium
  "

>

  + New Experience

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

        <div className="flex items-center justify-between">

          <h3
            className="
              text-lg
              font-medium
            "
          >
            {experience.title}
          </h3>

          <button
            onClick={() => toggleActive(experience)}
            disabled={togglingIds.has(experience.id)}
            className={`
              shrink-0
              px-3
              py-1.5
              rounded-full
              text-xs
              font-medium
              border
              transition-colors
              disabled:opacity-50
              ${
                experience.active
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                  : "border-red-400/30 bg-red-400/10 text-red-400"
              }
            `}
          >
            {experience.active ? "Active" : "Inactive"}
          </button>

        </div>

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

        <div className="flex gap-2 mt-4">

          <Link
            href={`/admin/experiences/${experience.id}`}
            className="
              flex-1
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

          <button
            onClick={() => handleDuplicate(experience)}
            disabled={duplicatingIds.has(experience.id)}
            className="
              flex-1
              flex
              justify-center
              py-3
              rounded-xl
              border
              border-white/15
              text-white/80
              font-medium
              disabled:opacity-50
            "
          >

            {duplicatingIds.has(experience.id) ? "Duplicating..." : "Duplicate"}

          </button>

        </div>

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

        <th className="p-4 text-left">
          Status
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

            <td className="p-4">

              <button
                onClick={() => toggleActive(experience)}
                disabled={togglingIds.has(experience.id)}
                className={`
                  px-3
                  py-1.5
                  rounded-full
                  text-xs
                  font-medium
                  border
                  transition-colors
                  disabled:opacity-50
                  ${
                    experience.active
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                      : "border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20"
                  }
                `}
              >
                {experience.active ? "Active" : "Inactive"}
              </button>

            </td>

            <td className="p-4 text-right">

              <div className="flex items-center justify-end gap-2">

                <button
                  onClick={() => handleDuplicate(experience)}
                  disabled={duplicatingIds.has(experience.id)}
                  className="
                    inline-flex
                    px-4
                    py-2
                    rounded-xl
                    border
                    border-white/15
                    text-white/80
                    font-medium
                    disabled:opacity-50
                    hover:bg-white/5
                    transition-colors
                  "
                >

                  {duplicatingIds.has(experience.id) ? "Duplicating..." : "Duplicate"}

                </button>

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

              </div>

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