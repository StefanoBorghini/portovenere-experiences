interface ExperienceSection {
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
    <div className="mt-8 space-y-8">
      {sections.map((section, index) => (
        <div key={index}>
          <h4
            className="
              text-white
              text-[18px]
              font-medium
              mb-3
            "
          >
            {section.title}
          </h4>

          <div
            className="
              text-white/70
              leading-8
            "
            dangerouslySetInnerHTML={{
              __html: section.description,
            }}
          />
        </div>
      ))}
    </div>
  );
}