import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";
import { HeroBackground } from "@/components/hero-background";
import { ImageCanvas } from "@/components/image-canvas";
import { SectionHeader } from "@/components/section-header";
import type { Accent } from "@/types/site";

type PageHeroProps = {
  title: string;
  eyebrow?: string;
  canvasLabel?: string;
  image?: StaticImageData;
  accent?: Accent;
  children?: ReactNode;
  actions?: ReactNode;
};

export function PageHero({ title, eyebrow, canvasLabel, image, accent = "orange", children, actions }: PageHeroProps) {
  if (image) {
    return (
      <section className="relative isolate overflow-hidden bg-ink">
        <HeroBackground image={image} priority />
        <div className="mx-auto flex min-h-[560px] max-w-7xl items-center px-5 py-16 sm:px-6 sm:py-20 lg:min-h-[640px] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <SectionHeader title={title} eyebrow={eyebrow} accent={accent} as="h1" inverse>
              {children}
            </SectionHeader>
            {actions ? <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-5">{actions}</div> : null}
          </div>
        </div>
      </section>
    );
  }

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
