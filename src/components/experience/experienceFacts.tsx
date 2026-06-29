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
    <div className="space-y-4">
      {facts.map((fact, index) => (
        <div
          key={index}
          className="
            flex
            justify-between
            items-center
            gap-6
            border-b
            border-white/10
            pb-3
          "
        >
          <span
            className="
              text-white/55
              text-[14px]
            "
          >
            {fact.label}
          </span>

          <span
            className="
              text-white
              text-[14px]
            "
          >
            {fact.value}
          </span>
        </div>
      ))}
    </div>
  );
}