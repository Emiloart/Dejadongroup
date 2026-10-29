"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { BusinessCard } from "@/components/business-card";
import type { Business } from "@/types/site";

export function BusinessCarousel({ businesses }: { businesses: Business[] }) {
  const carouselId = useId();
  const trackRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ index: 0, canPrevious: false, canNext: false, scrollable: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function updatePosition() {
      if (!track) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const atEnd = maxScroll > 2 && track.scrollLeft >= maxScroll - 2;
      const cards = Array.from(track.children) as HTMLElement[];
      const index = atEnd ? cards.length - 1 : cards.reduce((nearest, card, candidate) => (
        Math.abs(card.offsetLeft - track.scrollLeft) < Math.abs((cards[nearest]?.offsetLeft ?? 0) - track.scrollLeft) ? candidate : nearest
      ), 0);
      setPosition({ index, canPrevious: track.scrollLeft > 2, canNext: track.scrollLeft < maxScroll - 2, scrollable: maxScroll > 2 });
    }

    updatePosition();
    track.addEventListener("scroll", updatePosition, { passive: true });
    const observer = new ResizeObserver(updatePosition);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", updatePosition);
      observer.disconnect();
    };
  }, [businesses.length]);

  function showBusiness(index: number) {
    const track = trackRef.current;
    const card = track?.children[Math.max(0, Math.min(index, businesses.length - 1))] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  if (!businesses.length) return null;

  return (
    <section aria-label="Business previews" aria-roledescription="carousel" className="min-w-0">
      <p id={`${carouselId}-instructions`} className="sr-only">Swipe or use the left and right arrow keys to browse businesses.</p>
      <ul
        id={carouselId}
        ref={trackRef}
        aria-describedby={position.scrollable ? `${carouselId}-instructions` : undefined}
        tabIndex={position.scrollable ? 0 : undefined}
        className="relative flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orangeAction [&::-webkit-scrollbar]:hidden"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            showBusiness(position.index + (event.key === "ArrowRight" ? 1 : -1));
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            showBusiness(event.key === "Home" ? 0 : businesses.length - 1);
          }
        }}
      >
        {businesses.map((business) => (
          <li key={business.slug} className="w-[280px] max-w-[calc(100vw-3.5rem)] shrink-0 snap-start sm:w-[calc((100%_-_1.25rem)/2)] lg:w-[calc((100%_-_2.5rem)/3)]">
            <BusinessCard business={business} />
          </li>
        ))}
      </ul>
      {position.scrollable ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center" aria-label="Choose a business preview">
            {businesses.map((business, index) => (
              <button key={business.slug} type="button" aria-label={`Show ${business.name}`} aria-current={position.index === index ? "true" : undefined} aria-controls={carouselId} onClick={() => showBusiness(index)} className="flex h-11 w-9 items-center justify-center rounded-card focus-visible:outline-orangeAction">
                <span aria-hidden="true" className={`h-1.5 rounded-full transition-all ${position.index === index ? "w-6 bg-orangeAction" : "w-1.5 bg-ink/20"}`} />
              </button>
            ))}
          </div>
          <span className="sr-only" aria-live="polite" aria-atomic="true">Business {position.index + 1} of {businesses.length}</span>
          <div className="flex gap-2">
            <button type="button" aria-label="Previous business" aria-controls={carouselId} disabled={!position.canPrevious} onClick={() => showBusiness(position.index - 1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-orangeAction hover:text-orangeAction disabled:cursor-default disabled:opacity-30"><ArrowLeft aria-hidden="true" className="h-4 w-4" /></button>
            <button type="button" aria-label="Next business" aria-controls={carouselId} disabled={!position.canNext} onClick={() => showBusiness(position.index + 1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-orangeAction hover:text-orangeAction disabled:cursor-default disabled:opacity-30"><ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
