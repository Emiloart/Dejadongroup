"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ImageCanvas } from "@/components/image-canvas";

type HomeBannerCarouselProps = {
  slides: string[];
};

export function HomeBannerCarousel({ slides }: HomeBannerCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  function showPrevious() {
    setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1));
  }

  function showNext() {
    setActiveSlide((current) => (current === slides.length - 1 ? 0 : current + 1));
  }

  return (
    <section className="relative overflow-hidden rounded-card border border-orangeAction/20 bg-white p-3 shadow-sm sm:p-4">
      <div className="absolute inset-x-0 top-0 h-1 bg-orangeAction" />
      <div className="relative aspect-[16/9] overflow-hidden rounded-card sm:aspect-[21/9]">
        <ImageCanvas label={slides[activeSlide]} compact className="h-full min-h-0" />
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index ? "w-8 bg-orangeAction" : "w-2.5 bg-orangeAction/25 hover:bg-orangeAction/50"
              }`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous banner"
            className="rounded-card border border-orangeAction/25 p-2 text-orangeAction hover:bg-orange-50"
            onClick={showPrevious}
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next banner"
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
