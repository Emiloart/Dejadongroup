import type { ReactNode } from "react";

type PageSectionProps = {
  children: ReactNode;
  tinted?: boolean;
  className?: string;
};

export function PageSection({ children, tinted = false, className = "" }: PageSectionProps) {
  return (
    <section className={tinted ? "bg-white" : "bg-warm"}>
      <div className={`mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-20 ${className}`}>{children}</div>
    </section>
  );
}
