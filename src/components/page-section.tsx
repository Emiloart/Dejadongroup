import type { ReactNode } from "react";

type PageSectionProps = {
  children: ReactNode;
  tinted?: boolean;
};

export function PageSection({ children, tinted = false }: PageSectionProps) {
  return (
    <section className={tinted ? "bg-white" : "bg-warm"}>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-20">{children}</div>
    </section>
  );
}
