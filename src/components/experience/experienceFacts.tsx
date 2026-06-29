interface ExperienceFact {
  label: string;
  value: string;
}

interface ExperienceFactsProps {
  facts?: ExperienceFact[];
}

export default function ExperienceFacts({
  facts = [],
}: ExperienceFactsProps) {

  if (!facts.length) return null;

  return (

    <div
      className="
        mt-10
        pt-8
        border-t
        border-white/10
      "
    >

      <div className="space-y-5">

        {facts.map((fact,index)=>(

          <div
            key={index}
            className="
              text-center
            "
          >

            <p
              className="
                text-white/35
                uppercase
                tracking-[0.24em]
                text-[11px]
                mb-2
              "
            >
              {fact.label}
            </p>

            <p
              className="
                text-white
                text-[16px]
                font-light
              "
            >
              {fact.value}
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}