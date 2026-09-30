"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContentSlot } from "@/components/content-slot";
import { ImageCanvas } from "@/components/image-canvas";
import type { HeroSlide } from "@/types/site";

type HomeHeroCarouselProps = {
  slides: HeroSlide[];
};

export function HomeHeroCarousel({ slides }: HomeHeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current === slides.length - 1 ? 0 : current + 1));
    }, 7000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  function showPrevious() {
    setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1));
  }

  function showNext() {
    setActiveSlide((current) => (current === slides.length - 1 ? 0 : current + 1));
  }

  return (
    <section className="relative overflow-hidden rounded-card border border-orangeAction/20 bg-white shadow-sm">
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-orangeAction" />
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        {slides.map((slide) => {
          const accent = slide.accent ?? "orange";
          const line = accent === "green" ? "bg-agriculture" : "bg-orangeAction";

          return (
            <article key={slide.title} className="min-w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
              <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">{slide.eyebrow}</p>
                  <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">{slide.title}</h1>
                  <div className={`mt-5 h-1 w-16 rounded-full ${line}`} />
                  {slide.description ? <p className="mt-6 max-w-xl leading-7 text-stone-700">{slide.description}</p> : null}
                  <div className="mt-4">
                    <ContentSlot label={slide.slotLabel} accent={accent} />
                  </div>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={slide.primaryHref}
                      className="inline-flex min-h-11 items-center justify-center rounded-card bg-orangeAction px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                      {slide.primaryLabel}
                    </Link>
                    <Link
                      href={slide.secondaryHref}
                      className="inline-flex min-h-11 items-center justify-center rounded-card border border-orangeAction px-5 py-3 text-sm font-semibold text-orangeAction hover:bg-orange-50"
                    >
                      {slide.secondaryLabel}
                    </Link>
                  </div>
                </div>
                <ImageCanvas label={slide.canvasLabel} accent={accent} className="min-h-48 sm:min-h-56 lg:min-h-64" />
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-stone-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Show ${slide.title}`}
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index ? "w-9 bg-orangeAction" : "w-2.5 bg-orangeAction/25 hover:bg-orangeAction/50"
              }`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous hero slide"
            className="rounded-card border border-orangeAction/25 p-2 text-orangeAction hover:bg-orange-50"
            onClick={showPrevious}
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next hero slide"
            className="rounded-card border border-orangeAction/25 p-2 text-orangeAction hover:bg-orange-50"
            onClick={showNext}
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
