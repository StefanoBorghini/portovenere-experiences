"use client";

interface Props {
  experience: any;
  setExperience: (experience: any) => void;
  experiences: any[];
  enhancements: any[];
}

export default function CompatibilityCard({

  experience,

  setExperience,

  experiences,

  enhancements,

}: Props) {

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

  return (

    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        border: "1px solid #e5e5e5",
      }}
    >

      <h2 style={{ marginBottom: 24 }}>
        Compatibility
      </h2>

      {/* EXPERIENCES */}

      <h3>Incompatible Experiences</h3>

      <div
        style={{
          display: "grid",
          gap: 8,
          marginTop: 12,
          marginBottom: 30,
        }}
      >

        {experiences
          .filter(e => e.id !== experience.id)
          .map(e => (

            <label key={e.id}>

              <input

                type="checkbox"

                checked={
                  experience
                    .incompatible_experiences
                    ?.includes(e.id) ?? false
                }

                onChange={() =>
                  toggleExperience(e.id)
                }

              />

              {" "}
              {e.title}

            </label>

        ))}

      </div>

      {/* ENHANCEMENTS */}

      <h3>Incompatible Enhancements</h3>

      <div
        style={{
          display: "grid",
          gap: 8,
          marginTop: 12,
        }}
      >

        {enhancements.map(e => (

          <label key={e.id}>

            <input

              type="checkbox"

              checked={
                experience
                  .incompatible_enhancements
                  ?.includes(e.id) ?? false
              }

              onChange={() =>
                toggleEnhancement(e.id)
              }

            />

            {" "}
            {e.title}

          </label>

        ))}

      </div>

    </div>

  );

}