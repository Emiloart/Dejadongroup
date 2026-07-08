import type { ReactNode } from "react";
import type { Accent } from "@/types/site";

type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  accent?: Accent;
};

export function SectionHeader({ title, eyebrow, children, accent = "orange" }: SectionHeaderProps) {
  const lineColor = accent === "green" ? "bg-agriculture" : "bg-orangeAction";

  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">{eyebrow}</p> : null}
      <h1 className="text-3xl font-semibold tracking-normal text-ink sm:text-4xl">{title}</h1>
      <div className={`mt-5 h-1 w-16 rounded-full ${lineColor}`} />
      {children ? <div className="mt-6 text-base leading-7 text-stone-700">{children}</div> : null}
    </div>
  );
}
