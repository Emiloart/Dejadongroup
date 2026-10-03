"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/button-link";
import type { HeroSlide } from "@/types/site";

export function HomeHeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide] ?? slides[0];
  if (!slide) return null;

  return (
    <section aria-label="Discover De Jadon Group" aria-roledescription="carousel">
      <div className="grid gap-10 lg:min-h-[380px] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${slide.accent === "green" ? "text-agriculture" : "text-orangeAction"}`}>{slide.eyebrow}</p>
          <div aria-live="polite" aria-atomic="true">
            <h1 className="mt-5 max-w-2xl text-4xl font-normal leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">{slide.title}</h1>
            {slide.description ? <p className="mt-6 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">{slide.description}</p> : null}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonLink href={slide.primaryHref}>{slide.primaryLabel}</ButtonLink>
            <ButtonLink href={slide.secondaryHref} variant="outline">{slide.secondaryLabel}</ButtonLink>
          </div>
        </div>
        <p className="hidden max-w-sm border-l border-orangeAction/30 pl-8 font-serif text-3xl leading-snug text-ink/70 lg:block">
          Your future is an investment. Let’s build it together.
        </p>
      </div>
      {slides.length > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-ink/10 pt-4 lg:mt-10">
          <div className="flex flex-wrap gap-1">
            {slides.map((item, index) => (
              <button key={item.title} type="button" aria-label={`Show ${item.title}`} aria-pressed={activeSlide === index} className={`flex h-11 w-11 items-center justify-center text-xs tabular-nums transition-colors ${activeSlide === index ? "text-orangeAction" : "text-stone-500 hover:text-ink"}`} onClick={() => setActiveSlide(index)}>
                <span className={`border-b pb-1 ${activeSlide === index ? "border-orangeAction" : "border-transparent"}`}>{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" aria-label="Previous hero slide" className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5" onClick={() => setActiveSlide((activeSlide + slides.length - 1) % slides.length)}><ArrowLeft aria-hidden="true" className="h-5 w-5" /></button>
            <button type="button" aria-label="Next hero slide" className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5" onClick={() => setActiveSlide((activeSlide + 1) % slides.length)}><ArrowRight aria-hidden="true" className="h-5 w-5" /></button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
