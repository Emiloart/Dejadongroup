import type { ReactNode } from "react";
import type { Accent } from "@/types/site";
import { HeroText } from "@/components/hero-text";

type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  accent?: Accent;
  as?: "h1" | "h2";
  inverse?: boolean;
  textBackdrop?: boolean;
};

export function SectionHeader({ title, eyebrow, children, accent = "orange", as: Heading = "h2", inverse = false, textBackdrop = false }: SectionHeaderProps) {
  const headingSize = Heading === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl";

  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.16em] ${inverse ? "text-white/80" : accent === "green" ? "text-agriculture" : "text-stone-500"}`}>
          {textBackdrop ? <HeroText>{eyebrow}</HeroText> : eyebrow}
        </p>
      ) : null}
      <Heading className={`${textBackdrop ? "hero-title" : ""} font-medium leading-[1.12] tracking-tight ${inverse ? "text-white" : "text-ink"} ${headingSize}`}>{textBackdrop ? <HeroText>{title}</HeroText> : title}</Heading>
      {children ? <div className={`mt-5 max-w-xl text-base leading-8 ${inverse ? "text-white/90" : "text-stone-600"}`}>{children}</div> : null}
    </div>
  );
}
