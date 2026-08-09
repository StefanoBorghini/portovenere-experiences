interface SectionContainerProps {

  children: React.ReactNode;

  className?: string;
}

export default function SectionContainer({

  children,

  className = "",

}: SectionContainerProps) {

  return (

    <div
      className={`
        max-w-7xl
        mx-auto
        ${className}
      `}
    >

      {children}

    </div>
  );
}