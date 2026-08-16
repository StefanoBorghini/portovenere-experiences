"use client";
import { useMemo, useState } from "react";

interface Props {
  enhancement: any;
  setEnhancement: (value: any) => void;
  experiences: any[];
}

export default function IncompatibleExperiencesCard({
  enhancement,
  setEnhancement,
  experiences,
}: Props) {

  const [search, setSearch] = useState("");

  const incompatibleIds: string[] = (
    enhancement.incompatible_experiences ?? []
  ).map(String);

  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) =>
      exp.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [experiences, search]);

  function toggleExperience(id: string) {

    const idStr = String(id);

    const updated = incompatibleIds.includes(idStr)
      ? incompatibleIds.filter((x) => x !== idStr)
      : [...incompatibleIds, idStr];

    setEnhancement({
      ...enhancement,
      incompatible_experiences: updated,
    });
  }

  return (

    <section
      className="
        rounded-3xl
        border
        border-white/10
        bg-zinc-950
        p-8
      "
    >

      <h2 className="text-3xl font-light mb-2">
        Incompatible Experiences
      </h2>

      <p className="text-white/50 mb-8">
        This enhancement will not be proposed together with the
        experiences selected below. Every other experience is
        compatible by default.
      </p>

      <h3 className="text-lg font-medium mb-3">
        Incompatible Experiences
        <span className="ml-2 text-sm text-white/50">
          ({incompatibleIds.length})
        </span>
      </h3>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search experiences..."
        className="
          w-full
          rounded-xl
          bg-black
          border
          border-zinc-700
          px-4
          py-3
          mb-5
          outline-none
        "
      />

      <div
        className="
          max-h-[320px]
          overflow-y-auto
          rounded-xl
          border
          border-zinc-800
        "
      >

        {filteredExperiences.map((exp) => (

          <div
            key={exp.id}
            onClick={() => toggleExperience(exp.id)}
            className={`
              flex
              items-center
              justify-between
              px-5
              py-3
              border-b last:border-b-0
              border-zinc-800
              cursor-pointer
              transition-all

              ${
                incompatibleIds.includes(String(exp.id))
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              }
            `}
          >

            <div>

              <div className="font-medium">
                {exp.title}
              </div>

              <div className="text-xs text-white/40">
                {(exp.categories ?? []).join(", ")}
              </div>

            </div>

            <input
              type="checkbox"
              checked={incompatibleIds.includes(String(exp.id))}
              onClick={(e) => e.stopPropagation()}
              onChange={() => toggleExperience(exp.id)}
              className="h-6 w-6 cursor-pointer"
            />

          </div>

        ))}

        {filteredExperiences.length === 0 && (

          <div className="py-8 text-center text-white/40">
            No experiences found.
          </div>

        )}

      </div>

    </section>

  );

}
