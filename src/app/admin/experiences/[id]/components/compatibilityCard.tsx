"use client";
import { useMemo, useState } from "react";
interface Props {
  experience: any;
  setExperience: (value: any) => void;
  experiences: any[];
  enhancements: any[];
}

export default function CompatibilityCard({

    

  experience,

  setExperience,

  experiences,

  enhancements,

  

}: Props) {

    const [experienceSearch, setExperienceSearch] =
  useState("");

const [enhancementSearch, setEnhancementSearch] =
  useState("");

    const filteredExperiences = useMemo(() => {

  return experiences

    .filter(e => e.id !== experience.id)

    .filter(e =>
      e.title
        .toLowerCase()
        .includes(
          experienceSearch.toLowerCase()
        )
    );

}, [
  experiences,
  experience.id,
  experienceSearch,
]);

function toggleExperience(id: string) {

  const current =
    experience.incompatible_experiences ?? [];

  const updated =
    current.includes(id)
      ? current.filter((x: string) => x !== id)
      : [...current, id];

  setExperience({
    ...experience,
    incompatible_experiences: updated,
  });

}
function toggleEnhancement(id: string) {

  const current =
    experience.incompatible_enhancements ?? [];

  const updated =
    current.includes(id)
      ? current.filter((x: string) => x !== id)
      : [...current, id];

  setExperience({
    ...experience,
    incompatible_enhancements: updated,
  });

}
const filteredEnhancements = useMemo(() => {

  return enhancements.filter(e =>
    e.title
      .toLowerCase()
      .includes(
        enhancementSearch.toLowerCase()
      )
  );

}, [
  enhancements,
  enhancementSearch,
]);

  return (

    <div
      className="
        rounded-3xl
        border
        border-zinc-800
        bg-[#0B0B0B]
        p-8
        mb-6
      "
    >

      <h2 className="text-2xl font-medium">

        Compatibility

      </h2>

      <p className="text-white/50 mt-2 mb-8">

        Choose which experiences and enhancements
        cannot be combined with this experience.

      </p>

     <h3 className="text-lg font-medium mb-3">
  Incompatible Experiences
  <span className="ml-2 text-sm text-white/50">
    (
    {experience.incompatible_experiences?.length ?? 0}
    )
  </span>
</h3>

<input
  value={experienceSearch}
  onChange={(e) =>
    setExperienceSearch(e.target.value)
  }
  placeholder="Search experience..."
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

  {filteredExperiences.map(exp => (

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
    experience.incompatible_experiences?.includes(exp.id)
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
        {exp.category}
    </div>

</div>

    <input
  type="checkbox"
  checked={
    experience.incompatible_experiences?.includes(exp.id) ?? false
  }

  onClick={(e) => e.stopPropagation()}
  onChange={() => toggleExperience(exp.id)}
  className="
    h-6
    w-6
    cursor-pointer
  "
/>

    </div>

  ))}

  {filteredExperiences.length === 0 && (

  <div className="py-8 text-center text-white/40">
    No experiences found.
  </div>

)}

</div>

<h3 className="text-lg font-medium mt-10 mb-3">
  Incompatible Enhancements
  <span className="ml-2 text-sm text-white/50">
    (
    {experience.incompatible_enhancements?.length ?? 0}
    )
  </span>
</h3>

<input
  value={enhancementSearch}
  onChange={(e) =>
    setEnhancementSearch(e.target.value)
  }
  placeholder="Search enhancement..."
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

  {filteredEnhancements.map(enh => (

    <div
      key={enh.id}
      onClick={() => toggleEnhancement(enh.id)}
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
          experience.incompatible_enhancements?.includes(enh.id)
            ? "bg-white/10"
            : "hover:bg-white/5"
        }
      `}
    >

      <div>

        <div className="font-medium">
          {enh.title}
        </div>

        <div className="text-xs text-white/40">
          {enh.category}
        </div>

      </div>

      <input
        type="checkbox"
        checked={
          experience.incompatible_enhancements?.includes(enh.id) ?? false
        }
        onClick={(e) => e.stopPropagation()}
        onChange={() => toggleEnhancement(enh.id)}
        className="h-6 w-6 cursor-pointer"
      />

    </div>

  ))}

  {filteredEnhancements.length === 0 && (

    <div className="py-8 text-center text-white/40">

      No enhancements found.

    </div>

  )}

</div>

</div>



  );

}

