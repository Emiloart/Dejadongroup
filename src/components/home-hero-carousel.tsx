"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { heroMedia } from "@/lib/hero-media";
import { ButtonLink } from "@/components/button-link";
import { HeroBackground } from "@/components/hero-background";
import type { HeroSlide } from "@/types/site";

const slideDelay = 7500;
const transitionDuration = 500;
const slideImages = {
  "Welcome to De Jadon Group": heroMedia.main,
  Agriculture: heroMedia.agriculture,
  "Agro-Real Estate": heroMedia.agroRealEstate,
  Flexisave: heroMedia.flexisave
};

export function HomeHeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [outgoingSlide, setOutgoingSlide] = useState<number | null>(null);
  const [pendingSlide, setPendingSlide] = useState<{ index: number; manual: boolean } | null>(null);
  const [imageSlides, setImageSlides] = useState<number[]>([0]);
  const [readySlides, setReadySlides] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const slide = slides[activeSlide] ?? slides[0];
  const isPlaying = slides.length > 1 && !isHovered && !hasFocus && !hasInteracted && !reducedMotion && pageVisible && readySlides.includes(activeSlide);

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

  function prepareSlide(index: number, manual: boolean) {
    if (!slides.length) return;
    const target = (index + slides.length) % slides.length;
    if (manual) setHasInteracted(true);
    setImageSlides((current) => current.includes(target) ? current : [...current, target]);
    setPendingSlide(target === activeSlide ? null : { index: target, manual });
  }

  useEffect(() => {
    if (!isPlaying || pendingSlide || outgoingSlide !== null) return;
    const timeout = window.setTimeout(() => {
      const index = (activeSlide + 1) % slides.length;
      setImageSlides((current) => current.includes(index) ? current : [...current, index]);
      setPendingSlide({ index, manual: false });
    }, slideDelay);
    return () => window.clearTimeout(timeout);
  }, [activeSlide, isPlaying, slides.length, pendingSlide, outgoingSlide]);

  useEffect(() => {
    if (!pageVisible || slides.length < 2) return;
    // Mount just the next responsive image at low priority. Its own onLoad runs
    // after Next/Image decodes the selected candidate, including on slow links.
    const timer = window.setTimeout(() => {
      const index = (activeSlide + 1) % slides.length;
      setImageSlides((current) => current.includes(index) ? current : [...current, index]);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [activeSlide, pageVisible, slides.length]);

  useEffect(() => {
    if (!pendingSlide || !readySlides.includes(pendingSlide.index)) return;
    if (outgoingSlide !== null) return;
    if (!pendingSlide.manual && !isPlaying) return;
    setOutgoingSlide(reducedMotion ? null : activeSlide);
    setActiveSlide(pendingSlide.index);
    setPendingSlide(null);
  }, [pendingSlide, readySlides, activeSlide, isPlaying, reducedMotion, outgoingSlide]);

  useEffect(() => {
    if (outgoingSlide === null) return;
    if (reducedMotion) { setOutgoingSlide(null); return; }
    const timer = window.setTimeout(() => setOutgoingSlide(null), transitionDuration);
    return () => window.clearTimeout(timer);
  }, [outgoingSlide, activeSlide, reducedMotion]);

  function showSlide(index: number) {
    prepareSlide(index, true);
  }

  function moveSlide(direction: number) {
    showSlide((pendingSlide?.index ?? activeSlide) + direction);
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
          moveSlide(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          moveSlide(1);
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
        if (Math.abs(distance) >= 50) moveSlide(distance < 0 ? 1 : -1);
      }}
      onTouchCancel={() => { touchStartX.current = null; }}
    >
      {slides.length > 1 ? <p id="hero-carousel-instructions" className="sr-only">Slides change automatically. Hover, focus or click to pause. Use the left and right arrow keys to change slides.</p> : null}
      {slides.length > 1 ? <p className="sr-only" aria-live={isPlaying ? "off" : "polite"} aria-atomic="true">{slide.title}</p> : null}
      <div className="grid">
        {slides.map((item, index) => {
          const active = activeSlide === index;
          const visible = active || outgoingSlide === index;
          const Heading = active ? "h1" : "h2";
          const image = slideImages[item.title as keyof typeof slideImages] ?? heroMedia.main;
          return (
            <div
              key={item.title}
              data-hero-slide={item.title}
              data-active={active}
              aria-hidden={!active}
              ref={(element) => { if (element) element.inert = !active; }}
              className={`relative isolate col-start-1 row-start-1 transition-opacity duration-500 ease-in-out motion-reduce:transition-none ${active ? "z-10" : "z-0"} ${visible ? "visible opacity-100" : "invisible opacity-0"}`}
            >
              {imageSlides.includes(index) ? <HeroBackground
                image={image}
                priority={index === 0}
                loading={index === 0 ? undefined : "eager"}
                fetchPriority={active || pendingSlide?.index === index ? "high" : "low"}
                onLoad={() => setReadySlides((current) => current.includes(index) ? current : [...current, index])}
                onError={() => {
                  // Retain the complete current slide on failure. A later manual
                  // selection or autoplay attempt can retry this image.
                  setPendingSlide((current) => current?.index === index ? null : current);
                  setReadySlides((current) => current.filter((value) => value !== index));
                  setImageSlides((current) => current.filter((value) => value !== index));
                }}
              /> : null}
              <div className="mx-auto flex min-h-[600px] w-full max-w-7xl items-center px-5 pb-28 pt-10 sm:min-h-[640px] sm:px-6 lg:min-h-[680px] lg:px-8 lg:pt-16">
                <div className="max-w-2xl py-8 [text-shadow:0_1px_6px_rgb(0_0_0_/_0.25)]">
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${item.accent === "green" ? "text-green-200" : "text-orange-200"}`}>{item.eyebrow}</p>
                  <Heading className="mt-5 max-w-2xl text-4xl font-normal leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">{item.title}</Heading>
                  {item.description ? <p className="mt-6 max-w-xl text-base leading-8 text-white/90 sm:text-lg">{item.description}</p> : null}
                  <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <ButtonLink href={item.primaryHref}>{item.primaryLabel}</ButtonLink>
                    <ButtonLink href={item.secondaryHref} variant="inverse">{item.secondaryLabel}</ButtonLink>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {slides.length > 1 ? (
          <div className="relative z-20 col-start-1 row-start-1 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 self-end px-5 pb-6 pt-4 sm:px-6 lg:px-8">
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
              <button type="button" aria-label="Previous slide" className="flex h-11 w-9 items-center justify-center rounded-full bg-ink/30 text-white transition-colors hover:bg-ink/50 focus-visible:outline-white sm:w-11" onClick={() => moveSlide(-1)}><ArrowLeft aria-hidden="true" className="h-5 w-5" /></button>
              <button type="button" aria-label="Next slide" className="flex h-11 w-9 items-center justify-center rounded-full bg-ink/30 text-white transition-colors hover:bg-ink/50 focus-visible:outline-white sm:w-11" onClick={() => moveSlide(1)}><ArrowRight aria-hidden="true" className="h-5 w-5" /></button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
