interface SectionHeaderProps {

  label?: string;

  title: string;

  description?: string;

  align?: "left" | "center";
}

export default function SectionHeader({

  label,

  title,

  description,

  align = "center",

}: SectionHeaderProps) {

  return (

    <div
      className={`
        mb-24

        ${align === "center"
          ? "text-center"
          : "text-left"}
      `}
    >

      {label && (

        <p
          className="
            uppercase
            tracking-[0.35em]
            text-white/45
            text-[11px]
            mb-6
          "
        >

          {label}

        </p>
      )}

      <h2
        className="
          text-4xl
          md:text-7xl
          font-light
          tracking-[-0.04em]
          leading-[0.95]
          max-w-5xl
          mx-auto
        "
      >

        {title}

      </h2>

      {description && (

        <p
          className="
            mt-8
            text-white/65
            leading-[1.9]
            max-w-2xl
            mx-auto
            text-[15px]
            md:text-[18px]
          "
        >

          {description}

        </p>
      )}

    </div>
  );
}