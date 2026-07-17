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

import {
  getOperators,
  createOperator,
  updateOperator,
  deleteOperator,
  setExperienceOperator,
  type Operator,
} from "@/lib/supabase/Operatorrepository";

export default function AdminExperiencesPage() {

  const router = useRouter();

  const [experiences, setExperiences] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  // =======================================================
  // OPERATORI — stato separato da experiences, caricato in
  // parallelo. operator_id su ogni experience e' gia' presente
  // nel select("*") del repository esistente, quindi non serve
  // toccare experienceRepository.ts per leggerlo.
  // =======================================================

  const [operators, setOperators] =
    useState<Operator[]>([]);

  // "all" | "unassigned" | operator.id
  const [operatorFilter, setOperatorFilter] =
    useState<string>("all");

  const [showOperatorModal, setShowOperatorModal] =
    useState(false);

  const [newOperatorName, setNewOperatorName] =
    useState("");

  const [savingOperator, setSavingOperator] =
    useState(false);

  // Per-row saving state per il quick-assign dell'operatore,
  // stesso principio di togglingIds/duplicatingIds qui sotto.
  const [assigningIds, setAssigningIds] =
    useState<Set<string>>(new Set());

  // Evita doppi click mentre la richiesta e' in corso, per
  // esperienza (cosi' puoi comunque togglarne un'altra nel
  // frattempo senza aspettare).
  const [togglingIds, setTogglingIds] =
    useState<Set<string>>(new Set());

  // Stesso principio, per il bottone Duplicate — separato da
  // togglingIds cosi' le due azioni non si bloccano a vicenda.
  const [duplicatingIds, setDuplicatingIds] =
    useState<Set<string>>(new Set());

  const operatorNameById = new Map(
    operators.map((op) => [op.id, op.name])
  );

  function operatorLabel(experience: any) {
    if (experience.operator_id && operatorNameById.has(experience.operator_id)) {
      return operatorNameById.get(experience.operator_id);
    }
    // Fallback al vecchio campo testo finche' non e' stata
    // assegnata una entita' operatore vera e propria.
    return experience.operator;
  }

const filteredExperiences =

  experiences.filter(
    (experience) => {

      const query =
        search.toLowerCase();

      const matchesSearch = (

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

      if (!matchesSearch) return false;

      if (operatorFilter === "all") return true;

      if (operatorFilter === "unassigned") {
        return !experience.operator_id;
      }

      return experience.operator_id === operatorFilter;
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

    const [expData, opData] = await Promise.all([
      getFullExperiences(),
      getOperators(),
    ]);

    setExperiences(expData);
    setOperators(opData);

  
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

  // =======================================================
  // QUICK-ASSIGN OPERATORE — stesso pattern ottimistico del
  // toggle attiva/disattiva, direttamente dalla riga/card.
  // =======================================================

  async function handleAssignOperator(experience: any, operatorId: string) {

    const previousOperatorId = experience.operator_id ?? null;
    const nextOperatorId = operatorId === "" ? null : operatorId;

    setAssigningIds((prev) => new Set(prev).add(experience.id));

    setExperiences((prev) =>
      prev.map((exp) =>
        exp.id === experience.id
          ? { ...exp, operator_id: nextOperatorId }
          : exp
      )
    );

    const result = await setExperienceOperator(experience.id, nextOperatorId);

    if (!result.success) {

      setExperiences((prev) =>
        prev.map((exp) =>
          exp.id === experience.id
            ? { ...exp, operator_id: previousOperatorId }
            : exp
        )
      );

      alert("Could not assign operator — please try again.");
    }

    setAssigningIds((prev) => {
      const next = new Set(prev);
      next.delete(experience.id);
      return next;
    });
  }

  // =======================================================
  // GESTISCI OPERATORI — pannello semplice: crea, rinomina,
  // attiva/disattiva, elimina. Nessuna route dedicata, resta
  // tutto dentro /admin/experiences com'era stato deciso.
  // =======================================================

  async function handleCreateOperator() {

    const name = newOperatorName.trim();
    if (!name) return;

    setSavingOperator(true);

    const created = await createOperator(name);

    setSavingOperator(false);

    if (!created) {
      alert("Could not create operator — please try again.");
      return;
    }

    setOperators((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
    );
    setNewOperatorName("");
  }

  async function handleRenameOperator(operator: Operator, name: string) {

    setOperators((prev) =>
      prev.map((op) => (op.id === operator.id ? { ...op, name } : op))
    );

    const result = await updateOperator(operator.id, { name });

    if (!result.success) {
      alert("Could not rename operator — please try again.");
    }
  }

  async function handleToggleOperatorActive(operator: Operator) {

    const newValue = !operator.active;

    setOperators((prev) =>
      prev.map((op) =>
        op.id === operator.id ? { ...op, active: newValue } : op
      )
    );

    const result = await updateOperator(operator.id, { active: newValue });

    if (!result.success) {
      setOperators((prev) =>
        prev.map((op) =>
          op.id === operator.id ? { ...op, active: operator.active } : op
        )
      );
      alert("Could not update operator — please try again.");
    }
  }

  async function handleDeleteOperator(operator: Operator) {

    if (
      !confirm(
        `Delete "${operator.name}"? Experiences assigned to it will keep their data, just without an operator link.`
      )
    ) {
      return;
    }

    const result = await deleteOperator(operator.id);

    if (!result.success) {
      alert("Could not delete operator — please try again.");
      return;
    }

    setOperators((prev) => prev.filter((op) => op.id !== operator.id));

    // Le esperienze che puntavano a questo operatore restano con
    // operator_id svuotato lato DB (ON DELETE SET NULL) — riflettiamo
    // lo stesso lato client senza dover ricaricare tutto.
    setExperiences((prev) =>
      prev.map((exp) =>
        exp.operator_id === operator.id ? { ...exp, operator_id: null } : exp
      )
    );

    if (operatorFilter === operator.id) {
      setOperatorFilter("all");
    }
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

{/* =======================================================
    FILTRO OPERATORE + GESTISCI OPERATORI — sopra tutto il
    resto della toolbar, come richiesto.
   ======================================================= */}

<div
  className="
    flex
    flex-col
    md:flex-row
    md:items-center
    md:justify-between
    gap-4
    mb-4
    p-4
    rounded-2xl
    bg-white/[0.03]
    border
    border-white/[0.08]
  "
>

  <div
    className="
      flex
      items-center
      gap-3
      flex-wrap
    "
  >

    <span className="text-white/40 text-sm uppercase tracking-[0.2em]">
      Operator
    </span>

    <select
      value={operatorFilter}
      onChange={(e) => setOperatorFilter(e.target.value)}
      className="
        px-4
        py-2.5
        rounded-xl
        bg-white/[0.04]
        border
        border-white/[0.08]
        outline-none
        text-sm
      "
    >
      <option value="all">All operators</option>
      <option value="unassigned">Unassigned</option>
      {operators.map((op) => (
        <option key={op.id} value={op.id}>
          {op.name}
          {op.active ? "" : " (inactive)"}
        </option>
      ))}
    </select>

  </div>

  <button
    onClick={() => setShowOperatorModal(true)}
    className="
      px-4
      py-2.5
      rounded-xl
      border
      border-white/15
      text-white/80
      font-medium
      hover:bg-white/5
      transition-colors
      text-sm
    "
  >

    Manage Operators

  </button>

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

          {operatorLabel(experience)}

        </p>

        <select
          value={experience.operator_id ?? ""}
          disabled={assigningIds.has(experience.id)}
          onChange={(e) => handleAssignOperator(experience, e.target.value)}
          className="
            mt-2
            w-full
            px-3
            py-2
            rounded-xl
            bg-white/[0.04]
            border
            border-white/[0.08]
            outline-none
            text-sm
            disabled:opacity-50
          "
        >
          <option value="">No operator</option>
          {operators.map((op) => (
            <option key={op.id} value={op.id}>
              {op.name}
            </option>
          ))}
        </select>

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

              <select
                value={experience.operator_id ?? ""}
                disabled={assigningIds.has(experience.id)}
                onChange={(e) => handleAssignOperator(experience, e.target.value)}
                className="
                  px-3
                  py-2
                  rounded-xl
                  bg-white/[0.04]
                  border
                  border-white/[0.08]
                  outline-none
                  text-sm
                  disabled:opacity-50
                "
              >
                <option value="">
                  {experience.operator || "No operator"}
                </option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>

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

{/* =======================================================
    MODALE GESTISCI OPERATORI
   ======================================================= */}

{showOperatorModal && (

  <div
    className="
      fixed
      inset-0
      z-50
      bg-black/80
      backdrop-blur-sm
      flex
      items-center
      justify-center
      p-4
    "
    onClick={() => setShowOperatorModal(false)}
  >

    <div
      onClick={(e) => e.stopPropagation()}
      className="
        w-full
        max-w-lg
        max-h-[80vh]
        overflow-y-auto
        rounded-3xl
        bg-zinc-950
        border
        border-white/10
        p-6
      "
    >

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-medium">Manage Operators</h2>

        <button
          onClick={() => setShowOperatorModal(false)}
          className="text-white/50 hover:text-white"
        >
          ✕
        </button>

      </div>

      <div className="flex gap-2 mb-6">

        <input
          value={newOperatorName}
          onChange={(e) => setNewOperatorName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateOperator();
          }}
          placeholder="New operator name (e.g. Afrodite)"
          className="
            flex-1
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
          onClick={handleCreateOperator}
          disabled={savingOperator || !newOperatorName.trim()}
          className="
            px-5
            py-3
            rounded-xl
            bg-white
            text-black
            font-medium
            disabled:opacity-50
          "
        >
          Add
        </button>

      </div>

      <div className="space-y-3">

        {operators.length === 0 && (
          <p className="text-white/40 text-sm">No operators yet.</p>
        )}

        {operators.map((operator) => (

          <div
            key={operator.id}
            className="
              flex
              items-center
              gap-3
              p-3
              rounded-2xl
              border
              border-white/10
              bg-white/[0.02]
            "
          >

            <input
              defaultValue={operator.name}
              onBlur={(e) => {
                const name = e.target.value.trim();
                if (name && name !== operator.name) {
                  handleRenameOperator(operator, name);
                }
              }}
              className="
                flex-1
                bg-transparent
                outline-none
                border-b
                border-transparent
                focus:border-white/20
                py-1
              "
            />

            <button
              onClick={() => handleToggleOperatorActive(operator)}
              className={`
                shrink-0
                px-3
                py-1.5
                rounded-full
                text-xs
                font-medium
                border
                transition-colors
                ${
                  operator.active
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                    : "border-red-400/30 bg-red-400/10 text-red-400"
                }
              `}
            >
              {operator.active ? "Active" : "Inactive"}
            </button>

            <button
              onClick={() => handleDeleteOperator(operator)}
              className="
                shrink-0
                text-white/40
                hover:text-red-400
                transition-colors
                text-sm
              "
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>

  </div>

)}

    </main>
  );
}