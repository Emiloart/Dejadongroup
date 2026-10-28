"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import mainHero from "@/assets/mainpage_hero.png";
import agricultureHero from "@/assets/agriculture_hero.png";
import agroRealEstateHero from "@/assets/Agro-realestate_hero.png";
import { ButtonLink } from "@/components/button-link";
import { HeroBackground } from "@/components/hero-background";
import type { HeroSlide } from "@/types/site";

const slideImages = {
  "Welcome to De Jadon Group": mainHero,
  Agriculture: agricultureHero,
  "Agro-Real Estate": agroRealEstateHero
};

export function HomeHeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const slide = slides[activeSlide] ?? slides[0];
  const slideImage = (slide ? slideImages[slide.title as keyof typeof slideImages] : undefined) ?? mainHero;

  function showSlide(index: number) {
    setActiveSlide((index + slides.length) % slides.length);
  }

  if (!slide) return null;

  return (
    <section
      className="relative isolate overflow-hidden bg-ink text-white focus-visible:outline-white focus-visible:-outline-offset-4"
      aria-label="Discover De Jadon Group"
      aria-roledescription="carousel"
      aria-describedby={slides.length > 1 ? "hero-carousel-instructions" : undefined}
      tabIndex={slides.length > 1 ? 0 : undefined}
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
      <HeroBackground image={slideImage} priority={activeSlide === 0} />
      {slides.length > 1 ? <p id="hero-carousel-instructions" className="sr-only">Use the left and right arrow keys to change slides.</p> : null}
      {slides.length > 1 ? <p className="sr-only" aria-live="polite" aria-atomic="true">Slide {activeSlide + 1} of {slides.length}: {slide.title}</p> : null}
      <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col px-5 pb-6 pt-10 sm:min-h-[640px] sm:px-6 lg:min-h-[680px] lg:px-8 lg:pt-16">
        <div className="flex flex-1 items-center py-8">
          <div key={activeSlide} className="hero-slide-enter max-w-2xl">
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${slide.accent === "green" ? "text-green-200" : "text-orange-200"}`}>{slide.eyebrow}</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-normal leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">{slide.title}</h1>
            {slide.description ? <p className="mt-6 max-w-xl text-base leading-8 text-white/90 sm:text-lg">{slide.description}</p> : null}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <ButtonLink href={slide.primaryHref}>{slide.primaryLabel}</ButtonLink>
              <ButtonLink href={slide.secondaryHref} variant="inverse">{slide.secondaryLabel}</ButtonLink>
            </div>
          </div>
        </div>
        {slides.length > 1 ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/25 pt-4 lg:mt-10">
            <div className="flex items-center gap-1" aria-label="Choose a slide">
              {slides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-current={activeSlide === index ? "true" : undefined}
                  className={`flex h-11 w-9 items-center justify-center text-xs tabular-nums transition-colors focus-visible:outline-white sm:w-11 ${activeSlide === index ? "text-orange-200" : "text-white/75 hover:text-white"}`}
                  onClick={() => showSlide(index)}
                >
                  <span className={`border-b pb-1 ${activeSlide === index ? "border-orange-200" : "border-transparent"}`}>{String(index + 1).padStart(2, "0")}</span>
                </button>
              ))}
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
              <button type="button" aria-label="Previous slide" className="flex h-11 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-white sm:w-11" onClick={() => showSlide(activeSlide - 1)}><ArrowLeft aria-hidden="true" className="h-5 w-5" /></button>
              <button type="button" aria-label="Next slide" className="flex h-11 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-white sm:w-11" onClick={() => showSlide(activeSlide + 1)}><ArrowRight aria-hidden="true" className="h-5 w-5" /></button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
