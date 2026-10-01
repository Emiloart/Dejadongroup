import type { ReactNode } from "react";
import type { Accent } from "@/types/site";

type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  accent?: Accent;
  as?: "h1" | "h2";
};

export function SectionHeader({ title, eyebrow, children, accent = "orange", as: Heading = "h2" }: SectionHeaderProps) {
  const headingSize = Heading === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl";

  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.16em] ${accent === "green" ? "text-agriculture" : "text-stone-500"}`}>
          {eyebrow}
        </p>
      ) : null}
      <Heading className={`font-medium leading-[1.12] tracking-tight text-ink ${headingSize}`}>{title}</Heading>
      {children ? <div className="mt-5 max-w-xl text-base leading-8 text-stone-600">{children}</div> : null}
    </div>
  );
}
