interface SectionProps {

  children: React.ReactNode;

  className?: string;
}

export default function Section({

  children,

  className = "",

}: SectionProps) {

  return (

    <section
      className={`
        relative
        py-28
        md:py-40
        px-6
        ${className}
      `}
    >

      {children}

    </section>
  );
}