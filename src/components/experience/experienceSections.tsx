interface ExperienceSection {
  id?: string;
  title: string;
  description: string;
}

interface ExperienceSectionsProps {
  sections?: ExperienceSection[];
}

export default function ExperienceSections({
  sections = [],
}: ExperienceSectionsProps) {
  if (!sections.length) return null;

  return (
    <div
      className="
        mt-10
        pt-10
        border-t
        border-white/10
      "
    >
      <p
        className="
          text-center
          uppercase
          tracking-[0.32em]
          text-[11px]
          text-white/35
          mb-10
        "
      >
        Included Highlights
      </p>

      <div className="space-y-10">

        {sections.map((section) => (

          <div
            key={section.id ?? section.title}
            className="
              text-center
            "
          >

            <h4
              className="
                text-[22px]
                md:text-[24px]
                font-light
                tracking-[-0.03em]
                text-white
                mb-5
              "
            >
              {section.title}
            </h4>

            <div
              className="
                text-white/60
                text-[15px]
                leading-8
                prose
                prose-invert
                prose-p:my-0
                prose-ul:my-4
                prose-li:my-1
                prose-li:text-white/60
                prose-strong:text-white
                max-w-none
                mx-auto
              "
              dangerouslySetInnerHTML={{
                __html: section.description,
              }}
            />

          </div>

        ))}

      </div>
    </div>
  );
}