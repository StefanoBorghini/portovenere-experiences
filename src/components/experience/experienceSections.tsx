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
        
      "
    >
      <p
  className="
    text-center
    uppercase
    tracking-[0.32em]
    text-[11px]
    text-white/35
    mb-8
  "
>
        Included Highlights
      </p>

      <div className="mt-6
space-y-8">

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
        text-center
        [&_p]:m-0
        [&_ul]:list-none
        [&_ul]:pl-0
        [&_li]:my-2
    "
    dangerouslySetInnerHTML={{
        __html: section.description
    }}
/>

          </div>

        ))}

      </div>
    </div>
  );
}