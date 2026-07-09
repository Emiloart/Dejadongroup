import type { ReactNode } from "react";
import { ImageCanvas } from "@/components/image-canvas";
import { SectionHeader } from "@/components/section-header";
import type { Accent } from "@/types/site";

type PageHeroProps = {
  title: string;
  eyebrow?: string;
  canvasLabel: string;
  accent?: Accent;
  children?: ReactNode;
  actions?: ReactNode;
};

export function PageHero({ title, eyebrow, canvasLabel, accent = "orange", children, actions }: PageHeroProps) {
  const borderClass = accent === "green" ? "border-agriculture/20" : "border-orangeAction/20";

  return (
    <div className={`rounded-card border ${borderClass} bg-white p-4 shadow-sm sm:p-6 lg:p-8`}>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHeader title={title} eyebrow={eyebrow} accent={accent}>
            {children}
          </SectionHeader>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        <ImageCanvas label={canvasLabel} accent={accent} />
      </div>
    </div>
  );
}
