import type { ReactNode } from "react";
import { ImageCanvas } from "@/components/image-canvas";
import { SectionHeader } from "@/components/section-header";
import type { Accent } from "@/types/site";

type PageHeroProps = {
  title: string;
  eyebrow?: string;
  canvasLabel?: string;
  accent?: Accent;
  children?: ReactNode;
  actions?: ReactNode;
};

export function PageHero({ title, eyebrow, canvasLabel, accent = "orange", children, actions }: PageHeroProps) {
  return (
    <div className={canvasLabel ? "grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20" : "max-w-3xl"}>
      <div>
        <SectionHeader title={title} eyebrow={eyebrow} accent={accent} as="h1">
          {children}
        </SectionHeader>
        {actions ? <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-5">{actions}</div> : null}
      </div>
      {canvasLabel ? <ImageCanvas label={canvasLabel} accent={accent} /> : null}
    </div>
  );
}
