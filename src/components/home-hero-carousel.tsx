"use client";

import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/button-link";
import type { HeroSlide } from "@/types/site";

const slideDelay = 7500;

export function HomeHeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const slide = slides[activeSlide] ?? slides[0];

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      if (motionPreference.matches) setIsPlaying(false);
    };
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    updateMotionPreference();
    updateVisibility();
    motionPreference.addEventListener("change", updateMotionPreference);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      motionPreference.removeEventListener("change", updateMotionPreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2 || !isPlaying || !pageVisible) return;
    const timeout = window.setTimeout(() => setActiveSlide((current) => (current + 1) % slides.length), slideDelay);
    return () => window.clearTimeout(timeout);
  }, [activeSlide, isPlaying, pageVisible, slides.length]);

  function showSlide(index: number) {
    setIsPlaying(false);
    setActiveSlide((index + slides.length) % slides.length);
  }

  if (!slide) return null;

  return (
    <section
      aria-label="Discover De Jadon Group"
      aria-roledescription="carousel"
      aria-describedby={slides.length > 1 ? "hero-carousel-instructions" : undefined}
      tabIndex={slides.length > 1 ? 0 : undefined}
      onMouseEnter={() => setIsPlaying(false)}
      onFocusCapture={() => setIsPlaying(false)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showSlide(activeSlide - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          showSlide(activeSlide + 1);
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null || slides.length < 2) return;
        const distance = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) >= 50) showSlide(activeSlide + (distance < 0 ? 1 : -1));
      }}
      onTouchCancel={() => { touchStartX.current = null; }}
    >
      {slides.length > 1 ? <p id="hero-carousel-instructions" className="sr-only">Use the left and right arrow keys to change slides.</p> : null}
      {slides.length > 1 ? <p className="sr-only" aria-live={isPlaying ? "off" : "polite"} aria-atomic="true">Slide {activeSlide + 1} of {slides.length}: {slide.title}</p> : null}
      <div className="grid gap-10 lg:min-h-[380px] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div key={activeSlide} className="hero-slide-enter">
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${slide.accent === "green" ? "text-agriculture" : "text-orangeAction"}`}>{slide.eyebrow}</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-normal leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">{slide.title}</h1>
          {slide.description ? <p className="mt-6 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">{slide.description}</p> : null}
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonLink href={slide.primaryHref}>{slide.primaryLabel}</ButtonLink>
            <ButtonLink href={slide.secondaryHref} variant="outline">{slide.secondaryLabel}</ButtonLink>
          </div>
        </div>
        <div className="hidden max-w-sm border-l border-orangeAction/30 pl-8 lg:block">
          <p className="font-serif text-3xl leading-snug text-ink/70">Your future is an investment. Let’s build it together.</p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</p>
        </div>
      </div>
      {slides.length > 1 ? (
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink/10 pt-4 lg:mt-10">
          <div className="flex items-center gap-1" aria-label="Choose a slide">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Show slide ${index + 1}: ${item.title}`}
                aria-current={activeSlide === index ? "true" : undefined}
                className={`flex h-11 w-9 items-center justify-center text-xs tabular-nums transition-colors sm:w-11 ${activeSlide === index ? "text-orangeAction" : "text-stone-500 hover:text-ink"}`}
                onClick={() => showSlide(index)}
              >
                <span className={`border-b pb-1 ${activeSlide === index ? "border-orangeAction" : "border-transparent"}`}>{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            <button
              type="button"
              aria-label={isPlaying ? "Pause slides" : "Resume slides"}
              className="flex h-11 w-9 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-ink/5 hover:text-ink sm:w-11"
              onClick={() => setIsPlaying((playing) => !playing)}
            >
              {isPlaying ? <Pause aria-hidden="true" className="h-4 w-4" /> : <Play aria-hidden="true" className="h-4 w-4" />}
            </button>
            <button type="button" aria-label="Previous slide" className="flex h-11 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 sm:w-11" onClick={() => showSlide(activeSlide - 1)}><ArrowLeft aria-hidden="true" className="h-5 w-5" /></button>
            <button type="button" aria-label="Next slide" className="flex h-11 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 sm:w-11" onClick={() => showSlide(activeSlide + 1)}><ArrowRight aria-hidden="true" className="h-5 w-5" /></button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
