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
    <div className="mt-14 space-y-10">

      <div
        className="
          h-px
          w-16
          bg-white/15
        "
      />

      <p
        className="
          uppercase
          tracking-[0.28em]
          text-[11px]
          text-white/40
        "
      >
        Included Highlights
      </p>

      <div className="space-y-10">

        {sections.map((section) => (

          <div
            key={section.id ?? section.title}
            className="space-y-4"
          >

            <h4
              className="
                text-[22px]
                md:text-[24px]
                font-light
                tracking-[-0.03em]
                text-white
              "
            >
              {section.title}
            </h4>

            <div
              className="
                text-white/60
                leading-8
                text-[16px]
                prose
                prose-invert
                prose-p:my-0
                prose-ul:my-3
                prose-li:text-white/60
                max-w-none
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