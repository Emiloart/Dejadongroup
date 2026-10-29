"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getImageProps } from "next/image";
import { heroMedia, heroImageSource } from "@/lib/hero-media";
import { ButtonLink } from "@/components/button-link";
import { HeroBackground } from "@/components/hero-background";
import type { HeroSlide } from "@/types/site";

const slideDelay = 7500;
const slideImages = {
  "Welcome to De Jadon Group": heroMedia.main,
  Agriculture: heroMedia.agriculture,
  "Agro-Real Estate": heroMedia.agroRealEstate,
  Flexisave: heroMedia.flexisave
};

export function HomeHeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const slide = slides[activeSlide] ?? slides[0];
  const slideImage = (slide ? slideImages[slide.title as keyof typeof slideImages] : undefined) ?? heroMedia.main;
  const isPlaying = slides.length > 1 && !isHovered && !hasFocus && !hasInteracted && !reducedMotion && pageVisible;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motion.matches);
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    updateMotion();
    updateVisibility();
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timeout = window.setTimeout(() => setActiveSlide((current) => (current + 1) % slides.length), slideDelay);
    return () => window.clearTimeout(timeout);
  }, [activeSlide, isPlaying, slides.length]);

  useEffect(() => {
    if (!pageVisible || slides.length < 2) return;
    const next = slides[(activeSlide + 1) % slides.length];
    const asset = slideImages[next.title as keyof typeof slideImages] ?? heroMedia.main;
    const timer = window.setTimeout(() => {
      const { props } = getImageProps({ src: asset.full, alt: "", fill: true, sizes: "100vw", loader: ({ width }) => heroImageSource(asset, width) });
      const preload = new window.Image();
      preload.decoding = "async";
      preload.setAttribute("fetchpriority", "low");
      preload.sizes = props.sizes || "100vw";
      if (props.srcSet) preload.srcset = props.srcSet;
      preload.src = props.src;
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [activeSlide, pageVisible, slides]);

  function showSlide(index: number) {
    setHasInteracted(true);
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClickCapture={() => setHasInteracted(true)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
      }}
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
        setHasInteracted(true);
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null || slides.length < 2) return;
        const endX = event.changedTouches[0]?.clientX;
        if (endX === undefined) { touchStartX.current = null; return; }
        const distance = endX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) >= 50) showSlide(activeSlide + (distance < 0 ? 1 : -1));
      }}
      onTouchCancel={() => { touchStartX.current = null; }}
    >
      <HeroBackground image={slideImage} priority={activeSlide === 0} />
      {slides.length > 1 ? <p id="hero-carousel-instructions" className="sr-only">Slides change automatically. Hover, focus or click to pause. Use the left and right arrow keys to change slides.</p> : null}
      {slides.length > 1 ? <p className="sr-only" aria-live={isPlaying ? "off" : "polite"} aria-atomic="true">{slide.title}</p> : null}
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
                  aria-label={`Show ${item.title}`}
                  aria-current={activeSlide === index ? "true" : undefined}
                  className="flex h-11 w-9 items-center justify-center rounded-card focus-visible:outline-white sm:w-11"
                  onClick={() => showSlide(index)}
                >
                  <span aria-hidden="true" className={`h-1.5 rounded-full transition-all ${activeSlide === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
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
